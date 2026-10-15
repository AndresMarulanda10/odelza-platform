import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  assertValidSchema,
  buildASTSchema,
  getNamedType,
  isNonNullType,
  isObjectType,
  isEnumType,
  parse,
} from 'graphql';
import * as ts from 'typescript';
import { describe, expect, it } from 'vitest';

import {
  enumViewFilterOperand,
  type RecordTableConfiguration,
  type RecordTableConfigurationGenqlSelection,
  type ViewFilterOperand,
} from '../../metadata/generated/schema';

const generatedDirectory = resolve(__dirname, '../../metadata/generated');
const readGenerated = (name: string) =>
  readFileSync(resolve(generatedDirectory, name), 'utf8');
const schema = buildASTSchema(parse(readGenerated('schema.graphql')));
const source = ts.createSourceFile(
  'schema.ts',
  readGenerated('schema.ts'),
  ts.ScriptTarget.Latest,
  true,
);

const getInterfaceFields = (name: string) => {
  const declaration = source.statements.find(
    (statement): statement is ts.InterfaceDeclaration =>
      ts.isInterfaceDeclaration(statement) && statement.name.text === name,
  );
  if (!declaration) throw new Error(`Missing generated interface: ${name}`);
  return new Map(
    declaration.members.flatMap((member) =>
      ts.isPropertySignature(member) &&
      ts.isIdentifier(member.name) &&
      !member.name.text.startsWith('__')
        ? [[member.name.text, member] as const]
        : [],
    ),
  );
};

describe('generated metadata RecordTable and native filter contracts', () => {
  it('keeps the before-today operand consistent in SDL, its union and the runtime export', () => {
    const operand = schema.getType('ViewFilterOperand');
    if (!isEnumType(operand)) throw new Error('Missing SDL operand enum');
    const expectedValues = operand.getValues().map((value) => value.name);
    const declaration = source.statements.find(
      (statement): statement is ts.TypeAliasDeclaration =>
        ts.isTypeAliasDeclaration(statement) &&
        statement.name.text === 'ViewFilterOperand',
    );
    if (!declaration || !ts.isUnionTypeNode(declaration.type)) {
      throw new Error('Missing generated operand union');
    }
    const unionValues = declaration.type.types.map((member) => {
      if (
        !ts.isLiteralTypeNode(member) ||
        !ts.isStringLiteral(member.literal)
      ) {
        throw new Error('Expected a generated string-literal operand');
      }
      return member.literal.text;
    });
    const beforeToday: ViewFilterOperand =
      enumViewFilterOperand.IS_BEFORE_TODAY;
    expect(beforeToday).toBe('IS_BEFORE_TODAY');
    expect(unionValues).toEqual(expectedValues);
    expect(Object.keys(enumViewFilterOperand)).toEqual(expectedValues);
    expect(Object.values(enumViewFilterOperand)).toEqual(expectedValues);
  });

  it('exposes every SDL field through result and typed selection interfaces', () => {
    assertValidSchema(schema);
    const configuration = schema.getType('RecordTableConfiguration');
    if (!isObjectType(configuration)) throw new Error('Missing SDL object');
    const fields = configuration.getFields();
    const resultFields = getInterfaceFields('RecordTableConfiguration');
    const selectionFields = getInterfaceFields(
      'RecordTableConfigurationGenqlSelection',
    );
    expect([...resultFields.keys()].sort()).toEqual(Object.keys(fields).sort());
    expect([...selectionFields.keys()].sort()).toEqual(
      Object.keys(fields).sort(),
    );
    for (const [name, field] of Object.entries(fields)) {
      expect(Boolean(resultFields.get(name)?.questionToken)).toBe(
        !isNonNullType(field.type),
      );
      expect(selectionFields.get(name)?.type?.getText(source)).toBe(
        'boolean | number',
      );
    }

    const selection = {
      configurationType: true,
      viewId: true,
      recordLimit: true,
      presentationMode: true,
    } satisfies RecordTableConfigurationGenqlSelection;
    const result: Pick<
      RecordTableConfiguration,
      'recordLimit' | 'presentationMode'
    > = { recordLimit: 5, presentationMode: 'OVERDUE_ATTENTION' };
    expect(selection.recordLimit).toBe(true);
    expect(selection.presentationMode).toBe(true);
    expect(result).toEqual({
      recordLimit: 5,
      presentationMode: 'OVERDUE_ATTENTION',
    });
  });

  it('maps every SDL field to the correct Genql runtime scalar or enum index', () => {
    const runtimeSource = ts.createSourceFile(
      'types.ts',
      readGenerated('types.ts'),
      ts.ScriptTarget.Latest,
      true,
    );
    const assignment = runtimeSource.statements.find(ts.isExportAssignment);
    if (!assignment || !ts.isObjectLiteralExpression(assignment.expression)) {
      throw new Error('Missing generated runtime type map');
    }
    const runtime = JSON.parse(
      assignment.expression.getText(runtimeSource),
    ) as {
      scalars: number[];
      types: Record<string, Record<string, number[]>>;
    };
    const configuration = schema.getType('RecordTableConfiguration');
    if (!isObjectType(configuration)) throw new Error('Missing SDL object');
    const fields = configuration.getFields();
    const runtimeFields = runtime.types.RecordTableConfiguration;
    expect(
      Object.keys(runtimeFields)
        .filter((name) => !name.startsWith('__'))
        .sort(),
    ).toEqual(Object.keys(fields).sort());
    for (const [name, field] of Object.entries(fields)) {
      const index = runtimeFields[name][0];
      expect(Object.keys(runtime.types)[index]).toBe(
        getNamedType(field.type).name,
      );
      expect(runtime.scalars).toContain(index);
    }
  });
});
