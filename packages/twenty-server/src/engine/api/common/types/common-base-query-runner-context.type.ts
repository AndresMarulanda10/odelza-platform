import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { z } from 'zod';

// Internal execution context only. Never construct this from public query arguments.
export const internalRolePermissionConfigSchema = z.union([
  z.object({ intersectionOf: z.array(z.string().min(1)).min(1) }).strict(),
  z.object({ unionOf: z.array(z.string().min(1)).length(1) }).strict(),
  z.object({ shouldBypassPermissionChecks: z.literal(true) }).strict(),
]);

export type CommonBaseQueryRunnerContext = {
  rolePermissionConfig?: RolePermissionConfig;
  authContext: WorkspaceAuthContext;
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatIndexMaps?: FlatEntityMaps<FlatIndexMetadata>;
  objectIdByNameSingular: Record<string, string>;
};
