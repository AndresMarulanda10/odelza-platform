export default {
    "scalars": [
        1,
        3,
        4,
        6,
        7,
        9,
        12,
        13,
        15,
        18,
        21,
        22,
        23,
        24,
        36,
        37,
        42,
        44,
        46,
        49,
        56,
        58,
        60,
        63,
        67,
        68,
        69,
        70,
        71,
        73,
        74,
        76,
        77,
        85,
        88,
        93,
        94,
        97,
        98,
        100,
        103,
        104,
        110,
        127,
        138,
        139,
        140,
        142,
        151,
        164,
        167,
        169,
        173,
        175,
        182,
        183,
        190,
        193,
        196,
        207,
        220,
        237,
        243,
        277,
        279,
        280,
        281,
        282,
        283,
        284,
        285,
        292,
        332,
        333,
        334,
        335,
        337,
        339,
        351,
        358,
        365,
        366,
        493
    ],
    "types": {
        "BillingProductDTO": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "images": [
                1
            ],
            "metadata": [
                137
            ],
            "on_BillingLicensedProduct": [
                146
            ],
            "on_BillingMeteredProduct": [
                147
            ],
            "__typename": [
                1
            ]
        },
        "String": {},
        "ApiKey": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "expiresAt": [
                4
            ],
            "revokedAt": [
                4
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "role": [
                29
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "DateTime": {},
        "ApplicationRegistrationVariable": {
            "id": [
                3
            ],
            "key": [
                1
            ],
            "description": [
                1
            ],
            "isSecret": [
                6
            ],
            "isRequired": [
                6
            ],
            "type": [
                1
            ],
            "options": [
                7
            ],
            "isFilled": [
                6
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "JSON": {},
        "ApplicationRegistration": {
            "id": [
                3
            ],
            "universalIdentifier": [
                1
            ],
            "name": [
                1
            ],
            "oAuthClientId": [
                1
            ],
            "oAuthRedirectUris": [
                1
            ],
            "oAuthScopes": [
                1
            ],
            "ownerWorkspaceId": [
                3
            ],
            "sourceType": [
                9
            ],
            "sourcePackage": [
                1
            ],
            "latestAvailableVersion": [
                1
            ],
            "isListed": [
                6
            ],
            "isVetted": [
                6
            ],
            "isPreInstalled": [
                6
            ],
            "logoUrl": [
                1
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "isConfigured": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSourceType": {},
        "TwoFactorAuthenticationMethodSummary": {
            "twoFactorAuthenticationMethodId": [
                3
            ],
            "status": [
                1
            ],
            "strategy": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateGroup": {
            "id": [
                1
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                1
            ],
            "logicalOperator": [
                13
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                12
            ],
            "roleId": [
                1
            ],
            "objectMetadataId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Float": {},
        "RowLevelPermissionPredicateGroupLogicalOperator": {},
        "RowLevelPermissionPredicate": {
            "id": [
                1
            ],
            "fieldMetadataId": [
                1
            ],
            "objectMetadataId": [
                1
            ],
            "operand": [
                15
            ],
            "subFieldName": [
                1
            ],
            "workspaceMemberFieldMetadataId": [
                1
            ],
            "workspaceMemberSubFieldName": [
                1
            ],
            "rowLevelPermissionPredicateGroupId": [
                1
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                12
            ],
            "roleId": [
                1
            ],
            "value": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateOperand": {},
        "ObjectPermission": {
            "objectMetadataId": [
                3
            ],
            "canReadObjectRecords": [
                6
            ],
            "canUpdateObjectRecords": [
                6
            ],
            "canSoftDeleteObjectRecords": [
                6
            ],
            "canDestroyObjectRecords": [
                6
            ],
            "restrictedFields": [
                7
            ],
            "rowLevelPermissionPredicates": [
                14
            ],
            "rowLevelPermissionPredicateGroups": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "id": [
                3
            ],
            "user": [
                75
            ],
            "userId": [
                3
            ],
            "locale": [
                1
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "deletedAt": [
                4
            ],
            "permissionFlags": [
                18
            ],
            "objectPermissions": [
                16
            ],
            "objectsPermissions": [
                16
            ],
            "twoFactorAuthenticationMethodSummary": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "FullName": {
            "firstName": [
                1
            ],
            "lastName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMember": {
            "id": [
                3
            ],
            "name": [
                19
            ],
            "userEmail": [
                1
            ],
            "colorScheme": [
                1
            ],
            "avatarUrl": [
                1
            ],
            "locale": [
                1
            ],
            "calendarStartDay": [
                21
            ],
            "timeZone": [
                1
            ],
            "dateFormat": [
                22
            ],
            "timeFormat": [
                23
            ],
            "roles": [
                29
            ],
            "userWorkspaceId": [
                3
            ],
            "numberFormat": [
                24
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "WorkspaceMemberDateFormatEnum": {},
        "WorkspaceMemberTimeFormatEnum": {},
        "WorkspaceMemberNumberFormatEnum": {},
        "Agent": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "description": [
                1
            ],
            "prompt": [
                1
            ],
            "modelId": [
                1
            ],
            "responseFormat": [
                7
            ],
            "roleId": [
                3
            ],
            "isCustom": [
                6
            ],
            "applicationId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "modelConfiguration": [
                7
            ],
            "evaluationInputs": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "FieldPermission": {
            "id": [
                3
            ],
            "objectMetadataId": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "roleId": [
                3
            ],
            "canReadFieldValue": [
                6
            ],
            "canUpdateFieldValue": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "RolePermissionFlag": {
            "id": [
                3
            ],
            "roleId": [
                3
            ],
            "flag": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "expiresAt": [
                4
            ],
            "revokedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "Role": {
            "id": [
                3
            ],
            "universalIdentifier": [
                3
            ],
            "label": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "isEditable": [
                6
            ],
            "canBeAssignedToUsers": [
                6
            ],
            "canBeAssignedToAgents": [
                6
            ],
            "canBeAssignedToApiKeys": [
                6
            ],
            "workspaceMembers": [
                20
            ],
            "agents": [
                25
            ],
            "apiKeys": [
                28
            ],
            "canUpdateAllSettings": [
                6
            ],
            "canAccessAllTools": [
                6
            ],
            "canReadAllObjectRecords": [
                6
            ],
            "canUpdateAllObjectRecords": [
                6
            ],
            "canSoftDeleteAllObjectRecords": [
                6
            ],
            "canDestroyAllObjectRecords": [
                6
            ],
            "permissionFlags": [
                27
            ],
            "objectPermissions": [
                16
            ],
            "fieldPermissions": [
                26
            ],
            "rowLevelPermissionPredicates": [
                14
            ],
            "rowLevelPermissionPredicateGroups": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                3
            ],
            "latestAvailableVersion": [
                1
            ],
            "sourceType": [
                9
            ],
            "logoUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationVariable": {
            "id": [
                3
            ],
            "key": [
                1
            ],
            "value": [
                1
            ],
            "description": [
                1
            ],
            "isSecret": [
                6
            ],
            "type": [
                1
            ],
            "options": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "token": [
                1
            ],
            "expiresAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationTokenPair": {
            "applicationAccessToken": [
                32
            ],
            "applicationRefreshToken": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponent": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "sourceComponentPath": [
                1
            ],
            "builtComponentPath": [
                1
            ],
            "componentName": [
                1
            ],
            "builtComponentChecksum": [
                1
            ],
            "universalIdentifier": [
                3
            ],
            "applicationId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "isHeadless": [
                6
            ],
            "usesSdkClient": [
                6
            ],
            "applicationTokenPair": [
                33
            ],
            "applicationVariables": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItem": {
            "id": [
                3
            ],
            "workflowVersionId": [
                3
            ],
            "frontComponentId": [
                3
            ],
            "frontComponent": [
                34
            ],
            "engineComponentKey": [
                36
            ],
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "shortLabel": [
                1
            ],
            "position": [
                12
            ],
            "isPinned": [
                6
            ],
            "availabilityType": [
                37
            ],
            "payload": [
                38
            ],
            "hotKeys": [
                1
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "availabilityObjectMetadataId": [
                3
            ],
            "pageLayoutId": [
                3
            ],
            "universalIdentifier": [
                3
            ],
            "applicationId": [
                3
            ],
            "isActive": [
                6
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "EngineComponentKey": {},
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_PathCommandMenuItemPayload": [
                39
            ],
            "on_ObjectMetadataCommandMenuItemPayload": [
                40
            ],
            "__typename": [
                1
            ]
        },
        "PathCommandMenuItemPayload": {
            "path": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunction": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "runtime": [
                1
            ],
            "timeoutSeconds": [
                12
            ],
            "executionMode": [
                42
            ],
            "sourceHandlerPath": [
                1
            ],
            "handlerName": [
                1
            ],
            "cronTriggerSettings": [
                7
            ],
            "databaseEventTriggerSettings": [
                7
            ],
            "httpRouteTriggerSettings": [
                7
            ],
            "toolTriggerSettings": [
                7
            ],
            "workflowActionTriggerSettings": [
                7
            ],
            "applicationId": [
                3
            ],
            "universalIdentifier": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "Field": {
            "id": [
                3
            ],
            "universalIdentifier": [
                1
            ],
            "type": [
                44
            ],
            "name": [
                1
            ],
            "label": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "isActive": [
                6
            ],
            "isSystem": [
                6
            ],
            "isUIEditable": [
                6
            ],
            "isUIReadOnly": [
                6
            ],
            "isNullable": [
                6
            ],
            "isUnique": [
                6
            ],
            "defaultValue": [
                7
            ],
            "options": [
                7
            ],
            "settings": [
                7
            ],
            "objectMetadataId": [
                3
            ],
            "isLabelSyncedWithName": [
                6
            ],
            "morphId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "applicationId": [
                3
            ],
            "relation": [
                206
            ],
            "morphRelations": [
                206
            ],
            "object": [
                47
            ],
            "__typename": [
                1
            ]
        },
        "FieldMetadataType": {},
        "Index": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "isCustom": [
                6
            ],
            "isUnique": [
                6
            ],
            "indexWhereClause": [
                1
            ],
            "indexType": [
                46
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "indexFieldMetadataList": [
                208
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "Object": {
            "id": [
                3
            ],
            "universalIdentifier": [
                1
            ],
            "nameSingular": [
                1
            ],
            "namePlural": [
                1
            ],
            "labelSingular": [
                1
            ],
            "labelPlural": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "shortcut": [
                1
            ],
            "color": [
                1
            ],
            "isRemote": [
                6
            ],
            "isActive": [
                6
            ],
            "isSystem": [
                6
            ],
            "isUIEditable": [
                6
            ],
            "isUICreatable": [
                6
            ],
            "isUIReadOnly": [
                6
            ],
            "isSearchable": [
                6
            ],
            "applicationId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "labelIdentifierFieldMetadataId": [
                3
            ],
            "imageIdentifierFieldMetadataId": [
                3
            ],
            "isLabelSyncedWithName": [
                6
            ],
            "duplicateCriteria": [
                1
            ],
            "fieldsList": [
                43
            ],
            "indexMetadataList": [
                45
            ],
            "searchFieldMetadataList": [
                210
            ],
            "fields": [
                217,
                {
                    "paging": [
                        48,
                        "CursorPaging!"
                    ],
                    "filter": [
                        50,
                        "FieldFilter!"
                    ]
                }
            ],
            "indexMetadatas": [
                215,
                {
                    "paging": [
                        48,
                        "CursorPaging!"
                    ],
                    "filter": [
                        53,
                        "IndexFilter!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "CursorPaging": {
            "before": [
                49
            ],
            "after": [
                49
            ],
            "first": [
                21
            ],
            "last": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "FieldFilter": {
            "and": [
                50
            ],
            "or": [
                50
            ],
            "id": [
                51
            ],
            "isActive": [
                52
            ],
            "isSystem": [
                52
            ],
            "isUIEditable": [
                52
            ],
            "isUIReadOnly": [
                52
            ],
            "objectMetadataId": [
                51
            ],
            "__typename": [
                1
            ]
        },
        "UUIDFilterComparison": {
            "is": [
                6
            ],
            "isNot": [
                6
            ],
            "eq": [
                3
            ],
            "neq": [
                3
            ],
            "gt": [
                3
            ],
            "gte": [
                3
            ],
            "lt": [
                3
            ],
            "lte": [
                3
            ],
            "like": [
                3
            ],
            "notLike": [
                3
            ],
            "iLike": [
                3
            ],
            "notILike": [
                3
            ],
            "in": [
                3
            ],
            "notIn": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "BooleanFieldComparison": {
            "is": [
                6
            ],
            "isNot": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                53
            ],
            "or": [
                53
            ],
            "id": [
                51
            ],
            "isCustom": [
                52
            ],
            "__typename": [
                1
            ]
        },
        "Application": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "logo": [
                1
            ],
            "logoFileId": [
                3
            ],
            "version": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                3
            ],
            "yarnLockChecksum": [
                1
            ],
            "yarnLockFileId": [
                3
            ],
            "availablePackages": [
                7
            ],
            "applicationRegistrationId": [
                3
            ],
            "canBeUninstalled": [
                6
            ],
            "defaultRoleId": [
                1
            ],
            "settingsCustomTabFrontComponentId": [
                3
            ],
            "defaultLogicFunctionRole": [
                29
            ],
            "agents": [
                25
            ],
            "frontComponents": [
                34
            ],
            "commandMenuItems": [
                35
            ],
            "logicFunctions": [
                41
            ],
            "objects": [
                47
            ],
            "applicationVariables": [
                31
            ],
            "applicationRegistration": [
                30
            ],
            "__typename": [
                1
            ]
        },
        "ViewField": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "isVisible": [
                6
            ],
            "size": [
                12
            ],
            "position": [
                12
            ],
            "aggregateOperation": [
                56
            ],
            "viewId": [
                3
            ],
            "viewFieldGroupId": [
                3
            ],
            "workspaceId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "isActive": [
                6
            ],
            "deletedAt": [
                4
            ],
            "isOverridden": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "AggregateOperations": {},
        "ViewFilterGroup": {
            "id": [
                3
            ],
            "parentViewFilterGroupId": [
                3
            ],
            "logicalOperator": [
                58
            ],
            "positionInViewFilterGroup": [
                12
            ],
            "viewId": [
                3
            ],
            "workspaceId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "deletedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilter": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "operand": [
                60
            ],
            "value": [
                7
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                12
            ],
            "subFieldName": [
                1
            ],
            "relationTargetFieldMetadataId": [
                3
            ],
            "viewId": [
                3
            ],
            "workspaceId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "deletedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterOperand": {},
        "ViewGroup": {
            "id": [
                3
            ],
            "isVisible": [
                6
            ],
            "fieldValue": [
                1
            ],
            "position": [
                12
            ],
            "viewId": [
                3
            ],
            "workspaceId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "deletedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ViewSort": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "direction": [
                63
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                3
            ],
            "workspaceId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "deletedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ViewSortDirection": {},
        "ViewFieldGroup": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "position": [
                12
            ],
            "isVisible": [
                6
            ],
            "viewId": [
                3
            ],
            "workspaceId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "isActive": [
                6
            ],
            "deletedAt": [
                4
            ],
            "viewFields": [
                55
            ],
            "isOverridden": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "ViewTimelineConfiguration": {
            "startDateFieldMetadataUniversalIdentifier": [
                3
            ],
            "endDateFieldMetadataUniversalIdentifier": [
                3
            ],
            "barColor": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "View": {
            "timelineConfiguration": [
                65
            ],
            "id": [
                3
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                3
            ],
            "type": [
                67
            ],
            "key": [
                68
            ],
            "icon": [
                1
            ],
            "position": [
                12
            ],
            "isCompact": [
                6
            ],
            "isCustom": [
                6
            ],
            "openRecordIn": [
                69
            ],
            "kanbanAggregateOperation": [
                56
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "mainGroupByFieldMetadataId": [
                3
            ],
            "shouldHideEmptyGroups": [
                6
            ],
            "kanbanColumnWidth": [
                21
            ],
            "calendarFieldMetadataId": [
                3
            ],
            "catalogImageFieldMetadataId": [
                3
            ],
            "catalogSubtitleFieldMetadataId": [
                3
            ],
            "catalogDetailFieldMetadataId": [
                3
            ],
            "workspaceId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                70
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "deletedAt": [
                4
            ],
            "viewFields": [
                55
            ],
            "viewFilters": [
                59
            ],
            "viewFilterGroups": [
                57
            ],
            "viewSorts": [
                62
            ],
            "viewGroups": [
                61
            ],
            "viewFieldGroups": [
                64
            ],
            "visibility": [
                71
            ],
            "createdByUserWorkspaceId": [
                3
            ],
            "isActive": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "ViewType": {},
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewCalendarLayout": {},
        "ViewVisibility": {},
        "Workspace": {
            "id": [
                3
            ],
            "displayName": [
                1
            ],
            "logo": [
                1
            ],
            "logoFileId": [
                3
            ],
            "inviteHash": [
                1
            ],
            "deletedAt": [
                4
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "allowImpersonation": [
                6
            ],
            "isPublicInviteLinkEnabled": [
                6
            ],
            "workspaceDiscoverability": [
                73
            ],
            "trashRetentionDays": [
                12
            ],
            "eventLogRetentionDays": [
                12
            ],
            "workspaceMembersCount": [
                12
            ],
            "activationStatus": [
                74
            ],
            "views": [
                66
            ],
            "viewFields": [
                55
            ],
            "viewFilters": [
                59
            ],
            "viewFilterGroups": [
                57
            ],
            "viewGroups": [
                61
            ],
            "viewSorts": [
                62
            ],
            "metadataVersion": [
                12
            ],
            "databaseSchema": [
                1
            ],
            "subdomain": [
                1
            ],
            "customDomain": [
                1
            ],
            "isGoogleAuthEnabled": [
                6
            ],
            "isGoogleAuthBypassEnabled": [
                6
            ],
            "isTwoFactorAuthenticationEnforced": [
                6
            ],
            "isPasswordAuthEnabled": [
                6
            ],
            "isPasswordAuthBypassEnabled": [
                6
            ],
            "isMicrosoftAuthEnabled": [
                6
            ],
            "isMicrosoftAuthBypassEnabled": [
                6
            ],
            "isCustomDomainEnabled": [
                6
            ],
            "isInternalMessagesImportEnabled": [
                6
            ],
            "editableProfileFields": [
                1
            ],
            "defaultRole": [
                29
            ],
            "fastModel": [
                1
            ],
            "smartModel": [
                1
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "enabledAiModelIds": [
                1
            ],
            "useRecommendedModels": [
                6
            ],
            "routerModel": [
                1
            ],
            "workspaceCustomApplication": [
                54
            ],
            "featureFlags": [
                174
            ],
            "billingSubscriptions": [
                150
            ],
            "installedApplications": [
                54
            ],
            "currentBillingSubscription": [
                150
            ],
            "billingCustomer": [
                149
            ],
            "billingEntitlements": [
                236
            ],
            "hasValidSignedEnterpriseKey": [
                6
            ],
            "hasValidEnterpriseValidityToken": [
                6
            ],
            "workspaceUrls": [
                176
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceDiscoverability": {},
        "WorkspaceActivationStatus": {},
        "User": {
            "id": [
                3
            ],
            "firstName": [
                1
            ],
            "lastName": [
                1
            ],
            "email": [
                1
            ],
            "isEmailVerified": [
                6
            ],
            "disabled": [
                6
            ],
            "canImpersonate": [
                6
            ],
            "canAccessFullAdminPanel": [
                6
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "deletedAt": [
                4
            ],
            "locale": [
                1
            ],
            "workspaceMember": [
                20
            ],
            "userWorkspaces": [
                17
            ],
            "onboardingStatus": [
                76
            ],
            "currentWorkspace": [
                72
            ],
            "currentUserWorkspace": [
                17
            ],
            "userVars": [
                77
            ],
            "workspaceMembers": [
                20
            ],
            "deletedWorkspaceMembers": [
                230
            ],
            "hasPassword": [
                6
            ],
            "supportUserHash": [
                1
            ],
            "workspaces": [
                17
            ],
            "availableWorkspaces": [
                229
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStatus": {},
        "JSONObject": {},
        "CardCarouselFieldMapping": {
            "imageFieldMetadataId": [
                3
            ],
            "titleFieldMetadataId": [
                3
            ],
            "subtitleFieldMetadataId": [
                3
            ],
            "priceFieldMetadataId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                3
            ],
            "optionValue": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "PersonalFinanceSourceMapping": {
            "incomeFieldMetadataId": [
                3
            ],
            "expenseFieldMetadataId": [
                3
            ],
            "budgetFieldMetadataId": [
                3
            ],
            "assetFieldMetadataId": [
                3
            ],
            "liabilityFieldMetadataId": [
                3
            ],
            "dateFieldMetadataId": [
                3
            ],
            "categoryFieldMetadataId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "RichTextBody": {
            "blocknote": [
                1
            ],
            "markdown": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "TaskTimelineFieldMapping": {
            "titleFieldMetadataId": [
                3
            ],
            "startDateFieldMetadataId": [
                3
            ],
            "dueDateFieldMetadataId": [
                3
            ],
            "progressFieldMetadataId": [
                3
            ],
            "statusFieldMetadataId": [
                3
            ],
            "milestoneFieldMetadataId": [
                3
            ],
            "dependencyFieldMetadataId": [
                3
            ],
            "dependencyTypeFieldMetadataId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "GridPosition": {
            "row": [
                12
            ],
            "column": [
                12
            ],
            "rowSpan": [
                12
            ],
            "columnSpan": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidget": {
            "id": [
                3
            ],
            "applicationId": [
                3
            ],
            "pageLayoutTabId": [
                3
            ],
            "title": [
                1
            ],
            "type": [
                85
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                83
            ],
            "position": [
                86
            ],
            "configuration": [
                91
            ],
            "conditionalDisplay": [
                7
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "isActive": [
                6
            ],
            "deletedAt": [
                4
            ],
            "isOverridden": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "WidgetType": {},
        "PageLayoutWidgetPosition": {
            "on_PageLayoutWidgetGridPosition": [
                87
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                89
            ],
            "on_PageLayoutWidgetCanvasPosition": [
                90
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetGridPosition": {
            "layoutMode": [
                88
            ],
            "row": [
                21
            ],
            "column": [
                21
            ],
            "rowSpan": [
                21
            ],
            "columnSpan": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutWidgetVerticalListPosition": {
            "layoutMode": [
                88
            ],
            "index": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                88
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                92
            ],
            "on_StandaloneRichTextConfiguration": [
                95
            ],
            "on_PieChartConfiguration": [
                96
            ],
            "on_LineChartConfiguration": [
                99
            ],
            "on_IframeConfiguration": [
                101
            ],
            "on_BarChartConfiguration": [
                102
            ],
            "on_CalendarConfiguration": [
                105
            ],
            "on_FrontComponentConfiguration": [
                106
            ],
            "on_EmailsConfiguration": [
                107
            ],
            "on_EmailThreadConfiguration": [
                108
            ],
            "on_FieldConfiguration": [
                109
            ],
            "on_FieldRichTextConfiguration": [
                111
            ],
            "on_FieldsConfiguration": [
                112
            ],
            "on_FilesConfiguration": [
                113
            ],
            "on_NotesConfiguration": [
                114
            ],
            "on_TasksConfiguration": [
                115
            ],
            "on_TimelineConfiguration": [
                116
            ],
            "on_ViewConfiguration": [
                117
            ],
            "on_RecordTableConfiguration": [
                118
            ],
            "on_WorkflowConfiguration": [
                119
            ],
            "on_WorkflowRunConfiguration": [
                120
            ],
            "on_WorkflowVersionConfiguration": [
                121
            ],
            "on_TaskTimelineConfiguration": [
                122
            ],
            "on_PersonalFinanceConfiguration": [
                123
            ],
            "on_CardCarouselConfiguration": [
                124
            ],
            "__typename": [
                1
            ]
        },
        "AggregateChartConfiguration": {
            "configurationType": [
                93
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                56
            ],
            "label": [
                1
            ],
            "displayDataLabel": [
                6
            ],
            "numberFormat": [
                94
            ],
            "description": [
                1
            ],
            "filter": [
                7
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                21
            ],
            "prefix": [
                1
            ],
            "suffix": [
                1
            ],
            "ratioAggregateConfig": [
                79
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "ChartNumberFormat": {},
        "StandaloneRichTextConfiguration": {
            "configurationType": [
                93
            ],
            "body": [
                81
            ],
            "__typename": [
                1
            ]
        },
        "PieChartConfiguration": {
            "configurationType": [
                93
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                56
            ],
            "groupByFieldMetadataId": [
                3
            ],
            "groupBySubFieldName": [
                1
            ],
            "dateGranularity": [
                97
            ],
            "orderBy": [
                98
            ],
            "manualSortOrder": [
                1
            ],
            "displayDataLabel": [
                6
            ],
            "showCenterMetric": [
                6
            ],
            "displayLegend": [
                6
            ],
            "hideEmptyCategory": [
                6
            ],
            "splitMultiValueFields": [
                6
            ],
            "description": [
                1
            ],
            "color": [
                1
            ],
            "filter": [
                7
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordGroupByDateGranularity": {},
        "GraphOrderBy": {},
        "LineChartConfiguration": {
            "configurationType": [
                93
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                56
            ],
            "primaryAxisGroupByFieldMetadataId": [
                3
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisDateGranularity": [
                97
            ],
            "primaryAxisOrderBy": [
                98
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                3
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisGroupByDateGranularity": [
                97
            ],
            "secondaryAxisOrderBy": [
                98
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "omitNullValues": [
                6
            ],
            "splitMultiValueFields": [
                6
            ],
            "axisNameDisplay": [
                100
            ],
            "displayDataLabel": [
                6
            ],
            "displayLegend": [
                6
            ],
            "rangeMin": [
                12
            ],
            "rangeMax": [
                12
            ],
            "description": [
                1
            ],
            "color": [
                1
            ],
            "filter": [
                7
            ],
            "isStacked": [
                6
            ],
            "isCumulative": [
                6
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "IframeConfiguration": {
            "configurationType": [
                93
            ],
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "BarChartConfiguration": {
            "configurationType": [
                93
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                56
            ],
            "primaryAxisGroupByFieldMetadataId": [
                3
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisDateGranularity": [
                97
            ],
            "primaryAxisOrderBy": [
                98
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                3
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisGroupByDateGranularity": [
                97
            ],
            "secondaryAxisOrderBy": [
                98
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "omitNullValues": [
                6
            ],
            "splitMultiValueFields": [
                6
            ],
            "axisNameDisplay": [
                100
            ],
            "displayDataLabel": [
                6
            ],
            "displayLegend": [
                6
            ],
            "rangeMin": [
                12
            ],
            "rangeMax": [
                12
            ],
            "description": [
                1
            ],
            "color": [
                1
            ],
            "filter": [
                7
            ],
            "groupMode": [
                103
            ],
            "layout": [
                104
            ],
            "isCumulative": [
                6
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "BarChartGroupMode": {},
        "BarChartLayout": {},
        "CalendarConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                93
            ],
            "frontComponentId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "EmailsConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "EmailThreadConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                93
            ],
            "fieldMetadataId": [
                1
            ],
            "fieldDisplayMode": [
                110
            ],
            "viewId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldRichTextConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                93
            ],
            "viewId": [
                1
            ],
            "newFieldDefaultVisibility": [
                6
            ],
            "shouldAllowUserToSeeHiddenFields": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "FilesConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "NotesConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "ViewConfiguration": {
            "configurationType": [
                93
            ],
            "viewId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RecordTableConfiguration": {
            "configurationType": [
                93
            ],
            "viewId": [
                1
            ],
            "recordLimit": [
                21
            ],
            "presentationMode": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "TaskTimelineConfiguration": {
            "configurationType": [
                93
            ],
            "barColor": [
                1
            ],
            "fieldMapping": [
                82
            ],
            "__typename": [
                1
            ]
        },
        "PersonalFinanceConfiguration": {
            "configurationType": [
                93
            ],
            "baseCurrencyCode": [
                1
            ],
            "source": [
                80
            ],
            "__typename": [
                1
            ]
        },
        "CardCarouselConfiguration": {
            "configurationType": [
                93
            ],
            "fieldMapping": [
                78
            ],
            "cardLayout": [
                1
            ],
            "imageAspect": [
                1
            ],
            "cardRadius": [
                1
            ],
            "cardSize": [
                1
            ],
            "textAlign": [
                1
            ],
            "hoverEffect": [
                1
            ],
            "itemCount": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "id": [
                3
            ],
            "applicationId": [
                3
            ],
            "title": [
                1
            ],
            "position": [
                12
            ],
            "pageLayoutId": [
                3
            ],
            "widgets": [
                84
            ],
            "icon": [
                1
            ],
            "layoutMode": [
                88
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "isActive": [
                6
            ],
            "deletedAt": [
                4
            ],
            "isOverridden": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "type": [
                127
            ],
            "objectMetadataId": [
                3
            ],
            "tabs": [
                125
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                3
            ],
            "universalIdentifier": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "deletedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutType": {},
        "ApplicationConnectionProviderOAuthConfig": {
            "scopes": [
                1
            ],
            "isClientCredentialsConfigured": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectionProvider": {
            "id": [
                3
            ],
            "applicationId": [
                1
            ],
            "type": [
                1
            ],
            "name": [
                1
            ],
            "displayName": [
                1
            ],
            "oauth": [
                128
            ],
            "__typename": [
                1
            ]
        },
        "EnterpriseLicenseInfoDTO": {
            "isValid": [
                6
            ],
            "licensee": [
                1
            ],
            "expiresAt": [
                4
            ],
            "subscriptionId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EnterpriseSubscriptionStatusDTO": {
            "status": [
                1
            ],
            "licensee": [
                1
            ],
            "expiresAt": [
                4
            ],
            "cancelAt": [
                4
            ],
            "currentPeriodEnd": [
                4
            ],
            "isCancellationScheduled": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "ApprovedAccessDomain": {
            "id": [
                3
            ],
            "domain": [
                1
            ],
            "isValidated": [
                6
            ],
            "createdAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "FileWithSignedUrl": {
            "id": [
                3
            ],
            "path": [
                1
            ],
            "size": [
                12
            ],
            "createdAt": [
                4
            ],
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "FileUploadTarget": {
            "fileId": [
                3
            ],
            "uploadUrl": [
                1
            ],
            "contentType": [
                1
            ],
            "expiresAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionSchedulePhaseItem": {
            "price": [
                1
            ],
            "quantity": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionSchedulePhase": {
            "start_date": [
                12
            ],
            "end_date": [
                12
            ],
            "items": [
                135
            ],
            "__typename": [
                1
            ]
        },
        "BillingProductMetadata": {
            "planKey": [
                138
            ],
            "priceUsageBased": [
                139
            ],
            "productKey": [
                140
            ],
            "__typename": [
                1
            ]
        },
        "BillingPlanKey": {},
        "BillingUsageType": {},
        "BillingProductKey": {},
        "BillingPriceLicensed": {
            "recurringInterval": [
                142
            ],
            "unitAmount": [
                12
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                139
            ],
            "creditAmount": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "SubscriptionInterval": {},
        "BillingPriceTier": {
            "upTo": [
                12
            ],
            "flatAmount": [
                12
            ],
            "unitAmount": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "BillingPriceMetered": {
            "tiers": [
                143
            ],
            "recurringInterval": [
                142
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                139
            ],
            "__typename": [
                1
            ]
        },
        "BillingProduct": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "images": [
                1
            ],
            "metadata": [
                137
            ],
            "__typename": [
                1
            ]
        },
        "BillingLicensedProduct": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "images": [
                1
            ],
            "metadata": [
                137
            ],
            "prices": [
                141
            ],
            "__typename": [
                1
            ]
        },
        "BillingMeteredProduct": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "images": [
                1
            ],
            "metadata": [
                137
            ],
            "prices": [
                144
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionItem": {
            "id": [
                3
            ],
            "hasReachedCurrentPeriodCap": [
                6
            ],
            "quantity": [
                12
            ],
            "stripePriceId": [
                1
            ],
            "billingProduct": [
                0
            ],
            "__typename": [
                1
            ]
        },
        "BillingCustomer": {
            "id": [
                3
            ],
            "hasPaymentMethod": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscription": {
            "id": [
                3
            ],
            "status": [
                151
            ],
            "interval": [
                142
            ],
            "billingSubscriptionItems": [
                148
            ],
            "currentPeriodEnd": [
                4
            ],
            "metadata": [
                7
            ],
            "phases": [
                136
            ],
            "cancelAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "SubscriptionStatus": {},
        "BillingEndTrialPeriod": {
            "status": [
                151
            ],
            "hasPaymentMethod": [
                6
            ],
            "billingPortalUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "productKey": [
                140
            ],
            "periodStart": [
                4
            ],
            "periodEnd": [
                4
            ],
            "usedCredits": [
                12
            ],
            "grantedCredits": [
                12
            ],
            "rolloverCredits": [
                12
            ],
            "totalGrantedCredits": [
                12
            ],
            "unitPriceCents": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "BillingPlan": {
            "planKey": [
                138
            ],
            "baseProducts": [
                146
            ],
            "resourceCreditProducts": [
                146
            ],
            "meteredProducts": [
                147
            ],
            "__typename": [
                1
            ]
        },
        "BillingPaymentIntent": {
            "clientSecret": [
                1
            ],
            "paymentIntentType": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "BillingSession": {
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "BillingUpdate": {
            "currentBillingSubscription": [
                150
            ],
            "billingSubscriptions": [
                150
            ],
            "__typename": [
                1
            ]
        },
        "InviteSuggestion": {
            "email": [
                1
            ],
            "displayName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStepSuccess": {
            "success": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceInvitation": {
            "id": [
                3
            ],
            "email": [
                1
            ],
            "roleId": [
                3
            ],
            "expiresAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "SendInvitations": {
            "success": [
                6
            ],
            "errors": [
                1
            ],
            "result": [
                160
            ],
            "__typename": [
                1
            ]
        },
        "RecordIdentifier": {
            "id": [
                3
            ],
            "labelIdentifier": [
                1
            ],
            "imageIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItem": {
            "id": [
                3
            ],
            "userWorkspaceId": [
                3
            ],
            "targetRecordId": [
                3
            ],
            "targetObjectMetadataId": [
                3
            ],
            "viewId": [
                3
            ],
            "type": [
                164
            ],
            "name": [
                1
            ],
            "link": [
                1
            ],
            "icon": [
                1
            ],
            "color": [
                1
            ],
            "folderId": [
                3
            ],
            "pageLayoutId": [
                3
            ],
            "position": [
                12
            ],
            "applicationId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "targetRecordIdentifier": [
                162
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "ObjectRecordEventProperties": {
            "updatedFields": [
                1
            ],
            "before": [
                7
            ],
            "after": [
                7
            ],
            "diff": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "MetadataEvent": {
            "type": [
                167
            ],
            "metadataName": [
                1
            ],
            "recordId": [
                1
            ],
            "properties": [
                165
            ],
            "updatedCollectionHash": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MetadataEventAction": {},
        "ObjectRecordEvent": {
            "action": [
                169
            ],
            "objectNameSingular": [
                1
            ],
            "recordId": [
                1
            ],
            "userId": [
                1
            ],
            "workspaceMemberId": [
                1
            ],
            "properties": [
                165
            ],
            "__typename": [
                1
            ]
        },
        "DatabaseEventAction": {},
        "ObjectRecordEventWithQueryIds": {
            "queryIds": [
                1
            ],
            "objectRecordEvent": [
                168
            ],
            "__typename": [
                1
            ]
        },
        "EventSubscription": {
            "eventStreamId": [
                1
            ],
            "objectRecordEventsWithQueryIds": [
                170
            ],
            "metadataEvents": [
                166
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionResult": {
            "data": [
                7
            ],
            "logs": [
                1
            ],
            "duration": [
                12
            ],
            "status": [
                173
            ],
            "error": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionStatus": {},
        "FeatureFlag": {
            "key": [
                175
            ],
            "value": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlagKey": {},
        "WorkspaceUrls": {
            "customUrl": [
                1
            ],
            "subdomainUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationVariableDTO": {
            "id": [
                3
            ],
            "key": [
                1
            ],
            "value": [
                1
            ],
            "description": [
                1
            ],
            "isSecret": [
                6
            ],
            "isRequired": [
                6
            ],
            "isFilled": [
                6
            ],
            "type": [
                1
            ],
            "options": [
                7
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "VersionDistributionEntry": {
            "version": [
                1
            ],
            "count": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationStats": {
            "activeInstalls": [
                21
            ],
            "mostInstalledVersion": [
                1
            ],
            "versionDistribution": [
                178
            ],
            "__typename": [
                1
            ]
        },
        "BillingTrialPeriod": {
            "duration": [
                12
            ],
            "isCreditCardRequired": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "type": [
                182
            ],
            "status": [
                183
            ],
            "issuer": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "IdentityProviderType": {},
        "SSOIdentityProviderStatus": {},
        "AuthProviders": {
            "sso": [
                181
            ],
            "google": [
                6
            ],
            "magicLink": [
                6
            ],
            "password": [
                6
            ],
            "microsoft": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "AuthBypassProviders": {
            "google": [
                6
            ],
            "password": [
                6
            ],
            "microsoft": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "id": [
                3
            ],
            "authProviders": [
                184
            ],
            "authBypassProviders": [
                185
            ],
            "logo": [
                1
            ],
            "displayName": [
                1
            ],
            "workspaceUrls": [
                176
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceDataSummary": {
            "id": [
                3
            ],
            "logo": [
                1
            ],
            "displayName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "NativeModelCapabilities": {
            "webSearch": [
                6
            ],
            "twitterSearch": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "ClientAiModelConfig": {
            "modelId": [
                1
            ],
            "label": [
                1
            ],
            "modelFamily": [
                190
            ],
            "modelFamilyLabel": [
                1
            ],
            "sdkPackage": [
                1
            ],
            "inputCostPerMillionTokens": [
                12
            ],
            "outputCostPerMillionTokens": [
                12
            ],
            "nativeCapabilities": [
                188
            ],
            "isDeprecated": [
                6
            ],
            "isRecommended": [
                6
            ],
            "providerName": [
                1
            ],
            "providerLabel": [
                1
            ],
            "contextWindowTokens": [
                12
            ],
            "maxOutputTokens": [
                12
            ],
            "dataResidency": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Billing": {
            "isBillingEnabled": [
                6
            ],
            "billingUrl": [
                1
            ],
            "stripePublishableKey": [
                1
            ],
            "trialPeriods": [
                180
            ],
            "__typename": [
                1
            ]
        },
        "Support": {
            "supportDriver": [
                193
            ],
            "supportFrontChatId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SupportDriver": {},
        "Sentry": {
            "environment": [
                1
            ],
            "release": [
                1
            ],
            "dsn": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Captcha": {
            "provider": [
                196
            ],
            "siteKey": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CaptchaDriverType": {},
        "ApiConfig": {
            "mutationMaximumAffectedRecords": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "PublicFeatureFlagMetadata": {
            "label": [
                1
            ],
            "description": [
                1
            ],
            "imagePath": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "PublicFeatureFlag": {
            "key": [
                175
            ],
            "metadata": [
                198
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "startAt": [
                4
            ],
            "endAt": [
                4
            ],
            "link": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfig": {
            "appVersion": [
                1
            ],
            "authProviders": [
                184
            ],
            "billing": [
                191
            ],
            "aiModels": [
                189
            ],
            "signInPrefilled": [
                6
            ],
            "isMultiWorkspaceEnabled": [
                6
            ],
            "isEmailVerificationRequired": [
                6
            ],
            "defaultSubdomain": [
                1
            ],
            "frontDomain": [
                1
            ],
            "publicFunctionDomain": [
                1
            ],
            "analyticsEnabled": [
                6
            ],
            "support": [
                192
            ],
            "isAttachmentPreviewEnabled": [
                6
            ],
            "sentry": [
                194
            ],
            "captcha": [
                195
            ],
            "api": [
                197
            ],
            "canManageFeatureFlags": [
                6
            ],
            "publicFeatureFlags": [
                199
            ],
            "isMicrosoftMessagingEnabled": [
                6
            ],
            "isMicrosoftCalendarEnabled": [
                6
            ],
            "isGoogleMessagingEnabled": [
                6
            ],
            "isGoogleCalendarEnabled": [
                6
            ],
            "isConfigVariablesInDbEnabled": [
                6
            ],
            "isImapSmtpCaldavEnabled": [
                6
            ],
            "isEmailingDomainInDemoMode": [
                6
            ],
            "allowRequestsToTwentyIcons": [
                6
            ],
            "calendarBookingPageId": [
                1
            ],
            "isCloudflareIntegrationEnabled": [
                6
            ],
            "isClickHouseConfigured": [
                6
            ],
            "isWorkspaceSchemaDDLLocked": [
                6
            ],
            "enterpriseInstanceType": [
                1
            ],
            "maintenance": [
                200
            ],
            "__typename": [
                1
            ]
        },
        "UsageBreakdownItem": {
            "key": [
                1
            ],
            "label": [
                1
            ],
            "creditsUsed": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                8
            ],
            "clientSecret": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "logoUrl": [
                1
            ],
            "websiteUrl": [
                1
            ],
            "oAuthScopes": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RotateClientSecret": {
            "clientSecret": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "type": [
                207
            ],
            "sourceObjectMetadata": [
                47
            ],
            "targetObjectMetadata": [
                47
            ],
            "sourceFieldMetadata": [
                43
            ],
            "targetFieldMetadata": [
                43
            ],
            "__typename": [
                1
            ]
        },
        "RelationType": {},
        "IndexField": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "order": [
                12
            ],
            "subFieldName": [
                1
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordCount": {
            "objectNamePlural": [
                1
            ],
            "totalCount": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "SearchField": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "tsVectorFieldMetadataId": [
                3
            ],
            "position": [
                12
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "node": [
                47
            ],
            "cursor": [
                49
            ],
            "__typename": [
                1
            ]
        },
        "PageInfo": {
            "hasNextPage": [
                6
            ],
            "hasPreviousPage": [
                6
            ],
            "startCursor": [
                49
            ],
            "endCursor": [
                49
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "pageInfo": [
                212
            ],
            "edges": [
                211
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "node": [
                45
            ],
            "cursor": [
                49
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "pageInfo": [
                212
            ],
            "edges": [
                214
            ],
            "__typename": [
                1
            ]
        },
        "FieldEdge": {
            "node": [
                43
            ],
            "cursor": [
                49
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "pageInfo": [
                212
            ],
            "edges": [
                216
            ],
            "__typename": [
                1
            ]
        },
        "FieldConnection": {
            "pageInfo": [
                212
            ],
            "edges": [
                216
            ],
            "__typename": [
                1
            ]
        },
        "AppConnection": {
            "id": [
                220
            ],
            "providerName": [
                1
            ],
            "name": [
                1
            ],
            "handle": [
                1
            ],
            "visibility": [
                1
            ],
            "userWorkspaceId": [
                1
            ],
            "accessToken": [
                1
            ],
            "scopes": [
                1
            ],
            "authFailedAt": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "ResendEmailVerificationToken": {
            "success": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "EditSso": {
            "id": [
                3
            ],
            "type": [
                182
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                183
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceNameAndId": {
            "displayName": [
                1
            ],
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "type": [
                182
            ],
            "id": [
                3
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                183
            ],
            "workspace": [
                224
            ],
            "__typename": [
                1
            ]
        },
        "SetupSso": {
            "id": [
                3
            ],
            "type": [
                182
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                183
            ],
            "__typename": [
                1
            ]
        },
        "SSOConnection": {
            "type": [
                182
            ],
            "id": [
                3
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                183
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspace": {
            "id": [
                3
            ],
            "displayName": [
                1
            ],
            "loginToken": [
                1
            ],
            "personalInviteToken": [
                1
            ],
            "inviteHash": [
                1
            ],
            "workspaceUrls": [
                176
            ],
            "logo": [
                1
            ],
            "sso": [
                227
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                228
            ],
            "availableWorkspacesForSignUp": [
                228
            ],
            "__typename": [
                1
            ]
        },
        "DeletedWorkspaceMember": {
            "id": [
                3
            ],
            "name": [
                19
            ],
            "userEmail": [
                1
            ],
            "avatarUrl": [
                1
            ],
            "userWorkspaceId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceApp": {
            "id": [
                1
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "author": [
                1
            ],
            "category": [
                1
            ],
            "logo": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "isVetted": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceAppRoleObjectPermission": {
            "universalIdentifier": [
                1
            ],
            "objectUniversalIdentifier": [
                1
            ],
            "canReadObjectRecords": [
                6
            ],
            "canUpdateObjectRecords": [
                6
            ],
            "canSoftDeleteObjectRecords": [
                6
            ],
            "canDestroyObjectRecords": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceAppRoleFieldPermission": {
            "universalIdentifier": [
                1
            ],
            "objectUniversalIdentifier": [
                1
            ],
            "fieldUniversalIdentifier": [
                1
            ],
            "canReadFieldValue": [
                6
            ],
            "canUpdateFieldValue": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceAppRole": {
            "universalIdentifier": [
                1
            ],
            "label": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "canUpdateAllSettings": [
                6
            ],
            "canAccessAllTools": [
                6
            ],
            "canReadAllObjectRecords": [
                6
            ],
            "canUpdateAllObjectRecords": [
                6
            ],
            "canSoftDeleteAllObjectRecords": [
                6
            ],
            "canDestroyAllObjectRecords": [
                6
            ],
            "permissionFlagUniversalIdentifiers": [
                1
            ],
            "objectPermissions": [
                232
            ],
            "fieldPermissions": [
                233
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceAppDetail": {
            "universalIdentifier": [
                1
            ],
            "id": [
                1
            ],
            "name": [
                1
            ],
            "sourceType": [
                9
            ],
            "sourcePackage": [
                1
            ],
            "latestAvailableVersion": [
                1
            ],
            "isListed": [
                6
            ],
            "isVetted": [
                6
            ],
            "description": [
                1
            ],
            "author": [
                1
            ],
            "category": [
                1
            ],
            "logo": [
                1
            ],
            "websiteUrl": [
                1
            ],
            "aboutDescription": [
                1
            ],
            "termsUrl": [
                1
            ],
            "emailSupport": [
                1
            ],
            "issueReportUrl": [
                1
            ],
            "screenshots": [
                1
            ],
            "galleryImages": [
                1
            ],
            "defaultRoleUniversalIdentifier": [
                1
            ],
            "roles": [
                234
            ],
            "manifest": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                237
            ],
            "value": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlementKey": {},
        "DomainRecord": {
            "validationType": [
                1
            ],
            "type": [
                1
            ],
            "status": [
                1
            ],
            "key": [
                1
            ],
            "value": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "DomainValidRecords": {
            "id": [
                3
            ],
            "domain": [
                1
            ],
            "records": [
                238
            ],
            "isCustomDomainEnabled": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicates": [
                14
            ],
            "predicateGroups": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogs": {
            "logs": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "PublicConnectionParametersOutput": {
            "host": [
                1
            ],
            "port": [
                12
            ],
            "username": [
                1
            ],
            "connectionSecurity": [
                243
            ],
            "__typename": [
                1
            ]
        },
        "EmailConnectionSecurity": {},
        "PublicImapSmtpCaldavConnectionParameters": {
            "IMAP": [
                242
            ],
            "SMTP": [
                242
            ],
            "CALDAV": [
                242
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "id": [
                3
            ],
            "handle": [
                1
            ],
            "provider": [
                1
            ],
            "lastCredentialsRefreshedAt": [
                4
            ],
            "authFailedAt": [
                4
            ],
            "archivedAt": [
                4
            ],
            "handleAliases": [
                1
            ],
            "scopes": [
                1
            ],
            "lastSignedInAt": [
                4
            ],
            "userWorkspaceId": [
                3
            ],
            "connectionProviderId": [
                3
            ],
            "applicationId": [
                3
            ],
            "name": [
                1
            ],
            "visibility": [
                1
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "connectionParameters": [
                244
            ],
            "__typename": [
                1
            ]
        },
        "DeleteTwoFactorAuthenticationMethod": {
            "success": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "InitiateTwoFactorAuthenticationProvisioning": {
            "uri": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "VerifyTwoFactorAuthenticationMethod": {
            "success": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "AuthorizeApp": {
            "redirectUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokenPair": {
            "accessOrWorkspaceAgnosticToken": [
                32
            ],
            "refreshToken": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "tokens": [
                250
            ],
            "availableWorkspaces": [
                229
            ],
            "__typename": [
                1
            ]
        },
        "EmailPasswordResetLink": {
            "success": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "GetAuthorizationUrlForSSO": {
            "authorizationURL": [
                1
            ],
            "type": [
                1
            ],
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "InvalidatePassword": {
            "success": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceUrlsAndId": {
            "workspaceUrls": [
                176
            ],
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "SignUp": {
            "loginToken": [
                32
            ],
            "workspace": [
                255
            ],
            "__typename": [
                1
            ]
        },
        "TransientToken": {
            "transientToken": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "ValidatePasswordResetToken": {
            "id": [
                3
            ],
            "email": [
                1
            ],
            "hasPassword": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "VerifyEmailAndGetLoginToken": {
            "loginToken": [
                32
            ],
            "workspaceUrls": [
                176
            ],
            "__typename": [
                1
            ]
        },
        "SubdomainAvailabilityDTO": {
            "isValid": [
                6
            ],
            "available": [
                6
            ],
            "suggestedSubdomain": [
                1
            ],
            "suggestedSubdomains": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceCreationDefaultsDTO": {
            "displayName": [
                1
            ],
            "subdomain": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyToken": {
            "token": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                250
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "CheckUserExist": {
            "exists": [
                6
            ],
            "availableWorkspacesCount": [
                12
            ],
            "isEmailVerified": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceInviteHashValid": {
            "isValid": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "Impersonate": {
            "loginToken": [
                32
            ],
            "workspace": [
                255
            ],
            "__typename": [
                1
            ]
        },
        "UsageTimeSeries": {
            "date": [
                1
            ],
            "creditsUsed": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "UsageUserDaily": {
            "userWorkspaceId": [
                1
            ],
            "dailyUsage": [
                268
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "usageByUser": [
                202
            ],
            "usageByOperationType": [
                202
            ],
            "usageByModel": [
                202
            ],
            "timeSeries": [
                268
            ],
            "periodStart": [
                4
            ],
            "periodEnd": [
                4
            ],
            "userDailyUsage": [
                269
            ],
            "__typename": [
                1
            ]
        },
        "DevelopmentApplication": {
            "id": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMigration": {
            "applicationUniversalIdentifier": [
                1
            ],
            "actions": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "File": {
            "id": [
                3
            ],
            "path": [
                1
            ],
            "size": [
                12
            ],
            "createdAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "PublicDomain": {
            "id": [
                3
            ],
            "domain": [
                1
            ],
            "isValidated": [
                6
            ],
            "applicationId": [
                3
            ],
            "createdAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "VerificationRecord": {
            "type": [
                1
            ],
            "key": [
                1
            ],
            "value": [
                1
            ],
            "priority": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "id": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "domain": [
                1
            ],
            "status": [
                277
            ],
            "verificationRecords": [
                275
            ],
            "verifiedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "MessageChannel": {
            "id": [
                3
            ],
            "visibility": [
                279
            ],
            "handle": [
                1
            ],
            "type": [
                280
            ],
            "isContactAutoCreationEnabled": [
                6
            ],
            "contactAutoCreationPolicy": [
                281
            ],
            "messageFolderImportPolicy": [
                282
            ],
            "excludeNonProfessionalEmails": [
                6
            ],
            "excludeGroupEmails": [
                6
            ],
            "pendingGroupEmailsAction": [
                283
            ],
            "isSyncEnabled": [
                6
            ],
            "syncedAt": [
                4
            ],
            "syncStatus": [
                284
            ],
            "syncStage": [
                285
            ],
            "syncStageStartedAt": [
                4
            ],
            "throttleFailureCount": [
                12
            ],
            "throttleRetryAfter": [
                4
            ],
            "connectedAccountId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "connectedAccount": [
                245
            ],
            "__typename": [
                1
            ]
        },
        "MessageChannelVisibility": {},
        "MessageChannelType": {},
        "MessageChannelContactAutoCreationPolicy": {},
        "MessageFolderImportPolicy": {},
        "MessageChannelPendingGroupEmailsAction": {},
        "MessageChannelSyncStatus": {},
        "MessageChannelSyncStage": {},
        "CreateEmailGroupChannelOutput": {
            "messageChannel": [
                278
            ],
            "forwardingAddress": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CampaignAudiencePreviewDTO": {
            "totalMembers": [
                21
            ],
            "withoutEmail": [
                21
            ],
            "duplicateEmails": [
                21
            ],
            "globallyUnsubscribed": [
                21
            ],
            "topicUnsubscribed": [
                21
            ],
            "sendable": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "SendEmailViaDomainOutput": {
            "messageId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CampaignSkippedRecipientsDTO": {
            "noEmail": [
                21
            ],
            "deduped": [
                21
            ],
            "overCap": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "campaignId": [
                1
            ],
            "queuedCount": [
                21
            ],
            "skipped": [
                289
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeTopic": {
            "id": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "visibility": [
                292
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeTopicVisibility": {},
        "AutocompleteResult": {
            "text": [
                1
            ],
            "placeId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Location": {
            "lat": [
                12
            ],
            "lng": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "PlaceDetailsResult": {
            "street": [
                1
            ],
            "state": [
                1
            ],
            "postcode": [
                1
            ],
            "city": [
                1
            ],
            "country": [
                1
            ],
            "location": [
                294
            ],
            "__typename": [
                1
            ]
        },
        "ImapSmtpCaldavPublicConnectionParams": {
            "host": [
                1
            ],
            "port": [
                12
            ],
            "username": [
                1
            ],
            "connectionSecurity": [
                243
            ],
            "__typename": [
                1
            ]
        },
        "ImapSmtpCaldavPublicConnectionParameters": {
            "name": [
                1
            ],
            "IMAP": [
                296
            ],
            "SMTP": [
                296
            ],
            "CALDAV": [
                296
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedImapSmtpCaldavAccount": {
            "id": [
                3
            ],
            "handle": [
                1
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                3
            ],
            "connectionParameters": [
                297
            ],
            "__typename": [
                1
            ]
        },
        "ImapSmtpCaldavConnectionSuccess": {
            "success": [
                6
            ],
            "connectedAccountId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Webhook": {
            "id": [
                3
            ],
            "targetUrl": [
                1
            ],
            "operations": [
                1
            ],
            "description": [
                1
            ],
            "secret": [
                1
            ],
            "applicationId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "deletedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ToolIndexEntry": {
            "name": [
                1
            ],
            "label": [
                1
            ],
            "description": [
                1
            ],
            "category": [
                1
            ],
            "objectName": [
                1
            ],
            "icon": [
                1
            ],
            "inputSchema": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "id": [
                3
            ],
            "messageId": [
                3
            ],
            "orderIndex": [
                21
            ],
            "type": [
                1
            ],
            "textContent": [
                1
            ],
            "reasoningContent": [
                1
            ],
            "toolName": [
                1
            ],
            "toolCallId": [
                1
            ],
            "toolInput": [
                7
            ],
            "toolOutput": [
                7
            ],
            "state": [
                1
            ],
            "providerExecuted": [
                6
            ],
            "errorMessage": [
                1
            ],
            "errorDetails": [
                7
            ],
            "sourceUrlSourceId": [
                1
            ],
            "sourceUrlUrl": [
                1
            ],
            "sourceUrlTitle": [
                1
            ],
            "sourceDocumentSourceId": [
                1
            ],
            "sourceDocumentMediaType": [
                1
            ],
            "sourceDocumentTitle": [
                1
            ],
            "sourceDocumentFilename": [
                1
            ],
            "fileMediaType": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                3
            ],
            "fileUrl": [
                1
            ],
            "providerMetadata": [
                7
            ],
            "createdAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentResult": {
            "result": [
                7
            ],
            "error": [
                1
            ],
            "success": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "ChannelSyncSuccess": {
            "success": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "CreateCalendarEventOutput": {
            "success": [
                6
            ],
            "iCalUid": [
                1
            ],
            "conferenceLink": [
                1
            ],
            "error": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "BarChartSeries": {
            "key": [
                1
            ],
            "label": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "BarChartData": {
            "data": [
                7
            ],
            "indexBy": [
                1
            ],
            "keys": [
                1
            ],
            "series": [
                306
            ],
            "xAxisLabel": [
                1
            ],
            "yAxisLabel": [
                1
            ],
            "showLegend": [
                6
            ],
            "showDataLabels": [
                6
            ],
            "layout": [
                104
            ],
            "groupMode": [
                103
            ],
            "hasTooManyGroups": [
                6
            ],
            "formattedToRawLookup": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "LineChartDataPoint": {
            "x": [
                1
            ],
            "y": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "LineChartSeries": {
            "key": [
                1
            ],
            "label": [
                1
            ],
            "data": [
                308
            ],
            "__typename": [
                1
            ]
        },
        "LineChartData": {
            "series": [
                309
            ],
            "xAxisLabel": [
                1
            ],
            "yAxisLabel": [
                1
            ],
            "showLegend": [
                6
            ],
            "showDataLabels": [
                6
            ],
            "hasTooManyGroups": [
                6
            ],
            "formattedToRawLookup": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "PieChartDataItem": {
            "key": [
                1
            ],
            "value": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "PieChartData": {
            "data": [
                311
            ],
            "showLegend": [
                6
            ],
            "showDataLabels": [
                6
            ],
            "showCenterMetric": [
                6
            ],
            "hasTooManyGroups": [
                6
            ],
            "formattedToRawLookup": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "DuplicatedDashboard": {
            "id": [
                3
            ],
            "title": [
                1
            ],
            "pageLayoutId": [
                3
            ],
            "position": [
                12
            ],
            "createdAt": [
                1
            ],
            "updatedAt": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SendEmailOutput": {
            "success": [
                6
            ],
            "error": [
                1
            ],
            "messageThreadId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Analytics": {
            "success": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "EventLogRecord": {
            "event": [
                1
            ],
            "timestamp": [
                4
            ],
            "userId": [
                1
            ],
            "properties": [
                7
            ],
            "recordId": [
                1
            ],
            "objectMetadataId": [
                1
            ],
            "isCustom": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "EventLogPageInfo": {
            "endCursor": [
                1
            ],
            "hasNextPage": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "records": [
                316
            ],
            "totalCount": [
                21
            ],
            "pageInfo": [
                317
            ],
            "__typename": [
                1
            ]
        },
        "Skill": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "description": [
                1
            ],
            "content": [
                1
            ],
            "isCustom": [
                6
            ],
            "isActive": [
                6
            ],
            "applicationId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "id": [
                3
            ],
            "threadId": [
                3
            ],
            "turnId": [
                3
            ],
            "agentId": [
                3
            ],
            "role": [
                1
            ],
            "status": [
                1
            ],
            "parts": [
                302
            ],
            "processedAt": [
                4
            ],
            "createdAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatThread": {
            "id": [
                220
            ],
            "title": [
                1
            ],
            "totalInputTokens": [
                21
            ],
            "totalOutputTokens": [
                21
            ],
            "contextWindowTokens": [
                21
            ],
            "conversationSize": [
                21
            ],
            "totalInputCredits": [
                12
            ],
            "totalOutputCredits": [
                12
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "deletedAt": [
                4
            ],
            "lastMessageAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "AiSystemPromptSection": {
            "title": [
                1
            ],
            "content": [
                1
            ],
            "estimatedTokenCount": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "AiSystemPromptPreview": {
            "sections": [
                322
            ],
            "estimatedTokenCount": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamError": {
            "code": [
                1
            ],
            "message": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                7
            ],
            "maxSeq": [
                21
            ],
            "error": [
                324
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "messageId": [
                1
            ],
            "queued": [
                6
            ],
            "streamId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatEvent": {
            "threadId": [
                1
            ],
            "event": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "AgentTurnEvaluation": {
            "id": [
                3
            ],
            "turnId": [
                3
            ],
            "score": [
                21
            ],
            "comment": [
                1
            ],
            "createdAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "AgentTurn": {
            "id": [
                3
            ],
            "threadId": [
                3
            ],
            "agentId": [
                3
            ],
            "evaluations": [
                328
            ],
            "messages": [
                320
            ],
            "createdAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceAiStats": {
            "conversationsCount": [
                21
            ],
            "skillsCount": [
                21
            ],
            "toolsCount": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "CalendarChannel": {
            "id": [
                3
            ],
            "handle": [
                1
            ],
            "syncStatus": [
                332
            ],
            "syncStage": [
                333
            ],
            "visibility": [
                334
            ],
            "isContactAutoCreationEnabled": [
                6
            ],
            "contactAutoCreationPolicy": [
                335
            ],
            "isSyncEnabled": [
                6
            ],
            "syncedAt": [
                4
            ],
            "syncStageStartedAt": [
                4
            ],
            "throttleFailureCount": [
                12
            ],
            "connectedAccountId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "CalendarChannelSyncStatus": {},
        "CalendarChannelSyncStage": {},
        "CalendarChannelVisibility": {},
        "CalendarChannelContactAutoCreationPolicy": {},
        "MessageFolder": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "isSentFolder": [
                6
            ],
            "isSynced": [
                6
            ],
            "parentFolderId": [
                1
            ],
            "externalId": [
                1
            ],
            "pendingSyncAction": [
                337
            ],
            "messageChannelId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "MessageFolderPendingSyncAction": {},
        "CollectionHash": {
            "collectionName": [
                339
            ],
            "hash": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AllMetadataName": {},
        "MinimalObjectMetadata": {
            "id": [
                3
            ],
            "nameSingular": [
                1
            ],
            "namePlural": [
                1
            ],
            "labelSingular": [
                1
            ],
            "labelPlural": [
                1
            ],
            "icon": [
                1
            ],
            "color": [
                1
            ],
            "isActive": [
                6
            ],
            "isSystem": [
                6
            ],
            "isRemote": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "MinimalView": {
            "id": [
                3
            ],
            "type": [
                67
            ],
            "key": [
                68
            ],
            "objectMetadataId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "MinimalMetadata": {
            "objectMetadataItems": [
                340
            ],
            "views": [
                341
            ],
            "collectionHashes": [
                338
            ],
            "__typename": [
                1
            ]
        },
        "Query": {
            "navigationMenuItems": [
                163
            ],
            "navigationMenuItem": [
                163,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "enterprisePortalSession": [
                1,
                {
                    "returnUrlPath": [
                        1
                    ]
                }
            ],
            "enterpriseCheckoutSession": [
                1,
                {
                    "billingInterval": [
                        1
                    ]
                }
            ],
            "enterpriseSubscriptionStatus": [
                131
            ],
            "getViewFilterGroups": [
                57,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilterGroup": [
                57,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilters": [
                59,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilter": [
                59,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViews": [
                66,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        67,
                        "[ViewType!]"
                    ]
                }
            ],
            "getView": [
                66,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                62,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                62,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                55,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                55,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                64,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                64,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "apiKeys": [
                2
            ],
            "apiKey": [
                2,
                {
                    "input": [
                        344,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "getInviteSuggestions": [
                158
            ],
            "applicationConnectionProviders": [
                129,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "billingPortalSession": [
                156,
                {
                    "returnUrlPath": [
                        1
                    ],
                    "forPaymentMethodUpdate": [
                        6
                    ]
                }
            ],
            "listPlans": [
                154
            ],
            "getResourceCreditUsage": [
                153
            ],
            "findWorkspaceInvitations": [
                160
            ],
            "getApprovedAccessDomains": [
                132
            ],
            "getPageLayoutTabs": [
                125,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                125,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                126,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        127
                    ]
                }
            ],
            "getPageLayout": [
                126,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                84,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                84,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findManyAgents": [
                25
            ],
            "findOneAgent": [
                25,
                {
                    "input": [
                        345,
                        "AgentIdInput!"
                    ]
                }
            ],
            "objectRecordCounts": [
                209
            ],
            "object": [
                47,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "objects": [
                213,
                {
                    "paging": [
                        48,
                        "CursorPaging!"
                    ],
                    "filter": [
                        346,
                        "ObjectFilter!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                41,
                {
                    "input": [
                        347,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findManyLogicFunctions": [
                41
            ],
            "getAvailablePackages": [
                7,
                {
                    "input": [
                        347,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getLogicFunctionSourceCode": [
                1,
                {
                    "input": [
                        347,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "commandMenuItems": [
                35
            ],
            "commandMenuItem": [
                35,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                34
            ],
            "frontComponent": [
                34,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "currentWorkspace": [
                72
            ],
            "getPublicWorkspaceDataByDomain": [
                186,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                187,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                43,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                218,
                {
                    "paging": [
                        48,
                        "CursorPaging!"
                    ],
                    "filter": [
                        50,
                        "FieldFilter!"
                    ]
                }
            ],
            "getViewGroups": [
                61,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                61,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findManyApplications": [
                54
            ],
            "findOneApplication": [
                54,
                {
                    "id": [
                        3
                    ],
                    "universalIdentifier": [
                        3
                    ]
                }
            ],
            "findManyMarketplaceApps": [
                231,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findMarketplaceAppDetail": [
                235,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                231,
                {
                    "isVetted": [
                        6,
                        "Boolean!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                235,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                204,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                8,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findManyApplicationRegistrations": [
                8
            ],
            "findOneApplicationRegistration": [
                8,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                179,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                177,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "applicationRegistrationTarballUrl": [
                1,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getRoles": [
                29
            ],
            "previewMessageCampaignAudience": [
                287,
                {
                    "input": [
                        348,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                291
            ],
            "unsubscribePagePreviewUrl": [
                1
            ],
            "myMessageChannels": [
                278,
                {
                    "connectedAccountId": [
                        3
                    ]
                }
            ],
            "getEmailingDomains": [
                276
            ],
            "myConnectedAccounts": [
                245
            ],
            "getToolIndex": [
                301
            ],
            "getToolInputSchema": [
                7,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "webhooks": [
                300
            ],
            "webhook": [
                300,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "myMessageFolders": [
                336,
                {
                    "messageChannelId": [
                        3
                    ]
                }
            ],
            "myCalendarChannels": [
                331,
                {
                    "connectedAccountId": [
                        3
                    ]
                }
            ],
            "minimalMetadata": [
                342
            ],
            "appConnections": [
                219,
                {
                    "filter": [
                        349
                    ]
                }
            ],
            "appConnection": [
                219,
                {
                    "id": [
                        220,
                        "ID!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                330
            ],
            "chatThreads": [
                321
            ],
            "chatThread": [
                321,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                320,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                325,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getAiSystemPromptPreview": [
                323
            ],
            "skills": [
                319
            ],
            "skill": [
                319,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "agentTurns": [
                329,
                {
                    "agentId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                265,
                {
                    "email": [
                        1,
                        "String!"
                    ],
                    "captchaToken": [
                        1
                    ]
                }
            ],
            "checkWorkspaceInviteHashIsValid": [
                266,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceFromInviteHash": [
                72,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                260,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                261
            ],
            "validatePasswordResetToken": [
                258,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "currentUser": [
                75
            ],
            "getSSOIdentityProviders": [
                225
            ],
            "eventLogs": [
                318,
                {
                    "input": [
                        350,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "pieChartData": [
                312,
                {
                    "input": [
                        354,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "lineChartData": [
                310,
                {
                    "input": [
                        355,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "barChartData": [
                307,
                {
                    "input": [
                        356,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                298,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getAutoCompleteAddress": [
                293,
                {
                    "address": [
                        1,
                        "String!"
                    ],
                    "token": [
                        1,
                        "String!"
                    ],
                    "country": [
                        1
                    ],
                    "isFieldCity": [
                        6
                    ]
                }
            ],
            "getAddressDetails": [
                295,
                {
                    "placeId": [
                        1,
                        "String!"
                    ],
                    "token": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                270,
                {
                    "input": [
                        357
                    ]
                }
            ],
            "findManyPublicDomains": [
                274
            ],
            "__typename": [
                1
            ]
        },
        "GetApiKeyInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                346
            ],
            "or": [
                346
            ],
            "id": [
                51
            ],
            "isRemote": [
                52
            ],
            "isActive": [
                52
            ],
            "isSystem": [
                52
            ],
            "isUIEditable": [
                52
            ],
            "isUICreatable": [
                52
            ],
            "isUIReadOnly": [
                52
            ],
            "isSearchable": [
                52
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionIdInput": {
            "id": [
                220
            ],
            "__typename": [
                1
            ]
        },
        "PreviewMessageCampaignAudienceInput": {
            "listId": [
                1
            ],
            "unsubscribeTopicId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ListAppConnectionsInput": {
            "providerName": [
                1
            ],
            "userWorkspaceId": [
                1
            ],
            "visibility": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryInput": {
            "table": [
                351
            ],
            "filters": [
                352
            ],
            "first": [
                21
            ],
            "after": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EventLogTable": {},
        "EventLogFiltersInput": {
            "eventType": [
                1
            ],
            "userWorkspaceId": [
                1
            ],
            "dateRange": [
                353
            ],
            "recordId": [
                1
            ],
            "objectMetadataId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EventLogDateRangeInput": {
            "start": [
                4
            ],
            "end": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "PieChartDataInput": {
            "objectMetadataId": [
                3
            ],
            "configuration": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "LineChartDataInput": {
            "objectMetadataId": [
                3
            ],
            "configuration": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "BarChartDataInput": {
            "objectMetadataId": [
                3
            ],
            "configuration": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "periodStart": [
                4
            ],
            "periodEnd": [
                4
            ],
            "userWorkspaceId": [
                1
            ],
            "operationTypes": [
                358
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "Mutation": {
            "addQueryToEventStream": [
                6,
                {
                    "input": [
                        360,
                        "AddQuerySubscriptionInput!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                6,
                {
                    "input": [
                        361,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                163,
                {
                    "inputs": [
                        362,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                163,
                {
                    "input": [
                        362,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                163,
                {
                    "inputs": [
                        363,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateNavigationMenuItem": [
                163,
                {
                    "input": [
                        363,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                163,
                {
                    "ids": [
                        3,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                163,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createFileUpload": [
                134,
                {
                    "filename": [
                        1,
                        "String!"
                    ],
                    "size": [
                        12,
                        "Float!"
                    ],
                    "fileFolder": [
                        365,
                        "FileFolder!"
                    ],
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ]
                }
            ],
            "completeFileUpload": [
                133,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                6
            ],
            "releaseEnterpriseServerBinding": [
                130
            ],
            "setEnterpriseKey": [
                130,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadEmailAttachmentFile": [
                133,
                {
                    "file": [
                        366,
                        "Upload!"
                    ]
                }
            ],
            "uploadAiChatFile": [
                133,
                {
                    "file": [
                        366,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkflowFile": [
                133,
                {
                    "file": [
                        366,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                133,
                {
                    "file": [
                        366,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                133,
                {
                    "file": [
                        366,
                        "Upload!"
                    ]
                }
            ],
            "uploadFilesFieldFile": [
                133,
                {
                    "file": [
                        366,
                        "Upload!"
                    ],
                    "fieldMetadataId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                133,
                {
                    "file": [
                        366,
                        "Upload!"
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                57,
                {
                    "input": [
                        367,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                57,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        368,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "deleteViewFilterGroup": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyViewFilterGroup": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createViewFilter": [
                59,
                {
                    "input": [
                        369,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                59,
                {
                    "input": [
                        370,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                59,
                {
                    "input": [
                        372,
                        "DeleteViewFilterInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                59,
                {
                    "input": [
                        373,
                        "DestroyViewFilterInput!"
                    ]
                }
            ],
            "createView": [
                66,
                {
                    "input": [
                        374,
                        "CreateViewInput!"
                    ]
                }
            ],
            "updateView": [
                66,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        376,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "deleteView": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyView": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "upsertViewWidget": [
                66,
                {
                    "input": [
                        377,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "createViewSort": [
                62,
                {
                    "input": [
                        382,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "updateViewSort": [
                62,
                {
                    "input": [
                        383,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                6,
                {
                    "input": [
                        385,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                6,
                {
                    "input": [
                        386,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "updateViewField": [
                55,
                {
                    "input": [
                        387,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "createViewField": [
                55,
                {
                    "input": [
                        389,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createManyViewFields": [
                55,
                {
                    "inputs": [
                        389,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "deleteViewField": [
                55,
                {
                    "input": [
                        390,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "destroyViewField": [
                55,
                {
                    "input": [
                        391,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                64,
                {
                    "input": [
                        392,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                64,
                {
                    "input": [
                        394,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                64,
                {
                    "inputs": [
                        394,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                64,
                {
                    "input": [
                        395,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                64,
                {
                    "input": [
                        396,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                66,
                {
                    "input": [
                        397,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "createApiKey": [
                2,
                {
                    "input": [
                        400,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "updateApiKey": [
                2,
                {
                    "input": [
                        401,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "revokeApiKey": [
                2,
                {
                    "input": [
                        402,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                6,
                {
                    "apiKeyId": [
                        3,
                        "UUID!"
                    ],
                    "roleId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "skipSyncEmailOnboardingStep": [
                159
            ],
            "triggerInstallAppsOnboardingStep": [
                159,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                6,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "value": [
                        1,
                        "String!"
                    ],
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "checkoutSession": [
                156,
                {
                    "recurringInterval": [
                        142,
                        "SubscriptionInterval!"
                    ],
                    "plan": [
                        138,
                        "BillingPlanKey!"
                    ],
                    "requirePaymentMethod": [
                        6,
                        "Boolean!"
                    ],
                    "successUrlPath": [
                        1
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                155,
                {
                    "recurringInterval": [
                        142,
                        "SubscriptionInterval!"
                    ],
                    "plan": [
                        138,
                        "BillingPlanKey!"
                    ],
                    "requirePaymentMethod": [
                        6,
                        "Boolean!"
                    ],
                    "successUrlPath": [
                        1
                    ],
                    "idempotencyKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                155
            ],
            "switchSubscriptionInterval": [
                157
            ],
            "switchBillingPlan": [
                157
            ],
            "cancelSwitchBillingPlan": [
                157
            ],
            "cancelSwitchBillingInterval": [
                157
            ],
            "setResourceCreditSubscriptionPrice": [
                157,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                152
            ],
            "cancelSwitchResourceCreditPrice": [
                157
            ],
            "deleteWorkspaceInvitation": [
                1,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resendWorkspaceInvitation": [
                161,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "sendInvitations": [
                161,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        3
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                132,
                {
                    "input": [
                        403,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteApprovedAccessDomain": [
                6,
                {
                    "input": [
                        404,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                132,
                {
                    "input": [
                        405,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                125,
                {
                    "input": [
                        406,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                125,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        407,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "destroyPageLayoutTab": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createPageLayout": [
                126,
                {
                    "input": [
                        408,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                126,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        409,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "destroyPageLayout": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                126,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        410,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                126,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                84,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                125,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                84,
                {
                    "input": [
                        414,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                84,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        415,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "destroyPageLayoutWidget": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createOneAgent": [
                25,
                {
                    "input": [
                        416,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                25,
                {
                    "input": [
                        417,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "deleteOneAgent": [
                25,
                {
                    "input": [
                        345,
                        "AgentIdInput!"
                    ]
                }
            ],
            "createOneObject": [
                47,
                {
                    "input": [
                        418,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                47,
                {
                    "input": [
                        420,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "updateOneObject": [
                47,
                {
                    "input": [
                        421,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "createOneIndex": [
                45,
                {
                    "input": [
                        423,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                45,
                {
                    "input": [
                        426,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                41,
                {
                    "input": [
                        347,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                41,
                {
                    "input": [
                        427,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "executeOneLogicFunction": [
                172,
                {
                    "input": [
                        428,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                6,
                {
                    "input": [
                        429,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createCommandMenuItem": [
                35,
                {
                    "input": [
                        431,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                35,
                {
                    "input": [
                        432,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                35,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                35,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createFrontComponent": [
                34,
                {
                    "input": [
                        433,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                34,
                {
                    "input": [
                        434,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "deleteFrontComponent": [
                34,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                72,
                {
                    "data": [
                        436,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                72,
                {
                    "data": [
                        437,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                72
            ],
            "checkCustomDomainValidRecords": [
                239
            ],
            "createOneField": [
                43,
                {
                    "input": [
                        438,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneField": [
                43,
                {
                    "input": [
                        440,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "deleteOneField": [
                43,
                {
                    "input": [
                        442,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "createViewGroup": [
                61,
                {
                    "input": [
                        443,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createManyViewGroups": [
                61,
                {
                    "inputs": [
                        443,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "updateViewGroup": [
                61,
                {
                    "input": [
                        444,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                61,
                {
                    "inputs": [
                        444,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "deleteViewGroup": [
                61,
                {
                    "input": [
                        446,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "destroyViewGroup": [
                61,
                {
                    "input": [
                        447,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "installMarketplaceApp": [
                6,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ],
                    "version": [
                        1
                    ]
                }
            ],
            "installApplication": [
                54,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ],
                    "version": [
                        1
                    ]
                }
            ],
            "uninstallApplication": [
                6,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                6
            ],
            "createApplicationRegistration": [
                203,
                {
                    "input": [
                        448,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                8,
                {
                    "input": [
                        449,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "deleteApplicationRegistration": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                205,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createApplicationRegistrationVariable": [
                5,
                {
                    "input": [
                        451,
                        "CreateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                5,
                {
                    "input": [
                        452,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "deleteApplicationRegistrationVariable": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadAppTarball": [
                8,
                {
                    "file": [
                        366,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "claimApplicationRegistrationOwnership": [
                8,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                8,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ],
                    "targetWorkspaceSubdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                20,
                {
                    "workspaceMemberId": [
                        3,
                        "UUID!"
                    ],
                    "roleId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createOneRole": [
                29,
                {
                    "createRoleInput": [
                        454,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "updateOneRole": [
                29,
                {
                    "updateRoleInput": [
                        455,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                16,
                {
                    "upsertObjectPermissionsInput": [
                        457,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                27,
                {
                    "upsertPermissionFlagsInput": [
                        459,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                26,
                {
                    "upsertFieldPermissionsInput": [
                        460,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                240,
                {
                    "input": [
                        462,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                6,
                {
                    "agentId": [
                        3,
                        "UUID!"
                    ],
                    "roleId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                6,
                {
                    "agentId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "sendEmailViaEmailingDomain": [
                288,
                {
                    "input": [
                        465,
                        "SendEmailViaDomainInput!"
                    ]
                }
            ],
            "sendMessageCampaign": [
                290,
                {
                    "input": [
                        466,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "createUnsubscribeTopic": [
                291,
                {
                    "input": [
                        467,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                291,
                {
                    "input": [
                        468,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "deleteUnsubscribeTopic": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateMessageChannel": [
                278,
                {
                    "input": [
                        469,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "createEmailGroupChannel": [
                286,
                {
                    "input": [
                        471,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "deleteEmailGroupChannel": [
                278,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createEmailingDomain": [
                276,
                {
                    "input": [
                        472,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "deleteEmailingDomain": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyEmailingDomain": [
                276,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                245,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "runAgent": [
                303,
                {
                    "input": [
                        473,
                        "RunAgentInput!"
                    ]
                }
            ],
            "createWebhook": [
                300,
                {
                    "input": [
                        474,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "updateWebhook": [
                300,
                {
                    "input": [
                        475,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                300,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "updateMessageFolder": [
                336,
                {
                    "input": [
                        477,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                336,
                {
                    "input": [
                        479,
                        "UpdateMessageFoldersInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                331,
                {
                    "input": [
                        480,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "createChatThread": [
                321
            ],
            "sendChatMessage": [
                326,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ],
                    "text": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        3,
                        "UUID!"
                    ],
                    "browsingContext": [
                        7
                    ],
                    "modelId": [
                        1
                    ],
                    "fileAttachments": [
                        482,
                        "[FileAttachmentInput!]"
                    ]
                }
            ],
            "retryChatMessage": [
                326,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ],
                    "modelId": [
                        1
                    ]
                }
            ],
            "answerAgentChatQuestion": [
                326,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ],
                    "messageId": [
                        3,
                        "UUID!"
                    ],
                    "answers": [
                        483,
                        "[AgentChatQuestionAnswerInput!]!"
                    ],
                    "modelId": [
                        1
                    ]
                }
            ],
            "stopAgentChatStream": [
                6,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "renameChatThread": [
                321,
                {
                    "id": [
                        3,
                        "UUID!"
                    ],
                    "title": [
                        1,
                        "String!"
                    ]
                }
            ],
            "archiveChatThread": [
                321,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "unarchiveChatThread": [
                321,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "deleteChatThread": [
                6,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "deleteQueuedChatMessage": [
                6,
                {
                    "messageId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createSkill": [
                319,
                {
                    "input": [
                        484,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "updateSkill": [
                319,
                {
                    "input": [
                        485,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "deleteSkill": [
                319,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "activateSkill": [
                319,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "deactivateSkill": [
                319,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "evaluateAgentTurn": [
                328,
                {
                    "turnId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "runEvaluationInput": [
                329,
                {
                    "agentId": [
                        3,
                        "UUID!"
                    ],
                    "input": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthorizationUrlForSSO": [
                253,
                {
                    "input": [
                        486,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                264,
                {
                    "email": [
                        1,
                        "String!"
                    ],
                    "password": [
                        1,
                        "String!"
                    ],
                    "captchaToken": [
                        1
                    ],
                    "locale": [
                        1
                    ],
                    "verifyEmailRedirectPath": [
                        1
                    ],
                    "origin": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                251,
                {
                    "email": [
                        1,
                        "String!"
                    ],
                    "password": [
                        1,
                        "String!"
                    ],
                    "captchaToken": [
                        1
                    ],
                    "locale": [
                        1
                    ],
                    "verifyEmailRedirectPath": [
                        1
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                259,
                {
                    "emailVerificationToken": [
                        1,
                        "String!"
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "captchaToken": [
                        1
                    ],
                    "origin": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyEmailAndGetWorkspaceAgnosticToken": [
                251,
                {
                    "emailVerificationToken": [
                        1,
                        "String!"
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "captchaToken": [
                        1
                    ]
                }
            ],
            "getAuthTokensFromOTP": [
                263,
                {
                    "otp": [
                        1,
                        "String!"
                    ],
                    "loginToken": [
                        1,
                        "String!"
                    ],
                    "captchaToken": [
                        1
                    ],
                    "origin": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signUp": [
                251,
                {
                    "email": [
                        1,
                        "String!"
                    ],
                    "password": [
                        1,
                        "String!"
                    ],
                    "captchaToken": [
                        1
                    ],
                    "locale": [
                        1
                    ],
                    "verifyEmailRedirectPath": [
                        1
                    ]
                }
            ],
            "signUpInWorkspace": [
                256,
                {
                    "email": [
                        1,
                        "String!"
                    ],
                    "password": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        3
                    ],
                    "workspaceInviteHash": [
                        1
                    ],
                    "workspacePersonalInviteToken": [
                        1
                    ],
                    "captchaToken": [
                        1
                    ],
                    "locale": [
                        1
                    ],
                    "verifyEmailRedirectPath": [
                        1
                    ]
                }
            ],
            "signUpInNewWorkspace": [
                256,
                {
                    "input": [
                        487
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                133,
                {
                    "workspaceId": [
                        1,
                        "String!"
                    ],
                    "file": [
                        366,
                        "Upload!"
                    ]
                }
            ],
            "generateTransientToken": [
                257
            ],
            "getAuthTokensFromLoginToken": [
                263,
                {
                    "loginToken": [
                        1,
                        "String!"
                    ],
                    "origin": [
                        1,
                        "String!"
                    ]
                }
            ],
            "authorizeApp": [
                249,
                {
                    "clientId": [
                        1,
                        "String!"
                    ],
                    "codeChallenge": [
                        1
                    ],
                    "redirectUrl": [
                        1,
                        "String!"
                    ],
                    "state": [
                        1
                    ],
                    "scope": [
                        1
                    ]
                }
            ],
            "renewToken": [
                263,
                {
                    "appToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                262,
                {
                    "apiKeyId": [
                        3,
                        "UUID!"
                    ],
                    "expiresAt": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                32
            ],
            "emailPasswordResetLink": [
                252,
                {
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        3
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                254,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ],
                    "newPassword": [
                        1,
                        "String!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                247,
                {
                    "loginToken": [
                        1,
                        "String!"
                    ],
                    "origin": [
                        1,
                        "String!"
                    ]
                }
            ],
            "initiateOTPProvisioningForAuthenticatedUser": [
                247
            ],
            "deleteTwoFactorAuthenticationMethod": [
                246,
                {
                    "twoFactorAuthenticationMethodId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                248,
                {
                    "otp": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteUser": [
                75
            ],
            "deleteUserFromWorkspace": [
                17,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                6,
                {
                    "input": [
                        488,
                        "UpdateWorkspaceMemberSettingsInput!"
                    ]
                }
            ],
            "updateUserEmail": [
                6,
                {
                    "newEmail": [
                        1,
                        "String!"
                    ],
                    "verifyEmailRedirectPath": [
                        1
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                221,
                {
                    "email": [
                        1,
                        "String!"
                    ],
                    "origin": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createOIDCIdentityProvider": [
                226,
                {
                    "input": [
                        489,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                226,
                {
                    "input": [
                        490,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                222,
                {
                    "input": [
                        491,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                223,
                {
                    "input": [
                        492,
                        "EditSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                315,
                {
                    "event": [
                        1,
                        "String!"
                    ],
                    "recordId": [
                        3,
                        "UUID!"
                    ],
                    "objectMetadataId": [
                        3,
                        "UUID!"
                    ],
                    "properties": [
                        7
                    ]
                }
            ],
            "trackAnalytics": [
                315,
                {
                    "type": [
                        493,
                        "AnalyticsType!"
                    ],
                    "name": [
                        1
                    ],
                    "event": [
                        1
                    ],
                    "properties": [
                        7
                    ]
                }
            ],
            "duplicateDashboard": [
                313,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "impersonate": [
                267,
                {
                    "userId": [
                        3,
                        "UUID!"
                    ],
                    "workspaceId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createCalendarEvent": [
                305,
                {
                    "input": [
                        494,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "sendEmail": [
                314,
                {
                    "input": [
                        495,
                        "SendEmailInput!"
                    ]
                }
            ],
            "startChannelSync": [
                304,
                {
                    "connectedAccountId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                299,
                {
                    "handle": [
                        1,
                        "String!"
                    ],
                    "connectionParameters": [
                        497,
                        "EmailAccountConnectionParameters!"
                    ],
                    "id": [
                        3
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                174,
                {
                    "input": [
                        499,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                274,
                {
                    "domain": [
                        1,
                        "String!"
                    ],
                    "applicationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deletePublicDomain": [
                6,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkPublicDomainValidRecords": [
                239,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                271,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ],
                    "name": [
                        1,
                        "String!"
                    ]
                }
            ],
            "syncApplication": [
                272,
                {
                    "manifest": [
                        7,
                        "JSON!"
                    ],
                    "dryRun": [
                        6
                    ]
                }
            ],
            "uploadApplicationFile": [
                273,
                {
                    "file": [
                        366,
                        "Upload!"
                    ],
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileFolder": [
                        365,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "upgradeApplication": [
                6,
                {
                    "appRegistrationId": [
                        1,
                        "String!"
                    ],
                    "targetVersion": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateApplicationToken": [
                33,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                33,
                {
                    "applicationRefreshToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "AddQuerySubscriptionInput": {
            "eventStreamId": [
                1
            ],
            "queryId": [
                1
            ],
            "operationSignature": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "RemoveQueryFromEventStreamInput": {
            "eventStreamId": [
                1
            ],
            "queryId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateNavigationMenuItemInput": {
            "id": [
                3
            ],
            "userWorkspaceId": [
                3
            ],
            "targetRecordId": [
                3
            ],
            "targetObjectMetadataId": [
                3
            ],
            "viewId": [
                3
            ],
            "type": [
                164
            ],
            "name": [
                1
            ],
            "link": [
                1
            ],
            "icon": [
                1
            ],
            "color": [
                1
            ],
            "folderId": [
                3
            ],
            "pageLayoutId": [
                3
            ],
            "position": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                3
            ],
            "update": [
                364
            ],
            "__typename": [
                1
            ]
        },
        "UpdateNavigationMenuItemInput": {
            "folderId": [
                3
            ],
            "position": [
                12
            ],
            "name": [
                1
            ],
            "link": [
                1
            ],
            "icon": [
                1
            ],
            "color": [
                1
            ],
            "pageLayoutId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "FileFolder": {},
        "Upload": {},
        "CreateViewFilterGroupInput": {
            "id": [
                3
            ],
            "parentViewFilterGroupId": [
                3
            ],
            "logicalOperator": [
                58
            ],
            "positionInViewFilterGroup": [
                12
            ],
            "viewId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                3
            ],
            "parentViewFilterGroupId": [
                3
            ],
            "logicalOperator": [
                58
            ],
            "positionInViewFilterGroup": [
                12
            ],
            "viewId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "operand": [
                60
            ],
            "value": [
                7
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                12
            ],
            "subFieldName": [
                1
            ],
            "relationTargetFieldMetadataId": [
                3
            ],
            "viewId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                3
            ],
            "update": [
                371
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                3
            ],
            "operand": [
                60
            ],
            "value": [
                7
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                12
            ],
            "subFieldName": [
                1
            ],
            "relationTargetFieldMetadataId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewInput": {
            "timelineConfiguration": [
                375
            ],
            "id": [
                3
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                3
            ],
            "type": [
                67
            ],
            "key": [
                68
            ],
            "icon": [
                1
            ],
            "position": [
                12
            ],
            "isCompact": [
                6
            ],
            "shouldHideEmptyGroups": [
                6
            ],
            "kanbanColumnWidth": [
                21
            ],
            "openRecordIn": [
                69
            ],
            "kanbanAggregateOperation": [
                56
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                70
            ],
            "calendarFieldMetadataId": [
                3
            ],
            "catalogImageFieldMetadataId": [
                3
            ],
            "catalogSubtitleFieldMetadataId": [
                3
            ],
            "catalogDetailFieldMetadataId": [
                3
            ],
            "mainGroupByFieldMetadataId": [
                3
            ],
            "visibility": [
                71
            ],
            "__typename": [
                1
            ]
        },
        "ViewTimelineConfigurationInput": {
            "startDateFieldMetadataUniversalIdentifier": [
                3
            ],
            "endDateFieldMetadataUniversalIdentifier": [
                3
            ],
            "barColor": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewInput": {
            "timelineConfiguration": [
                375
            ],
            "id": [
                3
            ],
            "name": [
                1
            ],
            "type": [
                67
            ],
            "icon": [
                1
            ],
            "position": [
                12
            ],
            "isCompact": [
                6
            ],
            "openRecordIn": [
                69
            ],
            "kanbanAggregateOperation": [
                56
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                70
            ],
            "calendarFieldMetadataId": [
                3
            ],
            "catalogImageFieldMetadataId": [
                3
            ],
            "catalogSubtitleFieldMetadataId": [
                3
            ],
            "catalogDetailFieldMetadataId": [
                3
            ],
            "visibility": [
                71
            ],
            "mainGroupByFieldMetadataId": [
                3
            ],
            "shouldHideEmptyGroups": [
                6
            ],
            "kanbanColumnWidth": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "widgetId": [
                3
            ],
            "viewFields": [
                378
            ],
            "viewFilters": [
                379
            ],
            "viewFilterGroups": [
                380
            ],
            "viewSorts": [
                381
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFieldInput": {
            "viewFieldId": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "isVisible": [
                6
            ],
            "position": [
                12
            ],
            "size": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterInput": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "operand": [
                60
            ],
            "value": [
                7
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                12
            ],
            "subFieldName": [
                1
            ],
            "relationTargetFieldMetadataId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                3
            ],
            "parentViewFilterGroupId": [
                3
            ],
            "logicalOperator": [
                58
            ],
            "positionInViewFilterGroup": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "direction": [
                63
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "direction": [
                63
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                3
            ],
            "update": [
                384
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                63
            ],
            "subFieldName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInput": {
            "id": [
                3
            ],
            "update": [
                388
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInputUpdates": {
            "isVisible": [
                6
            ],
            "size": [
                12
            ],
            "position": [
                12
            ],
            "aggregateOperation": [
                56
            ],
            "viewFieldGroupId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldInput": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "viewId": [
                3
            ],
            "isVisible": [
                6
            ],
            "size": [
                12
            ],
            "position": [
                12
            ],
            "aggregateOperation": [
                56
            ],
            "viewFieldGroupId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldGroupInput": {
            "id": [
                3
            ],
            "update": [
                393
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldGroupInputUpdates": {
            "name": [
                1
            ],
            "position": [
                12
            ],
            "isVisible": [
                6
            ],
            "deletedAt": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "viewId": [
                3
            ],
            "position": [
                12
            ],
            "isVisible": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldGroupInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetInput": {
            "widgetId": [
                3
            ],
            "groups": [
                398
            ],
            "fields": [
                399
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "position": [
                12
            ],
            "isVisible": [
                6
            ],
            "fields": [
                399
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "viewFieldId": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "isVisible": [
                6
            ],
            "position": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "CreateApiKeyInput": {
            "name": [
                1
            ],
            "expiresAt": [
                1
            ],
            "revokedAt": [
                1
            ],
            "roleId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateApiKeyInput": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "expiresAt": [
                1
            ],
            "revokedAt": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RevokeApiKeyInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateApprovedAccessDomainInput": {
            "domain": [
                1
            ],
            "email": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "DeleteApprovedAccessDomainInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "validationToken": [
                1
            ],
            "approvedAccessDomainId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "title": [
                1
            ],
            "position": [
                12
            ],
            "pageLayoutId": [
                3
            ],
            "layoutMode": [
                88
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutTabInput": {
            "title": [
                1
            ],
            "position": [
                12
            ],
            "icon": [
                1
            ],
            "layoutMode": [
                88
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutInput": {
            "name": [
                1
            ],
            "type": [
                127
            ],
            "objectMetadataId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutInput": {
            "name": [
                1
            ],
            "type": [
                127
            ],
            "objectMetadataId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutWithTabsInput": {
            "name": [
                1
            ],
            "type": [
                127
            ],
            "objectMetadataId": [
                3
            ],
            "tabs": [
                411
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutTabWithWidgetsInput": {
            "id": [
                3
            ],
            "title": [
                1
            ],
            "position": [
                12
            ],
            "icon": [
                1
            ],
            "layoutMode": [
                88
            ],
            "widgets": [
                412
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutWidgetWithIdInput": {
            "id": [
                3
            ],
            "pageLayoutTabId": [
                3
            ],
            "title": [
                1
            ],
            "type": [
                85
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                413
            ],
            "position": [
                7
            ],
            "configuration": [
                7
            ],
            "conditionalDisplay": [
                7
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GridPositionInput": {
            "row": [
                12
            ],
            "column": [
                12
            ],
            "rowSpan": [
                12
            ],
            "columnSpan": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutWidgetInput": {
            "pageLayoutTabId": [
                3
            ],
            "title": [
                1
            ],
            "type": [
                85
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                413
            ],
            "position": [
                7
            ],
            "configuration": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutWidgetInput": {
            "pageLayoutTabId": [
                3
            ],
            "title": [
                1
            ],
            "type": [
                85
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                413
            ],
            "position": [
                7
            ],
            "configuration": [
                7
            ],
            "conditionalDisplay": [
                7
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateAgentInput": {
            "name": [
                1
            ],
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "description": [
                1
            ],
            "prompt": [
                1
            ],
            "modelId": [
                1
            ],
            "roleId": [
                3
            ],
            "responseFormat": [
                7
            ],
            "modelConfiguration": [
                7
            ],
            "evaluationInputs": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateAgentInput": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "description": [
                1
            ],
            "prompt": [
                1
            ],
            "modelId": [
                1
            ],
            "roleId": [
                3
            ],
            "responseFormat": [
                7
            ],
            "modelConfiguration": [
                7
            ],
            "evaluationInputs": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                419
            ],
            "__typename": [
                1
            ]
        },
        "CreateObjectInput": {
            "nameSingular": [
                1
            ],
            "namePlural": [
                1
            ],
            "labelSingular": [
                1
            ],
            "labelPlural": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "shortcut": [
                1
            ],
            "color": [
                1
            ],
            "skipNameField": [
                6
            ],
            "isRemote": [
                6
            ],
            "primaryKeyColumnType": [
                1
            ],
            "primaryKeyFieldMetadataSettings": [
                7
            ],
            "isLabelSyncedWithName": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "update": [
                422
            ],
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateObjectPayload": {
            "labelSingular": [
                1
            ],
            "labelPlural": [
                1
            ],
            "nameSingular": [
                1
            ],
            "namePlural": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "shortcut": [
                1
            ],
            "color": [
                1
            ],
            "isActive": [
                6
            ],
            "labelIdentifierFieldMetadataId": [
                3
            ],
            "imageIdentifierFieldMetadataId": [
                3
            ],
            "isLabelSyncedWithName": [
                6
            ],
            "isSearchable": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                424
            ],
            "__typename": [
                1
            ]
        },
        "CreateIndexInput": {
            "objectMetadataId": [
                3
            ],
            "fields": [
                425
            ],
            "indexType": [
                46
            ],
            "__typename": [
                1
            ]
        },
        "CreateIndexFieldInput": {
            "fieldMetadataId": [
                3
            ],
            "subFieldName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "id": [
                3
            ],
            "universalIdentifier": [
                3
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "timeoutSeconds": [
                12
            ],
            "source": [
                7
            ],
            "cronTriggerSettings": [
                7
            ],
            "databaseEventTriggerSettings": [
                7
            ],
            "httpRouteTriggerSettings": [
                7
            ],
            "serverRouteTriggerSettings": [
                7
            ],
            "toolTriggerSettings": [
                7
            ],
            "workflowActionTriggerSettings": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                3
            ],
            "payload": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInput": {
            "id": [
                3
            ],
            "update": [
                430
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "timeoutSeconds": [
                12
            ],
            "sourceHandlerCode": [
                1
            ],
            "handlerName": [
                1
            ],
            "sourceHandlerPath": [
                1
            ],
            "cronTriggerSettings": [
                7
            ],
            "databaseEventTriggerSettings": [
                7
            ],
            "httpRouteTriggerSettings": [
                7
            ],
            "toolTriggerSettings": [
                7
            ],
            "workflowActionTriggerSettings": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "CreateCommandMenuItemInput": {
            "workflowVersionId": [
                3
            ],
            "frontComponentId": [
                3
            ],
            "engineComponentKey": [
                36
            ],
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "shortLabel": [
                1
            ],
            "position": [
                12
            ],
            "isPinned": [
                6
            ],
            "availabilityType": [
                37
            ],
            "hotKeys": [
                1
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "availabilityObjectMetadataId": [
                3
            ],
            "payload": [
                7
            ],
            "pageLayoutId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCommandMenuItemInput": {
            "id": [
                3
            ],
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "shortLabel": [
                1
            ],
            "position": [
                12
            ],
            "isPinned": [
                6
            ],
            "availabilityType": [
                37
            ],
            "availabilityObjectMetadataId": [
                3
            ],
            "engineComponentKey": [
                36
            ],
            "hotKeys": [
                1
            ],
            "pageLayoutId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateFrontComponentInput": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "sourceComponentPath": [
                1
            ],
            "builtComponentPath": [
                1
            ],
            "componentName": [
                1
            ],
            "builtComponentChecksum": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFrontComponentInput": {
            "id": [
                3
            ],
            "update": [
                435
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFrontComponentInputUpdates": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ActivateWorkspaceInput": {
            "displayName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceInput": {
            "subdomain": [
                1
            ],
            "customDomain": [
                1
            ],
            "displayName": [
                1
            ],
            "logo": [
                1
            ],
            "inviteHash": [
                1
            ],
            "isPublicInviteLinkEnabled": [
                6
            ],
            "workspaceDiscoverability": [
                73
            ],
            "allowImpersonation": [
                6
            ],
            "isGoogleAuthEnabled": [
                6
            ],
            "isMicrosoftAuthEnabled": [
                6
            ],
            "isPasswordAuthEnabled": [
                6
            ],
            "isGoogleAuthBypassEnabled": [
                6
            ],
            "isMicrosoftAuthBypassEnabled": [
                6
            ],
            "isPasswordAuthBypassEnabled": [
                6
            ],
            "defaultRoleId": [
                3
            ],
            "isTwoFactorAuthenticationEnforced": [
                6
            ],
            "trashRetentionDays": [
                12
            ],
            "eventLogRetentionDays": [
                12
            ],
            "fastModel": [
                1
            ],
            "smartModel": [
                1
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "editableProfileFields": [
                1
            ],
            "enabledAiModelIds": [
                1
            ],
            "useRecommendedModels": [
                6
            ],
            "isInternalMessagesImportEnabled": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneFieldMetadataInput": {
            "field": [
                439
            ],
            "__typename": [
                1
            ]
        },
        "CreateFieldInput": {
            "type": [
                44
            ],
            "name": [
                1
            ],
            "label": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "isActive": [
                6
            ],
            "isSystem": [
                6
            ],
            "isUIEditable": [
                6
            ],
            "isUIReadOnly": [
                6
            ],
            "isNullable": [
                6
            ],
            "isUnique": [
                6
            ],
            "defaultValue": [
                7
            ],
            "options": [
                7
            ],
            "settings": [
                7
            ],
            "objectMetadataId": [
                3
            ],
            "isLabelSyncedWithName": [
                6
            ],
            "isRemoteCreation": [
                6
            ],
            "relationCreationPayload": [
                7
            ],
            "morphRelationsCreationPayload": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                3
            ],
            "update": [
                441
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "universalIdentifier": [
                1
            ],
            "name": [
                1
            ],
            "label": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "isActive": [
                6
            ],
            "isSystem": [
                6
            ],
            "isUIEditable": [
                6
            ],
            "isUIReadOnly": [
                6
            ],
            "isNullable": [
                6
            ],
            "isUnique": [
                6
            ],
            "defaultValue": [
                7
            ],
            "options": [
                7
            ],
            "settings": [
                7
            ],
            "objectMetadataId": [
                3
            ],
            "isLabelSyncedWithName": [
                6
            ],
            "morphRelationsUpdatePayload": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewGroupInput": {
            "id": [
                3
            ],
            "isVisible": [
                6
            ],
            "fieldValue": [
                1
            ],
            "position": [
                12
            ],
            "viewId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                3
            ],
            "update": [
                445
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                3
            ],
            "isVisible": [
                6
            ],
            "fieldValue": [
                1
            ],
            "position": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistrationInput": {
            "name": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "oAuthRedirectUris": [
                1
            ],
            "oAuthScopes": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateApplicationRegistrationInput": {
            "id": [
                1
            ],
            "update": [
                450
            ],
            "__typename": [
                1
            ]
        },
        "UpdateApplicationRegistrationPayload": {
            "name": [
                1
            ],
            "oAuthRedirectUris": [
                1
            ],
            "oAuthScopes": [
                1
            ],
            "isListed": [
                6
            ],
            "isPreInstalled": [
                6
            ],
            "isVetted": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistrationVariableInput": {
            "applicationRegistrationId": [
                1
            ],
            "key": [
                1
            ],
            "value": [
                1
            ],
            "description": [
                1
            ],
            "isSecret": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "UpdateApplicationRegistrationVariableInput": {
            "id": [
                1
            ],
            "update": [
                453
            ],
            "__typename": [
                1
            ]
        },
        "UpdateApplicationRegistrationVariablePayload": {
            "value": [
                1
            ],
            "resetValue": [
                6
            ],
            "description": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateRoleInput": {
            "id": [
                1
            ],
            "label": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "canUpdateAllSettings": [
                6
            ],
            "canAccessAllTools": [
                6
            ],
            "canReadAllObjectRecords": [
                6
            ],
            "canUpdateAllObjectRecords": [
                6
            ],
            "canSoftDeleteAllObjectRecords": [
                6
            ],
            "canDestroyAllObjectRecords": [
                6
            ],
            "canBeAssignedToUsers": [
                6
            ],
            "canBeAssignedToAgents": [
                6
            ],
            "canBeAssignedToApiKeys": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "update": [
                456
            ],
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRolePayload": {
            "label": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "canUpdateAllSettings": [
                6
            ],
            "canAccessAllTools": [
                6
            ],
            "canReadAllObjectRecords": [
                6
            ],
            "canUpdateAllObjectRecords": [
                6
            ],
            "canSoftDeleteAllObjectRecords": [
                6
            ],
            "canDestroyAllObjectRecords": [
                6
            ],
            "canBeAssignedToUsers": [
                6
            ],
            "canBeAssignedToAgents": [
                6
            ],
            "canBeAssignedToApiKeys": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "roleId": [
                3
            ],
            "objectPermissions": [
                458
            ],
            "__typename": [
                1
            ]
        },
        "ObjectPermissionInput": {
            "objectMetadataId": [
                3
            ],
            "canReadObjectRecords": [
                6
            ],
            "canUpdateObjectRecords": [
                6
            ],
            "canSoftDeleteObjectRecords": [
                6
            ],
            "canDestroyObjectRecords": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "UpsertPermissionFlagsInput": {
            "roleId": [
                3
            ],
            "permissionFlagKeys": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldPermissionsInput": {
            "roleId": [
                3
            ],
            "fieldPermissions": [
                461
            ],
            "__typename": [
                1
            ]
        },
        "FieldPermissionInput": {
            "objectMetadataId": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "canReadFieldValue": [
                6
            ],
            "canUpdateFieldValue": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "roleId": [
                3
            ],
            "objectMetadataId": [
                3
            ],
            "predicates": [
                463
            ],
            "predicateGroups": [
                464
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateInput": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "operand": [
                15
            ],
            "value": [
                7
            ],
            "subFieldName": [
                1
            ],
            "workspaceMemberFieldMetadataId": [
                1
            ],
            "workspaceMemberSubFieldName": [
                1
            ],
            "rowLevelPermissionPredicateGroupId": [
                3
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateGroupInput": {
            "id": [
                3
            ],
            "objectMetadataId": [
                3
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                3
            ],
            "logicalOperator": [
                13
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "SendEmailViaDomainInput": {
            "emailingDomainId": [
                1
            ],
            "to": [
                1
            ],
            "cc": [
                1
            ],
            "bcc": [
                1
            ],
            "subject": [
                1
            ],
            "text": [
                1
            ],
            "html": [
                1
            ],
            "from": [
                1
            ],
            "replyTo": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignInput": {
            "listId": [
                1
            ],
            "unsubscribeTopicId": [
                1
            ],
            "subject": [
                1
            ],
            "body": [
                1
            ],
            "fromAddress": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateUnsubscribeTopicInput": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "visibility": [
                292
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUnsubscribeTopicInput": {
            "id": [
                1
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "visibility": [
                292
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInput": {
            "id": [
                3
            ],
            "update": [
                470
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "visibility": [
                279
            ],
            "isContactAutoCreationEnabled": [
                6
            ],
            "contactAutoCreationPolicy": [
                281
            ],
            "messageFolderImportPolicy": [
                282
            ],
            "isSyncEnabled": [
                6
            ],
            "excludeNonProfessionalEmails": [
                6
            ],
            "excludeGroupEmails": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "CreateEmailGroupChannelInput": {
            "handle": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateEmailingDomainInput": {
            "domain": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentInput": {
            "agentUniversalIdentifier": [
                1
            ],
            "prompt": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateWebhookInput": {
            "id": [
                3
            ],
            "targetUrl": [
                1
            ],
            "operations": [
                1
            ],
            "description": [
                1
            ],
            "secret": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWebhookInput": {
            "id": [
                3
            ],
            "update": [
                476
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWebhookInputUpdates": {
            "targetUrl": [
                1
            ],
            "operations": [
                1
            ],
            "description": [
                1
            ],
            "secret": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                3
            ],
            "update": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInputUpdates": {
            "isSynced": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFoldersInput": {
            "ids": [
                3
            ],
            "update": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInput": {
            "id": [
                3
            ],
            "update": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "visibility": [
                334
            ],
            "isContactAutoCreationEnabled": [
                6
            ],
            "contactAutoCreationPolicy": [
                335
            ],
            "isSyncEnabled": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "FileAttachmentInput": {
            "id": [
                3
            ],
            "filename": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatQuestionAnswerInput": {
            "questionIndex": [
                21
            ],
            "selectedOptionIndices": [
                21
            ],
            "freeText": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateSkillInput": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "description": [
                1
            ],
            "content": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateSkillInput": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "description": [
                1
            ],
            "content": [
                1
            ],
            "isActive": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "GetAuthorizationUrlForSSOInput": {
            "identityProviderId": [
                3
            ],
            "workspaceInviteHash": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SignUpInNewWorkspaceInput": {
            "displayName": [
                1
            ],
            "subdomain": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "workspaceMemberId": [
                3
            ],
            "update": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "SetupOIDCSsoInput": {
            "name": [
                1
            ],
            "issuer": [
                1
            ],
            "clientID": [
                1
            ],
            "clientSecret": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SetupSAMLSsoInput": {
            "name": [
                1
            ],
            "issuer": [
                1
            ],
            "id": [
                3
            ],
            "ssoURL": [
                1
            ],
            "certificate": [
                1
            ],
            "fingerprint": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                3
            ],
            "status": [
                183
            ],
            "__typename": [
                1
            ]
        },
        "AnalyticsType": {},
        "CreateCalendarEventInput": {
            "connectedAccountId": [
                1
            ],
            "title": [
                1
            ],
            "description": [
                1
            ],
            "location": [
                1
            ],
            "startsAt": [
                1
            ],
            "endsAt": [
                1
            ],
            "isFullDay": [
                6
            ],
            "timeZone": [
                1
            ],
            "attendees": [
                1
            ],
            "sendInvitations": [
                6
            ],
            "addConferencing": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "SendEmailInput": {
            "connectedAccountId": [
                1
            ],
            "to": [
                1
            ],
            "cc": [
                1
            ],
            "bcc": [
                1
            ],
            "subject": [
                1
            ],
            "body": [
                1
            ],
            "inReplyTo": [
                1
            ],
            "draftMessageId": [
                1
            ],
            "files": [
                496
            ],
            "__typename": [
                1
            ]
        },
        "SendEmailAttachmentInput": {
            "id": [
                1
            ],
            "name": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "name": [
                1
            ],
            "IMAP": [
                498
            ],
            "SMTP": [
                498
            ],
            "CALDAV": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionParametersInput": {
            "host": [
                1
            ],
            "port": [
                12
            ],
            "username": [
                1
            ],
            "password": [
                1
            ],
            "connectionSecurity": [
                243
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLabPublicFeatureFlagInput": {
            "publicFeatureFlag": [
                1
            ],
            "value": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "Subscription": {
            "onEventSubscription": [
                171,
                {
                    "eventStreamId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                241,
                {
                    "input": [
                        501,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                327,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "eventLogsLive": [
                316,
                {
                    "table": [
                        351,
                        "EventLogTable!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                3
            ],
            "applicationUniversalIdentifier": [
                3
            ],
            "name": [
                1
            ],
            "id": [
                3
            ],
            "universalIdentifier": [
                3
            ],
            "__typename": [
                1
            ]
        }
    }
}