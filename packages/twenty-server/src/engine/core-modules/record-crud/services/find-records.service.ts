import { Injectable, Logger } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { OrderByDirection, type ObjectRecord } from 'twenty-shared/types';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { isNonEmptyArray } from '@sniptt/guards';
import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { type FindRecordsParams } from 'src/engine/core-modules/record-crud/types/find-records-params.type';
import { type FindRecordsResult } from 'src/engine/core-modules/record-crud/types/find-records-result.type';
import { buildEffectiveSelectedFields } from 'src/engine/core-modules/record-crud/utils/build-effective-selected-fields.util';
import { getRecordDisplayName } from 'src/engine/core-modules/record-crud/utils/get-record-display-name.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { isDefined } from 'twenty-shared/utils';
import { decodeCursor } from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { hasRelationFieldInOrderBy } from 'src/engine/api/utils/validate-and-get-order-by.utils';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';

const assertConsistentOrderDirections = (orderBy: ObjectRecordOrderBy) => {
  const directionsByPath = new Map<string, unknown>();
  const visit = (entry: Record<string, unknown>, parentPath: string[] = []) => {
    for (const [field, direction] of Object.entries(entry)) {
      if (direction === undefined) continue;
      const path = [...parentPath, field];
      if (
        typeof direction === 'object' &&
        direction !== null &&
        !Array.isArray(direction)
      ) {
        visit(direction as Record<string, unknown>, path);
        continue;
      }
      // Segment encoding avoids conflating a literal dotted name with a nested path.
      const key = JSON.stringify(path);
      if (
        directionsByPath.has(key) &&
        directionsByPath.get(key) !== direction
      ) {
        throw new Error(`Conflicting order directions for ${path.join('.')}`);
      }
      directionsByPath.set(key, direction);
    }
  };
  // Equivalent duplicates remain valid; differing direction OR null placement does not.
  for (const entry of orderBy) visit(entry);
};

@Injectable()
export class FindRecordsService {
  private readonly logger = new Logger(FindRecordsService.name);

  constructor(
    private readonly commonFindManyRunner: CommonFindManyQueryRunnerService,
    private readonly commonApiContextBuilder: CommonApiContextBuilderService,
  ) {}

  async execute(
    params: FindRecordsParams,
  ): Promise<ToolOutput<FindRecordsResult>> {
    const {
      objectName,
      filter,
      orderBy,
      limit,
      offset = 0,
      after,
      authContext,
      select,
      shouldBuildEffectiveSelectFields,
    } = params;

    if (shouldBuildEffectiveSelectFields && !isNonEmptyArray(select)) {
      return {
        success: false,
        message: 'Select at least one field in select parameter',
        error: 'Select is required',
      };
    }

    try {
      if (limit !== undefined && (!Number.isSafeInteger(limit) || limit <= 0)) {
        throw new Error('Limit must be a positive safe integer');
      }
      if (!Number.isSafeInteger(offset) || offset < 0) {
        throw new Error('Offset must be a nonnegative safe integer');
      }
      if (
        after !== undefined &&
        (typeof after !== 'string' || !after.length || offset !== 0)
      ) {
        throw new Error(
          'After must be a nonempty cursor and cannot be combined with a nonzero offset',
        );
      }
      const {
        queryRunnerContext,
        selectedFields: allSelectableFields,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      } = await this.commonApiContextBuilder.build({
        authContext,
        objectName,
      });

      const { effectiveSelectedFields, warnings } =
        shouldBuildEffectiveSelectFields && isDefined(select)
          ? buildEffectiveSelectedFields({
              select,
              filter,
              orderBy,
              objectName,
              flatObjectMetadata,
              flatFieldMetadataMaps,
              selectedFields: allSelectableFields,
            })
          : { effectiveSelectedFields: allSelectableFields, warnings: [] };

      // Keep the caller's ID direction; append a tiebreaker only if absent.
      const orderByWithIdCondition: ObjectRecordOrderBy = [
        ...(orderBy ?? []).filter((item) => item !== undefined),
        ...((orderBy ?? []).some((item) => item?.id !== undefined)
          ? []
          : [{ id: OrderByDirection.AscNullsFirst }]),
      ];
      assertConsistentOrderDirections(orderByWithIdCondition);

      if (after !== undefined) {
        const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
          flatFieldMetadataMaps,
          flatObjectMetadata,
        );
        if (
          hasRelationFieldInOrderBy(
            orderByWithIdCondition,
            flatFieldMetadataMaps,
            fieldIdByName,
          )
        ) {
          throw new Error(
            'Cursor pagination does not support relation ordering; use offset pagination',
          );
        }
        if (Buffer.from(after, 'base64').toString('base64') !== after) {
          throw new Error('Invalid cursor encoding');
        }
        const cursor = decodeCursor<Record<string, unknown>>(after);
        const orderedFields = [
          ...new Set(orderByWithIdCondition.flatMap(Object.keys)),
        ];
        if (
          !cursor ||
          typeof cursor !== 'object' ||
          Array.isArray(cursor) ||
          typeof cursor.id !== 'string' ||
          !cursor.id.length ||
          orderedFields.some(
            (field) => !(field in cursor) || !effectiveSelectedFields[field],
          ) ||
          Object.keys(cursor).some((field) => !orderedFields.includes(field))
        ) {
          throw new Error(
            'Cursor must contain exactly the selectable ordering fields and ID',
          );
        }
      }

      const {
        results: { records, totalCount, pageInfo },
      } = await this.commonFindManyRunner.execute(
        {
          filter,
          orderBy: orderByWithIdCondition,
          first: limit ? Math.min(limit, QUERY_MAX_RECORDS) : QUERY_MAX_RECORDS,
          offset,
          after,
          selectedFields: { ...effectiveSelectedFields, totalCount: true },
        },
        queryRunnerContext,
      );

      // PostgreSQL COUNT may be a string. Never substitute the current page size.
      const count =
        typeof totalCount === 'string' && /^\d+$/.test(totalCount)
          ? Number(totalCount)
          : totalCount;
      if (!Number.isSafeInteger(count) || count < 0) {
        throw new Error(
          'Matching record count exceeds the safe integer contract',
        );
      }

      this.logger.log(`Found ${records.length} records in ${objectName}`);

      const recordReferences = records.map((record: ObjectRecord) => ({
        objectNameSingular: objectName,
        recordId: record.id as string,
        displayName: getRecordDisplayName(
          record,
          flatObjectMetadata,
          flatFieldMetadataMaps,
        ),
      }));

      return {
        success: true,
        message: `Found ${records.length} ${objectName} records`,
        result: {
          records,
          count,
          pageInfo,
        },
        ...(isNonEmptyArray(warnings) ? { warnings: warnings } : {}),
        recordReferences,
      };
    } catch (error) {
      this.logger.error(`Failed to find records: ${error}`);

      return {
        success: false,
        message: `Failed to find ${objectName} records`,
        error:
          error instanceof Error ? error.message : 'Failed to find records',
      };
    }
  }
}
