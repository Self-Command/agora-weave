export interface paths {
    "/admin/accounts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listAccountsCoreAdmin
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        get: operations["listAccountsCoreAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/announcements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listAnnouncementsCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["listAnnouncementsCoreAdmin"];
        put?: never;
        /**
         * createAnnouncementCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["createAnnouncementCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/announcements/{itemId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * deleteAnnouncementCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        delete: operations["deleteAnnouncementCoreAdmin"];
        options?: never;
        head?: never;
        /**
         * patchAnnouncementCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        patch: operations["patchAnnouncementCoreAdmin"];
        trace?: never;
    };
    "/admin/appeals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getAppealsCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getAppealsCoreAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/appeals/{appealId}/decision": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * decideAppealCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["decideAppealCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/audit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getAuditCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getAuditCoreAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/backups": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listBackupsCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["listBackupsCoreAdmin"];
        put?: never;
        /**
         * createBackupCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["createBackupCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/cases": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getCasesCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getCasesCoreAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/cases/{caseId}/decision": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * decideCaseCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["decideCaseCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/cases/{caseId}/evidence/{evidenceRef}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * readCaseEvidenceCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["readCaseEvidenceCoreAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/config/definitions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getOtpConfigurationCoreAdmin
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        get: operations["getOtpConfigurationCoreAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/config/previews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * previewOtpConfigurationCoreAdmin
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        post: operations["previewOtpConfigurationCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/config/releases": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * publishOtpConfigurationCoreAdmin
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        post: operations["publishOtpConfigurationCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/config/rollbacks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * rollbackOtpConfigurationCoreAdmin
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        post: operations["rollbackOtpConfigurationCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/configuration/definitions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getConfigurationDefinitionsCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getConfigurationDefinitionsCoreAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/configuration/previews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * previewConfigurationCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["previewConfigurationCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/configuration/releases": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * publishConfigurationCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["publishConfigurationCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/configuration/rollbacks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * rollbackConfigurationCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["rollbackConfigurationCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/contents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getContentsCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getContentsCoreAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/developers/invitations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * inviteDeveloperCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["inviteDeveloperCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/document-releases/{releaseId}/withdrawals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * withdrawDocumentReleaseCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["withdrawDocumentReleaseCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/document-revisions/{revisionId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * patchDocumentRevisionCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        patch: operations["patchDocumentRevisionCoreAdmin"];
        trace?: never;
    };
    "/admin/document-revisions/{revisionId}/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * readyDocumentRevisionCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["readyDocumentRevisionCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/documents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listManagedDocumentsCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["listManagedDocumentsCoreAdmin"];
        put?: never;
        /**
         * createManagedDocumentCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["createManagedDocumentCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/documents/{documentId}/release-previews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * previewDocumentReleaseCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["previewDocumentReleaseCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/documents/{documentId}/releases": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * publishDocumentReleaseCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["publishDocumentReleaseCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/documents/{documentId}/revisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listDocumentRevisionsCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["listDocumentRevisionsCoreAdmin"];
        put?: never;
        /**
         * createDocumentRevisionCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["createDocumentRevisionCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getHealthCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getHealthCoreAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/invitations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * createInvitationCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["createInvitationCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/invitations/{invitationId}/revoke": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * revokeInvitationCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["revokeInvitationCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getMediaCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getMediaCoreAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/mfa-recovery-cases": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * createMfaRecoveryCaseCoreAdmin
         * @description Planned bounded case intake for current official identity. Intake never grants aal2 or resets factors. Final recovery requires a different currently qualified administrator and audited ownership proof; sole-owner emergency uses protected deployment-owner procedure, no public reset HTTP bypass.
         */
        post: operations["createMfaRecoveryCaseCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/mfa-recovery-cases/{caseId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getMfaRecoveryCaseCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getMfaRecoveryCaseCoreAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/mfa-recovery-cases/{caseId}/decisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * decideMfaRecoveryCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["decideMfaRecoveryCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/mfa/challenges": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * challengeMfaFactorCoreAdmin
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        post: operations["challengeMfaFactorCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/mfa/factors": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listMfaFactorsCoreAdmin
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        get: operations["listMfaFactorsCoreAdmin"];
        put?: never;
        /**
         * enrollMfaFactorCoreAdmin
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        post: operations["enrollMfaFactorCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/mfa/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * verifyMfaFactorCoreAdmin
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        post: operations["verifyMfaFactorCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/overview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getOverviewCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getOverviewCoreAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/placements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getPlacementsCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getPlacementsCoreAdmin"];
        put?: never;
        /**
         * createPlacementCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["createPlacementCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/placements/{itemId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * deletePlacementCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        delete: operations["deletePlacementCoreAdmin"];
        options?: never;
        head?: never;
        /**
         * patchPlacementCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        patch: operations["patchPlacementCoreAdmin"];
        trace?: never;
    };
    "/admin/plugin-data/purge-confirmations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * confirmPluginDataPurgeCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["confirmPluginDataPurgeCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/plugin-data/purge-previews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * previewPluginDataPurgeCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["previewPluginDataPurgeCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/plugin-installations/actions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * changePluginLifecycleCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["changePluginLifecycleCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/plugin-installations/previews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * previewPluginLifecycleCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["previewPluginLifecycleCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/plugins": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listPluginsCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["listPluginsCoreAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/plugins/{pluginId}/permission-grants": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * grantPluginPermissionsCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["grantPluginPermissionsCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/plugins/{pluginId}/reviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * reviewPluginCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["reviewPluginCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/plugins/{pluginId}/versions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listPluginVersionsCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["listPluginVersionsCoreAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/purge-jobs/{jobId}/retry": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * retryPurgeJobCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["retryPurgeJobCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/releases/{releaseId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getReleaseCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getReleaseCoreAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/releases/{releaseId}/evidence": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getReleaseEvidenceCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getReleaseEvidenceCoreAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/releases/confirmations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * confirmReleaseCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["confirmReleaseCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/releases/expand-confirmations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * confirmReleaseExpansionCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["confirmReleaseExpansionCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/releases/previews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * previewReleaseCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["previewReleaseCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/restores": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * createRestoreCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["createRestoreCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/restores/{restoreId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getRestoreCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getRestoreCoreAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/restores/previews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * previewRestoreCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["previewRestoreCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/retention/obligations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listRetentionObligationsCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["listRetentionObligationsCoreAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/retention/obligations/{obligationId}/extension-previews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * previewRetentionExtensionCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["previewRetentionExtensionCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/retention/obligations/{obligationId}/extensions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * extendRetentionObligationCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["extendRetentionObligationCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/revisions/{revisionId}/decision": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * decideRevisionCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["decideRevisionCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/roles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * grantRoleCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["grantRoleCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/roles/{grantId}/revoke": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * revokeRoleGrantCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["revokeRoleGrantCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/roles/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * previewRoleGrantCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["previewRoleGrantCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/sanctions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * createSanctionCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["createSanctionCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/sanctions/{sanctionId}/revoke": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * revokeSanctionCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["revokeSanctionCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getSessionCoreAdmin
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        get: operations["getSessionCoreAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/stepup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * createStepupCoreAdmin
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        post: operations["createStepupCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/topics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getTopicsCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getTopicsCoreAdmin"];
        put?: never;
        /**
         * createTopicCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["createTopicCoreAdmin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/topics/{itemId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * deleteTopicCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        delete: operations["deleteTopicCoreAdmin"];
        options?: never;
        head?: never;
        /**
         * patchTopicCoreAdmin
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        patch: operations["patchTopicCoreAdmin"];
        trace?: never;
    };
    "/auth/challenges": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * createCoreManagementOtpChallenge
         * @description Current implementation.
         */
        post: operations["createCoreManagementOtpChallenge"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * logoutCoreManagementSession
         * @description Current implementation.
         */
        post: operations["logoutCoreManagementSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/operations/{operationId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * readCoreManagementOtpOperation
         * @description Current implementation.
         */
        post: operations["readCoreManagementOtpOperation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * loginCorePassword
         * @description Private BFF-to-core signed protocol, disabled by default. HMAC binds timestamp, nonce, POST path and serialized body digest. Trusted ingress derives peer address. No public direct password endpoint; no synthetic example is an initialized account. Captcha and forgot success envelopes omit config_version.
         */
        post: operations["loginCorePassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/password/captcha": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * registerCorePasswordCaptcha
         * @description Private BFF-to-core signed protocol, disabled by default. HMAC binds timestamp, nonce, POST path and serialized body digest. Trusted ingress derives peer address. No public direct password endpoint; no synthetic example is an initialized account. Captcha and forgot success envelopes omit config_version.
         */
        post: operations["registerCorePasswordCaptcha"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/password/forgot": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * requestCorePasswordRecovery
         * @description Private BFF-to-core signed protocol, disabled by default. HMAC binds timestamp, nonce, POST path and serialized body digest. Trusted ingress derives peer address. No public direct password endpoint; no synthetic example is an initialized account. Captcha and forgot success envelopes omit config_version.
         */
        post: operations["requestCorePasswordRecovery"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * refreshCoreManagementSession
         * @description Current implementation.
         */
        post: operations["refreshCoreManagementSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * verifyCoreManagementOtp
         * @description Current implementation.
         */
        post: operations["verifyCoreManagementOtp"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/operations/{operationId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getOperationCoreAdmin
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        get: operations["getOperationCoreAdmin"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        AccountList: {
            has_more: boolean;
            items: components["schemas"]["ManagedAccount"][];
            /** Format: uuid */
            next_cursor: string | null;
        };
        AccountOperation: {
            /** @enum {string} */
            action: "auth.register" | "session.revoke" | "auth.logout" | "recovery.request" | "config.release" | "config.rollback" | "post.create" | "comment.create" | "like.put" | "like.remove";
            operation_id: components["schemas"]["Uuid"];
            result?: components["schemas"]["ConfigRelease"] | components["schemas"]["RevisionReceipt"] | components["schemas"]["ReactionReceipt"];
            /** @enum {string} */
            state: "pending" | "succeeded" | "failed" | "unknown";
        };
        AccountOperationEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["AccountOperation"];
            request_id: components["schemas"]["Uuid"];
        };
        ActionReceipt: {
            allowed_actions: string[];
            operation_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            state: "pending" | "succeeded" | "failed" | "unknown";
            target_ref?: components["schemas"]["Uuid"];
        };
        ActionReceiptEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["ActionReceipt"];
            request_id: components["schemas"]["Uuid"];
        };
        AdminCase: {
            allowed_actions: string[];
            created_at: components["schemas"]["Timestamp"];
            /** Format: uuid */
            handler_id: string | null;
            id: components["schemas"]["Uuid"];
            row_version: number;
            /** @enum {string} */
            state: "pending" | "reviewing" | "processed" | "not_actionable";
            target_ref: components["schemas"]["Uuid"];
        };
        AdminCaseEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["AdminCase"];
            request_id: components["schemas"]["Uuid"];
        };
        AdminCasePage: {
            has_more: boolean;
            items: components["schemas"]["AdminCase"][];
            next_cursor: string | null;
        };
        AdminCasePageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["AdminCasePage"];
            request_id: components["schemas"]["Uuid"];
        };
        AdminDecision: {
            base_version?: number;
            /** @enum {string} */
            decision: "approve" | "reject" | "uphold" | "overturn";
            operation_id: components["schemas"]["Uuid"];
            reason: string;
            stepup_id: components["schemas"]["Uuid"];
        };
        Administrator: {
            account: {
                id: components["schemas"]["Uuid"];
                phone_masked: string;
            };
            /** @enum {string} */
            environment: "dev" | "test" | "production";
            mfa: {
                /** @enum {string} */
                aal: "aal1" | "aal2";
                enrolled: boolean;
                verified: boolean;
            };
            permissions: string[];
            roles: string[];
            /** Format: date-time */
            sensitive_until: string | null;
        };
        AdministratorEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Administrator"];
            request_id: components["schemas"]["Uuid"];
        };
        AdminMedia: {
            allowed_actions: string[];
            id: components["schemas"]["Uuid"];
            /** @enum {string} */
            kind: "image" | "video" | "gif";
            mime: string;
            owner_id: components["schemas"]["Uuid"];
            size_bytes: number;
            /** @enum {string} */
            state: "allocated" | "uploading" | "uploaded" | "validated" | "reviewed" | "bound" | "failed" | "quarantined" | "orphan" | "cleaned";
        };
        AdminMediaPage: {
            has_more: boolean;
            items: components["schemas"]["AdminMedia"][];
            next_cursor: string | null;
        };
        AdminMediaPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["AdminMediaPage"];
            request_id: components["schemas"]["Uuid"];
        };
        AdminOverview: {
            active_accounts: number;
            awaiting_independent_appeals: number;
            generated_at: components["schemas"]["Timestamp"];
            open_cases: number;
            pending_revisions: number;
        };
        AdminOverviewEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["AdminOverview"];
            request_id: components["schemas"]["Uuid"];
        };
        AdminSensitiveCommand: {
            operation_id: components["schemas"]["Uuid"];
            preview_digest: components["schemas"]["Digest"];
            reason: string;
            stepup_id: components["schemas"]["Uuid"];
        };
        /** @description Wire parser accepts boolean; successful registration requires declared=true and current version. */
        AgeDeclaration: {
            declared: boolean;
            version: string;
        };
        AiAnswer: {
            allowed_actions: string[];
            body: string;
            created_at: components["schemas"]["Timestamp"];
            id: components["schemas"]["Uuid"];
            request_id: components["schemas"]["Uuid"];
            sources: components["schemas"]["AiSource"][];
            /** @enum {string} */
            state: "available" | "unavailable";
        };
        AiAnswerCopy: {
            answer_id: components["schemas"]["Uuid"];
            body: string;
        };
        AiAnswerCopyEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["AiAnswerCopy"];
            request_id: components["schemas"]["Uuid"];
        };
        AiConversation: {
            allowed_actions: string[];
            created_at: components["schemas"]["Timestamp"];
            id: components["schemas"]["Uuid"];
            last_activity_at: components["schemas"]["Timestamp"];
            row_version: number;
            title: string;
        };
        AiConversationCreate: {
            operation_id: components["schemas"]["Uuid"];
            title?: string;
        };
        AiConversationDetail: {
            answers: components["schemas"]["AiAnswer"][];
            conversation: components["schemas"]["AiConversation"];
        };
        AiConversationDetailEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["AiConversationDetail"];
            request_id: components["schemas"]["Uuid"];
        };
        AiConversationEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["AiConversation"];
            request_id: components["schemas"]["Uuid"];
        };
        AiConversationPage: {
            has_more: boolean;
            items: components["schemas"]["AiConversation"][];
            next_cursor: string | null;
        };
        AiConversationPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["AiConversationPage"];
            request_id: components["schemas"]["Uuid"];
        };
        AiConversationPatch: {
            base_version: number;
            operation_id: components["schemas"]["Uuid"];
            title: string;
        };
        AiFeedbackRequest: {
            comment?: string;
            /** @enum {string} */
            kind: "helpful" | "unhelpful";
            operation_id: components["schemas"]["Uuid"];
        };
        AiModel: {
            /** @enum {string} */
            availability: "available" | "unavailable";
            id: string;
            max_input_tokens?: number;
            max_output_tokens?: number;
            name: string;
            service_version?: string;
            unavailable_code?: string;
        };
        AiModels: {
            items: components["schemas"]["AiModel"][];
        };
        AiModelsEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["AiModels"];
            request_id: components["schemas"]["Uuid"];
        };
        AiRequest: {
            answer?: components["schemas"]["AiAnswer"];
            conversation_id: components["schemas"]["Uuid"];
            id: components["schemas"]["Uuid"];
            operation_id: components["schemas"]["Uuid"];
            retry_of?: components["schemas"]["Uuid"];
            /** @enum {string} */
            state: "submitted" | "retrieving" | "generating" | "completed" | "stopped" | "failed" | "unknown";
            stream_path?: string;
        };
        AiRequestEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["AiRequest"];
            request_id: components["schemas"]["Uuid"];
        };
        /** @description Notice version/purpose and current source/author AI permissions independently validated; notice does not grant private source rights. */
        AiRequestInput: {
            conversation_id: components["schemas"]["Uuid"];
            input: string;
            model: string;
            notice_receipt_ref?: components["schemas"]["Uuid"];
            notice_ref: components["schemas"]["Uuid"];
            operation_id: components["schemas"]["Uuid"];
            selected_refs: components["schemas"]["AiSource"][];
        };
        AiSource: {
            id: components["schemas"]["Uuid"];
            /** @enum {string} */
            kind: "resource" | "document_release" | "previous_answer" | "self" | "draft";
            /** @enum {string} */
            purpose: "retrieve" | "summarize" | "recommend";
            revision_id?: components["schemas"]["Uuid"];
        };
        AiStreamEvent: {
            answer_id?: components["schemas"]["Uuid"];
            event_id: number;
            request_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            state: "submitted" | "retrieving" | "generating" | "completed" | "stopped" | "failed" | "unknown";
            text?: string;
            /** @enum {string} */
            type: "status" | "delta" | "completed" | "stopped" | "failed" | "access_changed";
        };
        AiUsage: {
            /** Format: date */
            day_bucket: string;
            limit: number;
            reserved: number;
            reset_at: components["schemas"]["Timestamp"];
            settled: number;
            timezone: string;
            unknown: number;
        };
        AiUsageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["AiUsage"];
            request_id: components["schemas"]["Uuid"];
        };
        /** @description Per-purpose author choice. Resource permission intersects account policy and current resource read qualification. Re-enable never revives invalid dependencies. */
        AiUsePolicy: {
            account_id?: components["schemas"]["Uuid"];
            policy_epoch: number;
            recommend: boolean;
            resource_id?: components["schemas"]["Uuid"];
            retrieve: boolean;
            row_version: number;
            summarize: boolean;
        };
        AiUsePolicyEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["AiUsePolicy"];
            request_id: components["schemas"]["Uuid"];
        };
        AiUsePolicyPatch: {
            base_version: number;
            operation_id: components["schemas"]["Uuid"];
            recommend?: boolean;
            retrieve?: boolean;
            summarize?: boolean;
        };
        Announcement: {
            /** Format: date-time */
            ends_at: string | null;
            id: components["schemas"]["Uuid"];
            post_id: components["schemas"]["Uuid"];
            row_version: number;
            starts_at: components["schemas"]["Timestamp"];
            /** @enum {string} */
            state: "scheduled" | "active" | "ended" | "withdrawn";
        };
        AnnouncementEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Announcement"];
            request_id: components["schemas"]["Uuid"];
        };
        AnnouncementPage: {
            has_more: boolean;
            items: components["schemas"]["Announcement"][];
            next_cursor: string | null;
        };
        AnnouncementPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["AnnouncementPage"];
            request_id: components["schemas"]["Uuid"];
        };
        /** @description Announcement references current approved content; no fake counts or bypass of content review, read permission or author scope. */
        AnnouncementWrite: {
            base_version?: number;
            /** Format: date-time */
            ends_at: string | null;
            operation_id: components["schemas"]["Uuid"];
            post_id: components["schemas"]["Uuid"];
            reason: string;
            starts_at: components["schemas"]["Timestamp"];
        };
        Appeal: {
            allowed_actions: string[];
            created_at: components["schemas"]["Timestamp"];
            /** @enum {string|null} */
            decision: "uphold" | "overturn" | null;
            /** @enum {string} */
            execution_state: "pending" | "succeeded" | "failed";
            id: components["schemas"]["Uuid"];
            sanction_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            state: "awaiting_independent_review" | "reviewing" | "decided";
            statement: string;
        };
        AppealEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Appeal"];
            request_id: components["schemas"]["Uuid"];
        };
        AppealPage: {
            has_more: boolean;
            items: components["schemas"]["Appeal"][];
            next_cursor: string | null;
        };
        AppealPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["AppealPage"];
            request_id: components["schemas"]["Uuid"];
        };
        AppealRequest: {
            media_refs: components["schemas"]["Uuid"][];
            operation_id: components["schemas"]["Uuid"];
            sanction_id: components["schemas"]["Uuid"];
            statement: string;
        };
        ArtifactDigest: {
            artifact_ref: string;
            /** @enum {string} */
            component: "core" | "admin" | "share" | "mobile" | "plugin";
            digest: components["schemas"]["Digest"];
            platform?: string;
        };
        AuditEvent: {
            actor_id?: components["schemas"]["Uuid"];
            after_digest?: string | null;
            before_digest?: string | null;
            /** @enum {string} */
            environment: "dev" | "test" | "production";
            id: components["schemas"]["Uuid"];
            object_ref?: components["schemas"]["Uuid"];
            occurred_at: components["schemas"]["Timestamp"];
            operation: string;
            plugin_id?: string;
            reason: string;
            request_id: components["schemas"]["Uuid"];
            result: string;
        };
        AuditPage: {
            has_more: boolean;
            items: components["schemas"]["AuditEvent"][];
            next_cursor: string | null;
        };
        AuditPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["AuditPage"];
            request_id: components["schemas"]["Uuid"];
        };
        AuthOperation: components["schemas"]["AuthReceipt"] | components["schemas"]["PendingAuthOperation"];
        AuthOperationEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["AuthOperation"];
            request_id: components["schemas"]["Uuid"];
        };
        AuthorIndexPatch: {
            allow_indexing: boolean;
            base_version: number;
            operation_id: components["schemas"]["Uuid"];
        };
        AuthorIndexPolicy: {
            account_id: components["schemas"]["Uuid"];
            allow_indexing: boolean;
            policy_epoch: number;
            row_version: number;
        };
        AuthorIndexPolicyEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["AuthorIndexPolicy"];
            request_id: components["schemas"]["Uuid"];
        };
        AuthReceipt: {
            account: {
                admitted: boolean;
                id: components["schemas"]["Uuid"];
            };
            session: components["schemas"]["SessionTokens"];
        };
        AuthReceiptEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["AuthReceipt"];
            request_id: components["schemas"]["Uuid"];
        };
        /** @description Metadata only; encryption secret, credentials, raw object paths and backup content never exposed. */
        Backup: {
            captured_at: components["schemas"]["Timestamp"];
            config_version: components["schemas"]["ConfigVersion"];
            database_digest: components["schemas"]["Digest"];
            expires_at: components["schemas"]["Timestamp"];
            id: components["schemas"]["Uuid"];
            objects_digest: components["schemas"]["Digest"];
            schema_version: number;
            security_watermark: number;
            /** @enum {string} */
            state: "pending" | "running" | "completed" | "failed";
        };
        BackupEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Backup"];
            request_id: components["schemas"]["Uuid"];
        };
        BackupPage: {
            has_more: boolean;
            items: components["schemas"]["Backup"][];
            next_cursor: string | null;
        };
        BackupPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["BackupPage"];
            request_id: components["schemas"]["Uuid"];
        };
        Bookmark: {
            created_at: components["schemas"]["Timestamp"];
            target: components["schemas"]["PostProjection"];
        };
        BookmarkEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Bookmark"];
            request_id: components["schemas"]["Uuid"];
        };
        BookmarkPage: {
            has_more: boolean;
            items: components["schemas"]["Bookmark"][];
            next_cursor: string | null;
        };
        BookmarkPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["BookmarkPage"];
            request_id: components["schemas"]["Uuid"];
        };
        BrowserAdministrator: {
            administrator: components["schemas"]["Administrator"];
        };
        BrowserAdministratorEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["BrowserAdministrator"];
            request_id: components["schemas"]["Uuid"];
        };
        BrowserForgotPasswordRequest: {
            captcha_answer: string;
            captcha_id: components["schemas"]["Uuid"];
            operation_id: components["schemas"]["Uuid"];
            username: string;
        };
        BrowserMfaEnrollmentRequest: {
            friendly_name: string;
        };
        BrowserPasswordRequest: {
            captcha_answer: string;
            captcha_id: components["schemas"]["Uuid"];
            operation_id: components["schemas"]["Uuid"];
            password: string;
            username: string;
        };
        BrowserStepupReceipt: {
            expires_at: components["schemas"]["Timestamp"];
            stepup_id: components["schemas"]["Uuid"];
        };
        BrowserStepupReceiptEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["BrowserStepupReceipt"];
            request_id: components["schemas"]["Uuid"];
        };
        CancellationReceipt: {
            access_revoked: boolean;
            cancelled_at: components["schemas"]["Timestamp"];
            purge_due_at: components["schemas"]["Timestamp"];
            /** @enum {string} */
            purge_state: "pending" | "running" | "failed" | "physical_removed";
        };
        CancellationReceiptEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["CancellationReceipt"];
            request_id: components["schemas"]["Uuid"];
        };
        CancellationRequest: {
            base_version: number;
            /** @enum {boolean} */
            confirmed: true;
            operation_id: components["schemas"]["Uuid"];
            preview_digest: components["schemas"]["Digest"];
            verification_ref: components["schemas"]["Uuid"];
        };
        Captcha: {
            captcha_id: components["schemas"]["Uuid"];
            expires_at: components["schemas"]["Timestamp"];
            image_data_url: string;
        };
        CaptchaUnversionedEnvelope: {
            data: components["schemas"]["Captcha"];
            request_id: components["schemas"]["Uuid"];
        };
        /** @description Resolved from server release registration and actual approved artifact/runtime. Client capability claims never grant data or feature rights. Safe existing functionality remains available for partial incompatibility. */
        ClientCompatibility: {
            client_release: string;
            contract_version: string;
            /** @enum {string} */
            platform: "android" | "ios" | "web";
            reason: string;
            security_help_document_ref?: components["schemas"]["Uuid"];
            /** @enum {string} */
            state: "compatible" | "partially_incompatible" | "update_required";
            unavailable_capabilities: string[];
            /** Format: uri */
            update_url?: string;
        };
        ClientCompatibilityEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["ClientCompatibility"];
            request_id: components["schemas"]["Uuid"];
        };
        Comment: {
            allowed_actions: string[];
            author_id: components["schemas"]["Uuid"];
            /** @description Current visible-character limit uses Unicode 17 UAX29 grapheme clusters; JSON Schema code-point maxLength is not authoritative. */
            body: string;
            created_at: components["schemas"]["Timestamp"];
            display_depth: number;
            id: components["schemas"]["Uuid"];
            media: components["schemas"]["MediaReference"][];
            /** Format: uuid */
            parent_comment_id: string | null;
            post_id: components["schemas"]["Uuid"];
            /** Format: uuid */
            reply_to_id: string | null;
            row_version: number;
        };
        CommentCreate: {
            /** @description Current visible-character limit uses Unicode 17 UAX29 grapheme clusters; JSON Schema code-point maxLength is not authoritative. */
            body: string;
            media_refs?: components["schemas"]["Uuid"][];
            operation_id: components["schemas"]["Uuid"];
            parent_comment_id?: components["schemas"]["Uuid"];
            reply_to_id?: components["schemas"]["Uuid"];
        };
        CommentPage: {
            has_more: boolean;
            items: components["schemas"]["CommentProjection"][];
            next_cursor: string | null;
        };
        CommentPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["CommentPage"];
            request_id: components["schemas"]["Uuid"];
        };
        CommentProjection: components["schemas"]["Comment"] | components["schemas"]["UnavailableResource"];
        ConfigCommitRequest: {
            operation_id: components["schemas"]["Uuid"];
            preview_digest: components["schemas"]["Digest"];
            preview_id: components["schemas"]["Uuid"];
            stepup_id: components["schemas"]["Uuid"];
        };
        ConfigDefinition: {
            allowed_scopes: ("global" | "environment" | "module" | "plugin" | "user_group")[];
            conflicts: string[];
            consumer_ids: string[];
            default: components["schemas"]["JsonValue"];
            dependencies: string[];
            description: string;
            /** @enum {string} */
            effect_mode: "immediate" | "reload";
            existing_object_policy: string;
            key: string;
            owner_module?: string;
            owner_plugin?: string;
            read_permission: string;
            sensitive: boolean;
            /** @enum {string} */
            status: "confirmed" | "engineering" | "provisional";
            validation_refs: string[];
            value_schema: components["schemas"]["JsonSchemaDefinition"];
            write_permission: string;
        };
        ConfigDefinitions: {
            base_version: components["schemas"]["ConfigVersion"];
            definitions: components["schemas"]["ConfigDefinition"][];
        };
        ConfigDefinitionsEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["ConfigDefinitions"];
            request_id: components["schemas"]["Uuid"];
        };
        ConfigPreview: {
            action_digest: components["schemas"]["Digest"];
            base_version: components["schemas"]["ConfigVersion"];
            changes: {
                after: number;
                before: number;
                key: components["schemas"]["OtpKey"];
            }[];
            existing_object_impacts: string[];
            expires_at: components["schemas"]["Timestamp"];
            preview_digest: components["schemas"]["Digest"];
            preview_id: components["schemas"]["Uuid"];
            values: components["schemas"]["OtpValues"];
        };
        ConfigPreviewEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["ConfigPreview"];
            request_id: components["schemas"]["Uuid"];
        };
        ConfigPreviewRequest: components["schemas"]["ConfigValuesPreviewRequest"] | components["schemas"]["ConfigRollbackPreviewRequest"];
        ConfigRelease: {
            /** @enum {string} */
            kind: "release" | "rollback";
            previous_version: components["schemas"]["ConfigVersion"];
            /** @enum {string} */
            state: "active";
            version: components["schemas"]["ConfigVersion"];
        };
        ConfigReleaseEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["ConfigRelease"];
            request_id: components["schemas"]["Uuid"];
        };
        ConfigRollbackPreviewRequest: {
            base_version: components["schemas"]["ConfigVersion"];
            operation_id: components["schemas"]["Uuid"];
            reason: string;
            rollback_version: components["schemas"]["ConfigVersion"];
        };
        ConfigValuesPreviewRequest: {
            base_version: components["schemas"]["ConfigVersion"];
            operation_id: components["schemas"]["Uuid"];
            reason: string;
            values: components["schemas"]["OtpValues"];
        };
        ConfigVersion: string;
        ConfirmedCommand: {
            base_version: number;
            /** @enum {boolean} */
            confirmed: true;
            operation_id: components["schemas"]["Uuid"];
            preview_digest: components["schemas"]["Digest"];
        };
        /** @description Wire parser accepts these decisions; registration admission requires each applicable item to be consented. */
        Consent: {
            /** @enum {string} */
            decision: "consented" | "presented" | "acknowledged";
            digest: components["schemas"]["Digest"];
            release_id: components["schemas"]["Uuid"];
        };
        ContentPatch: {
            alt_text?: string[];
            base_version: number;
            /** @description Current visible-character limit uses Unicode 17 UAX29 grapheme clusters and active configuration. */
            body?: string;
            operation_id: components["schemas"]["Uuid"];
            tags?: string[];
        };
        ContentRevision: {
            alt_text: string[];
            /** @description Current visible-character limit uses Unicode 17 UAX29 grapheme clusters and active configuration. */
            body: string;
            id: components["schemas"]["Uuid"];
            mentions: components["schemas"]["Uuid"][];
            resource_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            review_state: "pending" | "approved" | "rejected";
            revision_no: number;
            submitted_at: components["schemas"]["Timestamp"];
            tags: string[];
        };
        Conversation: {
            allowed_actions: string[];
            created_at: components["schemas"]["Timestamp"];
            id: components["schemas"]["Uuid"];
            last_activity_at: components["schemas"]["Timestamp"];
            muted: boolean;
            recipient_id: components["schemas"]["Uuid"];
            unread_count: number;
        };
        ConversationPage: {
            has_more: boolean;
            items: components["schemas"]["Conversation"][];
            next_cursor: string | null;
        };
        ConversationPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["ConversationPage"];
            request_id: components["schemas"]["Uuid"];
        };
        ConversationReadRequest: {
            operation_id: components["schemas"]["Uuid"];
            read_cursor: number;
        };
        CoreCaptchaReceipt: {
            registered: boolean;
        };
        CoreCaptchaReceiptUnversionedEnvelope: {
            data: components["schemas"]["CoreCaptchaReceipt"];
            request_id: components["schemas"]["Uuid"];
        };
        CoreCaptchaRegistration: {
            captcha_id: components["schemas"]["Uuid"];
            expires_at: components["schemas"]["Timestamp"];
        };
        CoreForgotPasswordRequest: {
            captcha_id: components["schemas"]["Uuid"];
            captcha_valid: boolean;
            operation_id: components["schemas"]["Uuid"];
            username: string;
        };
        CoreMfaVerification: {
            administrator: components["schemas"]["Administrator"];
            session: components["schemas"]["SessionTokens"];
        };
        CoreMfaVerificationEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["CoreMfaVerification"];
            request_id: components["schemas"]["Uuid"];
        };
        /** @description password required when captcha_valid=true for login; 14..72 UTF-8 bytes. When false, password omitted. BFF derives captcha_valid; browser may not submit it. */
        CorePasswordRequest: {
            captcha_id: components["schemas"]["Uuid"];
            captcha_valid: boolean;
            operation_id: components["schemas"]["Uuid"];
            password?: string;
            username: string;
        };
        CoreStepupReceipt: {
            expires_at: components["schemas"]["Timestamp"];
            session: components["schemas"]["SessionTokens"];
            stepup_id: components["schemas"]["Uuid"];
        };
        CoreStepupReceiptEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["CoreStepupReceipt"];
            request_id: components["schemas"]["Uuid"];
        };
        CreateBackupRequest: {
            /** @enum {string} */
            environment: "dev" | "test" | "production";
            operation_id: components["schemas"]["Uuid"];
            reason: string;
            stepup_id: components["schemas"]["Uuid"];
        };
        CreateDmRequest: {
            initial_text: string;
            operation_id: components["schemas"]["Uuid"];
            recipient_id: components["schemas"]["Uuid"];
        };
        CreatePostRequest: {
            /** @description Current visible-character limit uses Unicode 17 UAX29 grapheme clusters and active configuration. */
            body: string;
            /** @enum {string} */
            indexing_mode?: "inherit" | "allow" | "deny";
            media_refs?: components["schemas"]["Uuid"][];
            mentions?: components["schemas"]["Uuid"][];
            operation_id: components["schemas"]["Uuid"];
            poll?: components["schemas"]["PollInput"];
            /** @enum {string} */
            reply_scope: "all_readers" | "author_follows" | "mentioned" | "closed";
            source_id?: components["schemas"]["Uuid"];
            tags?: string[];
            /** @enum {string} */
            type: "text" | "long_text" | "images" | "video" | "gif" | "poll" | "quote";
            /** @enum {string} */
            visibility: "public" | "followers" | "self";
        };
        CreateSanction: {
            /** Format: date-time */
            ends_at: string | null;
            functions: string[];
            operation_id: components["schemas"]["Uuid"];
            reason: string;
            starts_at: components["schemas"]["Timestamp"];
            stepup_id: components["schemas"]["Uuid"];
            subject_id?: components["schemas"]["Uuid"];
            target_id?: components["schemas"]["Uuid"];
            /** @enum {string} */
            type: "function" | "temporary" | "permanent";
        };
        CurrentDocuments: components["schemas"]["RegistrationDocuments"] | components["schemas"]["PublishedDocumentSet"];
        CurrentDocumentsEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["CurrentDocuments"];
            request_id: components["schemas"]["Uuid"];
        };
        Deletion: {
            allowed_actions: string[];
            deleted_at: components["schemas"]["Timestamp"];
            id: components["schemas"]["Uuid"];
            /** @enum {string} */
            purge_state: "pending" | "running" | "failed" | "physical_removed";
            restore_until: components["schemas"]["Timestamp"];
            /** @enum {string} */
            state: "deleted" | "restored" | "physical_removed";
            target_id: components["schemas"]["Uuid"];
            undo_until: components["schemas"]["Timestamp"];
        };
        DeletionEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Deletion"];
            request_id: components["schemas"]["Uuid"];
        };
        DeletionPage: {
            has_more: boolean;
            items: components["schemas"]["Deletion"][];
            next_cursor: string | null;
        };
        DeletionPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["DeletionPage"];
            request_id: components["schemas"]["Uuid"];
        };
        DeveloperInvitation: {
            allowed_actions: ("submit" | "preview" | "test")[];
            developer_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            environment: "dev" | "test";
            expires_at: components["schemas"]["Timestamp"];
            id: components["schemas"]["Uuid"];
            plugin_ids: string[];
            /** @enum {string} */
            state: "active" | "revoked" | "expired";
        };
        DeveloperInvitationEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["DeveloperInvitation"];
            request_id: components["schemas"]["Uuid"];
        };
        DeveloperInvitationRequest: {
            account_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            environment: "dev" | "test";
            expires_at: components["schemas"]["Timestamp"];
            operation_id: components["schemas"]["Uuid"];
            plugin_ids: string[];
            reason: string;
            stepup_id: components["schemas"]["Uuid"];
        };
        DeviceSession: {
            created_at: components["schemas"]["Timestamp"];
            current: boolean;
            device_label: string;
            id: components["schemas"]["Uuid"];
            row_version: number;
            /** Format: date-time */
            trusted_at: string | null;
        };
        Digest: string;
        Discovery: {
            posts: components["schemas"]["PostPage"];
            topics: {
                count: number;
                name: string;
            }[];
        };
        DiscoveryEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Discovery"];
            request_id: components["schemas"]["Uuid"];
        };
        /** @description No private reason for inability to contact. */
        DmEligibility: {
            allowed_actions: ("send" | "request")[];
            contactable: boolean;
            recipient_id: components["schemas"]["Uuid"];
        };
        DmEligibilityEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["DmEligibility"];
            request_id: components["schemas"]["Uuid"];
        };
        DmRequest: {
            allowed_actions: string[];
            created_at: components["schemas"]["Timestamp"];
            expires_at: components["schemas"]["Timestamp"];
            id: components["schemas"]["Uuid"];
            initial_message_id: components["schemas"]["Uuid"];
            initial_text: string;
            recipient_id: components["schemas"]["Uuid"];
            sender_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            state: "pending" | "accepted" | "rejected" | "deleted" | "cancelled" | "expired" | "blocked" | "ended";
        };
        DmRequestEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["DmRequest"];
            request_id: components["schemas"]["Uuid"];
        };
        DmRequestPage: {
            has_more: boolean;
            items: components["schemas"]["DmRequest"][];
            next_cursor: string | null;
        };
        DmRequestPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["DmRequestPage"];
            request_id: components["schemas"]["Uuid"];
        };
        DocumentReady: {
            base_version: number;
            content_digest: components["schemas"]["Digest"];
            operation_id: components["schemas"]["Uuid"];
        };
        DocumentReceipt: {
            /** @enum {string} */
            decision: "presented" | "acknowledged" | "consented" | "declined";
            digest: components["schemas"]["Digest"];
            id: components["schemas"]["Uuid"];
            occurred_at: components["schemas"]["Timestamp"];
            presentation_ref: components["schemas"]["Uuid"];
            purpose: string;
            release_id: components["schemas"]["Uuid"];
        };
        DocumentReceiptEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["DocumentReceipt"];
            request_id: components["schemas"]["Uuid"];
        };
        DocumentReceiptPage: {
            has_more: boolean;
            items: components["schemas"]["DocumentReceipt"][];
            next_cursor: string | null;
        };
        DocumentReceiptPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["DocumentReceiptPage"];
            request_id: components["schemas"]["Uuid"];
        };
        DocumentReceiptRequest: {
            /** @enum {string} */
            decision: "presented" | "acknowledged" | "consented" | "declined";
            digest: components["schemas"]["Digest"];
            operation_id: components["schemas"]["Uuid"];
            presentation_ref: components["schemas"]["Uuid"];
            purpose: string;
            release_id: components["schemas"]["Uuid"];
        };
        DocumentReleaseCommand: {
            content_digest: components["schemas"]["Digest"];
            operation_id: components["schemas"]["Uuid"];
            preview_digest: components["schemas"]["Digest"];
            reason: string;
            release_confirmation?: components["schemas"]["Uuid"];
            revision_id: components["schemas"]["Uuid"];
            scope: components["schemas"]["DocumentScope"];
            stepup_id: components["schemas"]["Uuid"];
        };
        DocumentReleasePreviewRequest: {
            content_digest: components["schemas"]["Digest"];
            operation_id: components["schemas"]["Uuid"];
            reason: string;
            revision_id: components["schemas"]["Uuid"];
            scope: components["schemas"]["DocumentScope"];
        };
        DocumentReleaseState: {
            content_digest: components["schemas"]["Digest"];
            document_id: components["schemas"]["Uuid"];
            is_current: boolean;
            /** Format: date-time */
            published_at: string | null;
            release_id: components["schemas"]["Uuid"];
            revision_id: components["schemas"]["Uuid"];
            scope: components["schemas"]["DocumentScope"];
            /** @enum {string} */
            state: "published" | "superseded" | "withdrawn";
        };
        DocumentReleaseStateEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["DocumentReleaseState"];
            request_id: components["schemas"]["Uuid"];
        };
        DocumentRevision: {
            body: string;
            content_digest: components["schemas"]["Digest"];
            created_at: components["schemas"]["Timestamp"];
            document_id: components["schemas"]["Uuid"];
            id: components["schemas"]["Uuid"];
            linked_release_refs: components["schemas"]["Uuid"][];
            row_version: number;
            /** @enum {string} */
            state: "draft" | "ready";
            title: string;
            version: number;
        };
        DocumentRevisionEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["DocumentRevision"];
            request_id: components["schemas"]["Uuid"];
        };
        DocumentRevisionPage: {
            has_more: boolean;
            items: components["schemas"]["DocumentRevision"][];
            next_cursor: string | null;
        };
        DocumentRevisionPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["DocumentRevisionPage"];
            request_id: components["schemas"]["Uuid"];
        };
        DocumentRevisionWrite: {
            base_version?: number;
            body: string;
            linked_release_refs?: components["schemas"]["Uuid"][];
            operation_id: components["schemas"]["Uuid"];
            title: string;
        };
        DocumentScope: {
            /** @enum {string} */
            environment: "dev" | "test" | "production";
            purposes?: string[] | null;
            surfaces: ("app" | "share" | "admin")[];
        };
        Draft: {
            /** @description Current visible-character limit uses Unicode 17 UAX29 grapheme clusters and active configuration. */
            body: string;
            id: components["schemas"]["Uuid"];
            last_saved: components["schemas"]["Timestamp"];
            media_refs: components["schemas"]["Uuid"][];
            metadata: {
                /** @enum {string} */
                indexing_mode?: "inherit" | "allow" | "deny";
                mentions?: components["schemas"]["Uuid"][];
                poll?: components["schemas"]["PollInput"];
                /** @enum {string} */
                reply_scope?: "all_readers" | "author_follows" | "mentioned" | "closed";
                source_id?: components["schemas"]["Uuid"];
                tags?: string[];
                /** @enum {string} */
                type?: "text" | "long_text" | "images" | "video" | "gif" | "poll" | "quote";
                /** @enum {string} */
                visibility?: "public" | "followers" | "self";
            };
            row_version: number;
        };
        DraftEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Draft"];
            request_id: components["schemas"]["Uuid"];
        };
        DraftPage: {
            has_more: boolean;
            items: components["schemas"]["Draft"][];
            next_cursor: string | null;
        };
        DraftPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["DraftPage"];
            request_id: components["schemas"]["Uuid"];
        };
        DraftWrite: {
            base_version: number;
            /** @description Current visible-character limit uses Unicode 17 UAX29 grapheme clusters and active configuration. */
            body: string;
            import_confirmed?: boolean;
            media_refs?: components["schemas"]["Uuid"][];
            metadata?: {
                /** @enum {string} */
                indexing_mode?: "inherit" | "allow" | "deny";
                mentions?: components["schemas"]["Uuid"][];
                poll?: components["schemas"]["PollInput"];
                /** @enum {string} */
                reply_scope?: "all_readers" | "author_follows" | "mentioned" | "closed";
                source_id?: components["schemas"]["Uuid"];
                tags?: string[];
                /** @enum {string} */
                type?: "text" | "long_text" | "images" | "video" | "gif" | "poll" | "quote";
                /** @enum {string} */
                visibility?: "public" | "followers" | "self";
            };
            operation_id: components["schemas"]["Uuid"];
        };
        EffectiveConfiguration: {
            values: {
                [key: string]: components["schemas"]["JsonValue"];
            };
            version: components["schemas"]["ConfigVersion"];
        };
        EffectiveConfigurationEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["EffectiveConfiguration"];
            request_id: components["schemas"]["Uuid"];
        };
        Empty: Record<string, never>;
        Error: {
            code: string;
            current_config_version?: components["schemas"]["ConfigVersion"];
            field_errors?: {
                [key: string]: string;
            };
            message: string;
            operation_id?: components["schemas"]["Uuid"];
            request_id: components["schemas"]["Uuid"];
            retry_after_seconds?: number;
            retryable: boolean;
        };
        EventPage: {
            cursor: number;
            items: components["schemas"]["ProjectedEvent"][];
        };
        EventPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["EventPage"];
            request_id: components["schemas"]["Uuid"];
        };
        /** @description Only case-specific minimum evidence, audited purpose, never unrestricted private history. */
        EvidenceProjection: {
            allowed_actions: string[];
            body?: string;
            case_id: components["schemas"]["Uuid"];
            evidence_ref: components["schemas"]["Uuid"];
            expires_at: components["schemas"]["Timestamp"];
            /** @enum {string} */
            kind: "text" | "media" | "metadata";
            media_ref?: components["schemas"]["Uuid"];
        };
        EvidenceProjectionEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["EvidenceProjection"];
            request_id: components["schemas"]["Uuid"];
        };
        EvidenceResult: {
            artifact_digest: components["schemas"]["Digest"];
            attempt: number;
            commit_sha: string;
            /** @enum {string} */
            environment: "dev" | "test" | "production";
            id: components["schemas"]["Uuid"];
            /** @enum {string} */
            kind: "business" | "security" | "concurrency" | "native" | "build" | "layout";
            occurred_at: components["schemas"]["Timestamp"];
            /** Format: uri */
            run_url: string;
            /** @enum {string} */
            status: "passed" | "failed" | "skipped" | "cancelled" | "timed_out" | "not_run";
        };
        EvidenceResults: {
            complete: boolean;
            items: components["schemas"]["EvidenceResult"][];
            required_ids: components["schemas"]["Uuid"][];
        };
        EvidenceResultsEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["EvidenceResults"];
            request_id: components["schemas"]["Uuid"];
        };
        ExtensionDescriptor: {
            plugin_id: string;
            required_capabilities: string[];
            route?: string;
            slot: string;
            /** @enum {string} */
            state: "available" | "disabled" | "incompatible" | "unavailable";
            tree?: components["schemas"]["ExtensionNode"];
            /** @enum {string} */
            ui_schema: "1.0";
            version: string;
        };
        /** @description Declarative schema v1; depth <=20, total <=1000 nodes. Host white-listed properties and registered capabilities only. Never raw HTML, JS/eval, SQL, token or arbitrary URL. */
        ExtensionNode: {
            binding?: string;
            children?: components["schemas"]["ExtensionNode"][];
            events?: {
                [key: string]: {
                    /** @enum {string} */
                    kind: "navigate" | "read" | "submit" | "confirm";
                    schema_id?: string;
                    target: string;
                };
            };
            id: string;
            props: {
                alt?: string;
                disabled?: boolean;
                icon?: string;
                label?: string;
                media_ref?: components["schemas"]["Uuid"];
                route?: string;
                text?: string;
                value?: components["schemas"]["JsonValue"];
                variant?: string;
            };
            required_capabilities?: string[];
            /** @enum {string} */
            type: "page" | "stack" | "row" | "text" | "icon" | "button" | "input" | "toggle" | "select" | "list" | "table" | "detail" | "media" | "notice" | "dialog";
        };
        Extensions: {
            items: components["schemas"]["ExtensionDescriptor"][];
        };
        ExtensionsEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Extensions"];
            request_id: components["schemas"]["Uuid"];
        };
        FollowRequest: {
            allowed_actions: string[];
            created_at: components["schemas"]["Timestamp"];
            expires_at: components["schemas"]["Timestamp"];
            id: components["schemas"]["Uuid"];
            recipient_id: components["schemas"]["Uuid"];
            sender_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            state: "pending" | "accepted" | "rejected" | "deleted" | "cancelled" | "expired" | "blocked" | "ended";
        };
        FollowRequestEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["FollowRequest"];
            request_id: components["schemas"]["Uuid"];
        };
        FollowRequestPage: {
            has_more: boolean;
            items: components["schemas"]["FollowRequest"][];
            next_cursor: string | null;
        };
        FollowRequestPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["FollowRequestPage"];
            request_id: components["schemas"]["Uuid"];
        };
        FullConfigPreview: {
            action_digest: components["schemas"]["Digest"];
            base_version: components["schemas"]["ConfigVersion"];
            compat_matrix: {
                [key: string]: string[];
            };
            consumers_ready: string[];
            existing_object_impacts: string[];
            expires_at: components["schemas"]["Timestamp"];
            preview_digest: components["schemas"]["Digest"];
            preview_id: components["schemas"]["Uuid"];
            scoped_values: components["schemas"]["ScopedConfigValues"][];
        };
        FullConfigPreviewEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["FullConfigPreview"];
            request_id: components["schemas"]["Uuid"];
        };
        FullConfigPreviewRequest: {
            base_version: components["schemas"]["ConfigVersion"];
            operation_id: components["schemas"]["Uuid"];
            reason: string;
            scoped_values: components["schemas"]["ScopedConfigValues"][];
        };
        FullConfigRollbackPreviewRequest: {
            base_version: components["schemas"]["ConfigVersion"];
            operation_id: components["schemas"]["Uuid"];
            reason: string;
            rollback_version: components["schemas"]["ConfigVersion"];
        };
        FullConfigurationPreviewRequest: components["schemas"]["FullConfigPreviewRequest"] | components["schemas"]["FullConfigRollbackPreviewRequest"];
        HealthSnapshot: {
            /** @enum {string} */
            environment: "dev" | "test" | "production";
            services: components["schemas"]["ServiceHealth"][];
        };
        HealthSnapshotEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["HealthSnapshot"];
            request_id: components["schemas"]["Uuid"];
        };
        ImpactPreview: {
            affected_refs: components["schemas"]["Uuid"][];
            base_version: number;
            expires_at: components["schemas"]["Timestamp"];
            impacts: string[];
            preview_digest: components["schemas"]["Digest"];
            preview_id: components["schemas"]["Uuid"];
        };
        ImpactPreviewEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["ImpactPreview"];
            request_id: components["schemas"]["Uuid"];
        };
        Interaction: {
            account_id: components["schemas"]["Uuid"];
            created_at: components["schemas"]["Timestamp"];
            /** @enum {string} */
            kind: "like" | "repost";
        };
        InteractionPage: {
            has_more: boolean;
            items: components["schemas"]["Interaction"][];
            next_cursor: string | null;
        };
        InteractionResults: {
            count: number;
            details?: components["schemas"]["InteractionPage"];
        };
        InteractionResultsEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["InteractionResults"];
            request_id: components["schemas"]["Uuid"];
        };
        Interests: {
            row_version: number;
            topic_ids: components["schemas"]["Uuid"][];
        };
        InterestsEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Interests"];
            request_id: components["schemas"]["Uuid"];
        };
        InterestsPatch: {
            base_version: number;
            operation_id: components["schemas"]["Uuid"];
            topic_ids: components["schemas"]["Uuid"][];
        };
        InternalAccountIndexPayload: {
            account_ref: components["schemas"]["Uuid"];
            policy_digest: components["schemas"]["Digest"];
            policy_epoch: number;
            /** @enum {string} */
            scope: "account";
        };
        InternalDocumentEventPayload: {
            content_digest: components["schemas"]["Digest"];
            document_id: components["schemas"]["Uuid"];
            release_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            state: "published" | "superseded" | "withdrawn";
        };
        /** @description Internal validated outbox event only. Never returned raw from HTTP events; recipient event projection and current authorization are separate. */
        InternalEventEnvelope: {
            aggregate_ref: components["schemas"]["Uuid"];
            aggregate_version: number;
            effect_key: string;
            environment_id: string;
            event_id: components["schemas"]["Uuid"];
            lifecycle_epoch: number;
            /** Format: date-time */
            occurred_at: string;
            operation_id: components["schemas"]["Uuid"];
            owner_plugin: string;
            payload: components["schemas"]["InternalStateEventPayload"];
            policy_epoch: number;
            request_id: components["schemas"]["Uuid"];
            /** @enum {integer} */
            schema_version: 1;
            /** @enum {string} */
            type: "resource.changed" | "revision.changed" | "batch.changed" | "relation.changed" | "message.saved" | "access.changed" | "request.changed" | "notification.changed" | "ai.source.changed" | "config.activated" | "plugin.lifecycle.changed" | "release.changed" | "purge.changed" | "service.health.changed";
        } | {
            aggregate_ref: components["schemas"]["Uuid"];
            aggregate_version: number;
            effect_key: string;
            environment_id: string;
            event_id: components["schemas"]["Uuid"];
            lifecycle_epoch: number;
            /** Format: date-time */
            occurred_at: string;
            operation_id: components["schemas"]["Uuid"];
            owner_plugin: string;
            payload: components["schemas"]["InternalDocumentEventPayload"];
            policy_epoch: number;
            request_id: components["schemas"]["Uuid"];
            /** @enum {integer} */
            schema_version: 1;
            /** @enum {string} */
            type: "document.publication.changed";
        } | {
            aggregate_ref: components["schemas"]["Uuid"];
            aggregate_version: number;
            effect_key: string;
            environment_id: string;
            event_id: components["schemas"]["Uuid"];
            lifecycle_epoch: number;
            /** Format: date-time */
            occurred_at: string;
            operation_id: components["schemas"]["Uuid"];
            owner_plugin: string;
            payload: components["schemas"]["InternalAccountIndexPayload"] | components["schemas"]["InternalTargetIndexPayload"];
            policy_epoch: number;
            request_id: components["schemas"]["Uuid"];
            /** @enum {integer} */
            schema_version: 1;
            /** @enum {string} */
            type: "index.policy.changed";
        };
        InternalStateEventPayload: {
            state: string;
            target_ref: components["schemas"]["Uuid"];
        };
        InternalTargetIndexPayload: {
            policy_digest: components["schemas"]["Digest"];
            policy_epoch: number;
            /** @enum {string} */
            scope: "target";
            target_ref: components["schemas"]["Uuid"];
        };
        /** @description Invitation secret returned to authorized creator once; never logged or exposed in list projection. */
        InvitationReceipt: {
            expires_at: components["schemas"]["Timestamp"];
            id: components["schemas"]["Uuid"];
            invitation_ref: string;
            /** @enum {string} */
            state: "unused" | "used" | "revoked" | "expired";
        };
        InvitationReceiptEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["InvitationReceipt"];
            request_id: components["schemas"]["Uuid"];
        };
        InvitationRequest: {
            expires_at: components["schemas"]["Timestamp"];
            operation_id: components["schemas"]["Uuid"];
            reason: string;
            stepup_id: components["schemas"]["Uuid"];
        };
        /** @description Registered bounded declarative schema, never executable code or arbitrary permission input. Supported dialect/version is registered with each consumer. */
        JsonSchemaDefinition: {
            additionalProperties?: boolean | components["schemas"]["JsonSchemaDefinition"];
            allOf?: components["schemas"]["JsonSchemaDefinition"][];
            anyOf?: components["schemas"]["JsonSchemaDefinition"][];
            default?: components["schemas"]["JsonValue"];
            description?: string;
            enum?: components["schemas"]["JsonValue"][];
            format?: string;
            items?: components["schemas"]["JsonSchemaDefinition"];
            maximum?: number;
            maxItems?: number;
            maxLength?: number;
            minimum?: number;
            minItems?: number;
            minLength?: number;
            not?: components["schemas"]["JsonSchemaDefinition"];
            nullable?: boolean;
            oneOf?: components["schemas"]["JsonSchemaDefinition"][];
            pattern?: string;
            properties?: {
                [key: string]: components["schemas"]["JsonSchemaDefinition"];
            };
            required?: string[];
            /** @enum {string} */
            type?: "object" | "array" | "string" | "number" | "integer" | "boolean" | "null";
            uniqueItems?: boolean;
        };
        /** @description JSON value for registered configuration schemas only; this does not replace domain DTOs. */
        JsonValue: (string | null) | number | boolean | components["schemas"]["JsonValue"][] | {
            [key: string]: components["schemas"]["JsonValue"];
        };
        LatestPage: {
            has_more: boolean;
            items: components["schemas"]["LatestPost"][];
            next_cursor: string | null;
        };
        LatestPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["LatestPage"];
            request_id: components["schemas"]["Uuid"];
        };
        LatestPost: {
            author_id: components["schemas"]["Uuid"];
            body: string;
            /** Format: date-time */
            created_at: string;
            id: components["schemas"]["Uuid"];
            revision_id: components["schemas"]["Uuid"];
            row_version: number;
            /** @enum {string} */
            visibility: "public";
        };
        LoginChallengeRequest: {
            operation_id: components["schemas"]["Uuid"];
            phone: string;
            /** @enum {string} */
            purpose: "login";
        };
        ManagedAccount: {
            id: components["schemas"]["Uuid"];
            phone_masked: string;
            registered_at: components["schemas"]["Timestamp"];
            roles: string[];
            /** @enum {string} */
            status: "active" | "cancelled";
        };
        ManagedAccountPage: {
            has_more: boolean;
            items: components["schemas"]["ManagedAccount"][];
            /** Format: uuid */
            next_cursor: string | null;
        };
        ManagedAccountPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["ManagedAccountPage"];
            request_id: components["schemas"]["Uuid"];
        };
        ManagedDocument: {
            /** Format: uuid */
            active_release_id: string | null;
            allowed_actions: string[];
            id: components["schemas"]["Uuid"];
            /** @enum {string} */
            kind: "community_rules" | "privacy" | "terms" | "processing_notice" | "help";
            locale: string;
            public_surfaces: ("app" | "share" | "admin")[];
            row_version: number;
            stable_key: string;
        };
        ManagedDocumentCreate: {
            /** @enum {string} */
            kind: "community_rules" | "privacy" | "terms" | "processing_notice" | "help";
            locale: string;
            operation_id: components["schemas"]["Uuid"];
            public_surfaces: ("app" | "share" | "admin")[];
            stable_key: string;
        };
        ManagedDocumentEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["ManagedDocument"];
            request_id: components["schemas"]["Uuid"];
        };
        ManagedDocumentPage: {
            has_more: boolean;
            items: components["schemas"]["ManagedDocument"][];
            next_cursor: string | null;
        };
        ManagedDocumentPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["ManagedDocumentPage"];
            request_id: components["schemas"]["Uuid"];
        };
        MediaReference: {
            alt_text: string;
            duration_ms?: number;
            height?: number;
            /** @enum {string} */
            kind: "image" | "video" | "gif";
            media_id: components["schemas"]["Uuid"];
            mime: string;
            position: number;
            size_bytes: number;
            width?: number;
        };
        Message: {
            allowed_actions: string[];
            body: string;
            conversation_id: components["schemas"]["Uuid"];
            /** Format: date-time */
            delivered_at?: string | null;
            id: components["schemas"]["Uuid"];
            media: components["schemas"]["MediaReference"][];
            original_saved_at: components["schemas"]["Timestamp"];
            /** Format: date-time */
            read_at?: string | null;
            sender_id: components["schemas"]["Uuid"];
            sequence: number;
            /** @enum {string} */
            state: "saved" | "unavailable";
            /** @enum {string} */
            type: "text" | "image" | "video" | "gif";
        };
        MessageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Message"];
            request_id: components["schemas"]["Uuid"];
        };
        MessagePage: {
            has_more: boolean;
            items: components["schemas"]["MessageProjection"][];
            next_cursor: string | null;
        };
        MessagePageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["MessagePage"];
            request_id: components["schemas"]["Uuid"];
        };
        MessageProjection: components["schemas"]["Message"] | components["schemas"]["UnavailableResource"];
        MfaChallenge: {
            expires_at: number;
            id: components["schemas"]["Uuid"];
            /** @enum {string} */
            type: "totp";
        };
        MfaChallengeEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["MfaChallenge"];
            request_id: components["schemas"]["Uuid"];
        };
        MfaChallengeRequest: {
            factor_id: components["schemas"]["Uuid"];
        };
        MfaEnrollment: {
            id: components["schemas"]["Uuid"];
            totp: {
                qr_code: string;
                secret: string;
                uri: string;
            };
            /** @enum {string} */
            type: "totp";
        };
        MfaEnrollmentEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["MfaEnrollment"];
            request_id: components["schemas"]["Uuid"];
        };
        MfaEnrollmentRequest: {
            friendly_name: string;
        };
        MfaFactor: {
            created_at: components["schemas"]["Timestamp"];
            /** @enum {string} */
            factor_type: "totp";
            friendly_name: string | null;
            id: components["schemas"]["Uuid"];
            /** @enum {string} */
            status: "verified" | "unverified";
        };
        MfaFactors: {
            items: components["schemas"]["MfaFactor"][];
        };
        MfaFactorsEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["MfaFactors"];
            request_id: components["schemas"]["Uuid"];
        };
        MfaRecoveryCase: {
            account_id: components["schemas"]["Uuid"];
            allowed_actions: string[];
            created_at: components["schemas"]["Timestamp"];
            id: components["schemas"]["Uuid"];
            old_factors_revoked: boolean;
            old_sessions_revoked: boolean;
            /** Format: uuid */
            reviewer_id: string | null;
            row_version: number;
            /** @enum {string} */
            state: "received" | "need_evidence" | "awaiting_independent_review" | "approved" | "rejected" | "executing" | "completed" | "failed";
        };
        MfaRecoveryCaseEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["MfaRecoveryCase"];
            request_id: components["schemas"]["Uuid"];
        };
        MfaRecoveryCaseRequest: {
            account_id: components["schemas"]["Uuid"];
            operation_id: components["schemas"]["Uuid"];
            ownership_evidence_refs: components["schemas"]["Uuid"][];
            reason: string;
        };
        MfaRecoveryDecision: {
            base_version: number;
            /** @enum {string} */
            decision: "approve" | "reject";
            operation_id: components["schemas"]["Uuid"];
            ownership_evidence_refs: components["schemas"]["Uuid"][];
            reason: string;
            stepup_id: components["schemas"]["Uuid"];
        };
        MfaVerifyRequest: {
            challenge_id: components["schemas"]["Uuid"];
            code: string;
            factor_id: components["schemas"]["Uuid"];
        };
        MuteCommand: {
            /** @enum {string} */
            kind: "account" | "keyword" | "topic";
            operation_id: components["schemas"]["Uuid"];
            value: string;
        };
        MutePage: {
            has_more: boolean;
            items: components["schemas"]["MuteRule"][];
            next_cursor: string | null;
        };
        MutePageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["MutePage"];
            request_id: components["schemas"]["Uuid"];
        };
        MuteRule: {
            active: boolean;
            id: components["schemas"]["Uuid"];
            /** @enum {string} */
            kind: "account" | "keyword" | "topic";
            value: string;
        };
        MuteRuleEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["MuteRule"];
            request_id: components["schemas"]["Uuid"];
        };
        Notification: {
            allowed_actions: string[];
            created_at: components["schemas"]["Timestamp"];
            id: components["schemas"]["Uuid"];
            kind: string;
            /** Format: date-time */
            read_at: string | null;
            summary: string;
            target_refs: components["schemas"]["Uuid"][];
        };
        NotificationPage: {
            has_more: boolean;
            items: components["schemas"]["Notification"][];
            next_cursor: string | null;
        };
        NotificationPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["NotificationPage"];
            request_id: components["schemas"]["Uuid"];
        };
        OperationCommand: {
            operation_id: components["schemas"]["Uuid"];
        };
        OtpChallenge: {
            challenge_id: components["schemas"]["Uuid"];
            expires_at: components["schemas"]["Timestamp"];
            retry_after: number;
        };
        OtpChallengeEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["OtpChallenge"];
            request_id: components["schemas"]["Uuid"];
        };
        OtpChallengeRequest: components["schemas"]["LoginChallengeRequest"] | components["schemas"]["RegistrationChallengeRequest"];
        OtpConfiguration: {
            base_version: components["schemas"]["ConfigVersion"];
            definitions: components["schemas"]["OtpDefinition"][];
            deployment_max_lifetime_seconds: number;
            /** @enum {string} */
            environment: "dev" | "test" | "production";
            history: {
                effective_at: components["schemas"]["Timestamp"];
                /** @enum {string} */
                kind: "release" | "rollback" | "baseline";
                reason: string;
                version: components["schemas"]["ConfigVersion"];
            }[];
        };
        OtpConfigurationEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["OtpConfiguration"];
            request_id: components["schemas"]["Uuid"];
        };
        OtpDefinition: {
            default_value: number;
            description: string;
            effect_mode: string;
            existing_policy: string;
            key: components["schemas"]["OtpKey"];
            range: {
                maximum?: number;
                minimum?: number;
                /** @enum {string} */
                type?: "integer";
            };
            read_permission: string;
            value: number;
            write_permission: string;
        };
        OtpDefinitionRange: {
            maximum?: number;
            minimum?: number;
            /** @enum {string} */
            type?: "integer";
        };
        /** @enum {string} */
        OtpKey: "auth.otp_lifetime_seconds" | "auth.otp_resend_seconds" | "auth.otp_max_failures" | "auth.otp_phone_hourly" | "auth.otp_phone_daily" | "auth.otp_ip_hourly";
        OtpValues: {
            "auth.otp_ip_hourly": number;
            "auth.otp_lifetime_seconds": number;
            "auth.otp_max_failures": number;
            "auth.otp_phone_daily": number;
            "auth.otp_phone_hourly": number;
            "auth.otp_resend_seconds": number;
        };
        OtpVerificationRequest: {
            challenge_id: components["schemas"]["Uuid"];
            operation_id: components["schemas"]["Uuid"];
            otp: string;
        };
        PasswordForgotReceipt: {
            accepted: boolean;
        };
        PasswordForgotReceiptUnversionedEnvelope: {
            data: components["schemas"]["PasswordForgotReceipt"];
            request_id: components["schemas"]["Uuid"];
        };
        PendingAuthOperation: {
            operation_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            state: "pending" | "unknown";
        };
        PhoneChangeReceipt: {
            clear_restricted_cache: boolean;
            completed_at: components["schemas"]["Timestamp"];
            other_sessions_revoked: boolean;
            sensitive_until: components["schemas"]["Timestamp"];
        };
        PhoneChangeReceiptEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["PhoneChangeReceipt"];
            request_id: components["schemas"]["Uuid"];
        };
        PhoneChangeRequest: {
            base_version: number;
            new_phone_verification_ref: components["schemas"]["Uuid"];
            old_phone_verification_ref?: components["schemas"]["Uuid"];
            operation_id: components["schemas"]["Uuid"];
            preview_digest?: components["schemas"]["Digest"];
            recovery_ref?: components["schemas"]["Uuid"];
        };
        Placement: {
            /** Format: date-time */
            ends_at: string | null;
            id: components["schemas"]["Uuid"];
            kind: string;
            order: number;
            reason: string;
            row_version: number;
            starts_at: components["schemas"]["Timestamp"];
            target_ref: components["schemas"]["Uuid"];
        };
        PlacementEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Placement"];
            request_id: components["schemas"]["Uuid"];
        };
        PlacementPage: {
            has_more: boolean;
            items: components["schemas"]["Placement"][];
            next_cursor: string | null;
        };
        PlacementPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["PlacementPage"];
            request_id: components["schemas"]["Uuid"];
        };
        PlacementWrite: {
            base_version?: number;
            /** Format: date-time */
            ends_at: string | null;
            /** @enum {string} */
            kind: "pinned" | "featured" | "recommended";
            operation_id: components["schemas"]["Uuid"];
            order: number;
            reason: string;
            starts_at: components["schemas"]["Timestamp"];
            target_ref: components["schemas"]["Uuid"];
        };
        Plugin: {
            allowed_actions: string[];
            /** @enum {string} */
            health: "healthy" | "degraded" | "unavailable" | "unknown";
            id: string;
            latest_reviewed_version: string | null;
            name: string;
            /** @enum {string} */
            source: "official" | "invited" | "self-use";
        };
        PluginActionPlan: {
            /** @enum {string} */
            action: "install" | "enable" | "disable" | "upgrade" | "uninstall";
            /** @enum {string} */
            environment: "dev" | "test" | "production";
            operation_id: components["schemas"]["Uuid"];
            package_digest: components["schemas"]["Digest"];
            plugin_id: string;
            reason: string;
            selected_dependents: string[];
            version: string;
        };
        /** @description Result must match reviewed action-specific response schema and current authorized projection. */
        PluginActionReceipt: {
            operation_id: components["schemas"]["Uuid"];
            result: {
                [key: string]: components["schemas"]["JsonValue"];
            };
            schema_id: string;
            /** @enum {string} */
            state: "pending" | "succeeded" | "failed" | "unknown";
        };
        PluginActionReceiptEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["PluginActionReceipt"];
            request_id: components["schemas"]["Uuid"];
        };
        /** @description payload is validated against reviewed action-specific registered JSON Schema, not an untyped substitute for platform business DTOs. Broker supplies current identity, environment, plugin/version/epoch and permissions; payload cannot override them. */
        PluginActionRequest: {
            operation_id: components["schemas"]["Uuid"];
            payload: {
                [key: string]: components["schemas"]["JsonValue"];
            };
            schema_id: string;
            version: string;
        };
        PluginInstallation: {
            /** @enum {string} */
            environment: "dev" | "test" | "production";
            grants: string[];
            /** @enum {string} */
            health: "healthy" | "degraded" | "unavailable" | "unknown";
            /** @enum {string} */
            history_mode: "authorized-projection" | "unavailable-placeholder";
            id: components["schemas"]["Uuid"];
            lifecycle_epoch: number;
            plugin_id: string;
            rollback_limits: string;
            /** @enum {string} */
            state: "acquired" | "checked" | "installing" | "installed_disabled" | "validating" | "awaiting_confirmation" | "enabled" | "failed" | "draining" | "disabled" | "uninstalled";
            version: string;
        };
        PluginInstallationEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["PluginInstallation"];
            request_id: components["schemas"]["Uuid"];
        };
        PluginLifecycleCommit: {
            operation_id: components["schemas"]["Uuid"];
            preview_digest: components["schemas"]["Digest"];
            preview_id: components["schemas"]["Uuid"];
            reason: string;
            release_confirmation?: components["schemas"]["Uuid"];
            stepup_id: components["schemas"]["Uuid"];
        };
        PluginLifecyclePreview: {
            /** @enum {string} */
            action: "install" | "enable" | "disable" | "upgrade" | "uninstall";
            code_impacts: string[];
            config_impacts: string[];
            data_impacts: string[];
            dependencies: string[];
            /** @enum {string} */
            environment: "dev" | "test" | "production";
            expires_at: components["schemas"]["Timestamp"];
            grants_delta: string[];
            /** @enum {string} */
            history_mode: "authorized-projection" | "unavailable-placeholder";
            inflight: number;
            package_digest: components["schemas"]["Digest"];
            plugin_id: string;
            preview_digest: components["schemas"]["Digest"];
            preview_id: components["schemas"]["Uuid"];
            retention: string[];
            rollback_limits: string;
            schema_impacts: string[];
            selected_dependents: string[];
            version: string;
        };
        PluginLifecyclePreviewEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["PluginLifecyclePreview"];
            request_id: components["schemas"]["Uuid"];
        };
        /** AgoraWeave plugin manifest 1.0 */
        PluginManifest: {
            changes: {
                configuration: boolean;
                mobile_compatible: boolean;
                native: boolean;
                server_admin: boolean;
            };
            compatibility: {
                /** @enum {unknown} */
                api_contract: "v1";
                native_runtimes: string[];
                platform_range: components["schemas"]["PluginManifestRange"];
                sdk_range: components["schemas"]["PluginManifestRange"];
                /** @enum {unknown} */
                ui_schema: "1.0";
            };
            configuration: components["schemas"]["PluginManifestPath"];
            conflicts: string[];
            data_lifecycle: {
                declaration: components["schemas"]["PluginManifestPath"];
                /** @enum {unknown} */
                history_mode: "authorized-projection" | "unavailable-placeholder";
                history_projection?: components["schemas"]["PluginManifestPath"];
                /** @enum {unknown} */
                uninstall_default: "retain-original-deadlines";
            };
            dependencies: {
                id: string;
                range: components["schemas"]["PluginManifestRange"];
            }[];
            entrypoints: {
                admin?: components["schemas"]["PluginManifestPath"];
                mobile?: components["schemas"]["PluginManifestPath"];
                server?: components["schemas"]["PluginManifestPath"];
            };
            /** @enum {unknown} */
            files_manifest: "files.sha256";
            id: string;
            maintainer: string;
            migrations: {
                from_schema: number;
                id: string;
                path: components["schemas"]["PluginManifestPath"];
                recovery_limits: string;
                reversible: boolean;
                sha256: components["schemas"]["PluginManifestHash"];
                to_schema: number;
            }[];
            permissions: {
                /** @enum {unknown} */
                data_scope: "own" | "current-authorized-shared" | "case-authorized";
                name: string;
                purpose: string;
                sensitive: boolean;
            }[];
            /** @enum {unknown} */
            schema_version: "1.0";
            /** @enum {unknown} */
            source: "official" | "invited" | "self-use";
            version: components["schemas"]["PluginManifestSemver"];
        };
        PluginManifestHash: string;
        PluginManifestPath: string;
        PluginManifestRange: string;
        PluginManifestSemver: string;
        PluginPackage: {
            id: components["schemas"]["Uuid"];
            manifest: components["schemas"]["PluginManifest"];
            package_digest: components["schemas"]["Digest"];
            plugin_id: string;
            /** @enum {string} */
            state: "acquired" | "checked" | "checked_failed" | "awaiting_review" | "approved" | "rejected";
            submitted_at: components["schemas"]["Timestamp"];
            validation_codes: string[];
            version: string;
        };
        PluginPackageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["PluginPackage"];
            request_id: components["schemas"]["Uuid"];
        };
        PluginPackagePage: {
            has_more: boolean;
            items: components["schemas"]["PluginPackage"][];
            next_cursor: string | null;
        };
        PluginPackagePageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["PluginPackagePage"];
            request_id: components["schemas"]["Uuid"];
        };
        PluginPackageSubmit: {
            manifest: components["schemas"]["PluginManifest"];
            operation_id: components["schemas"]["Uuid"];
            package_digest: components["schemas"]["Digest"];
            package_media_ref: components["schemas"]["Uuid"];
        };
        PluginPage: {
            has_more: boolean;
            items: components["schemas"]["Plugin"][];
            next_cursor: string | null;
        };
        PluginPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["PluginPage"];
            request_id: components["schemas"]["Uuid"];
        };
        PluginPermissionGrant: {
            /** @enum {string} */
            environment: "dev" | "test" | "production";
            operation_id: components["schemas"]["Uuid"];
            package_digest: components["schemas"]["Digest"];
            permissions: string[];
            preview_digest: components["schemas"]["Digest"];
            reason: string;
            stepup_id: components["schemas"]["Uuid"];
            version: string;
        };
        PluginPurgePlan: {
            data_classes: string[];
            /** @enum {string} */
            environment: "dev" | "test" | "production";
            operation_id: components["schemas"]["Uuid"];
            plugin_id: string;
            reason: string;
        };
        PluginPurgePreview: {
            blocked_classes: string[];
            expires_at: components["schemas"]["Timestamp"];
            irreversible_impacts: string[];
            preview_digest: components["schemas"]["Digest"];
            preview_id: components["schemas"]["Uuid"];
            purgeable_classes: string[];
            retained_interests: string[];
        };
        PluginPurgePreviewEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["PluginPurgePreview"];
            request_id: components["schemas"]["Uuid"];
        };
        PluginReview: {
            /** @enum {string} */
            decision: "approve" | "reject";
            operation_id: components["schemas"]["Uuid"];
            package_digest: components["schemas"]["Digest"];
            reason: string;
            stepup_id: components["schemas"]["Uuid"];
            version: string;
        };
        PluginVersion: {
            allowed_actions: string[];
            dependencies: {
                id: string;
                range: string;
            }[];
            maintainer: string;
            package_digest: components["schemas"]["Digest"];
            permissions: string[];
            plugin_id: string;
            /** @enum {string} */
            review_state: "awaiting_review" | "approved" | "rejected";
            rollback_limits: string;
            schema_version: number;
            /** @enum {string} */
            source: "official" | "invited" | "self-use";
            version: string;
        };
        PluginVersionPage: {
            has_more: boolean;
            items: components["schemas"]["PluginVersion"][];
            next_cursor: string | null;
        };
        PluginVersionPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["PluginVersionPage"];
            request_id: components["schemas"]["Uuid"];
        };
        Poll: {
            corrections: string[];
            /** Format: date-time */
            ended_at: string | null;
            /** Format: date-time */
            first_vote_at: string | null;
            id: components["schemas"]["Uuid"];
            options: components["schemas"]["PollOption"][];
            original_closes_at: components["schemas"]["Timestamp"];
            /** @description Current visible-character limit uses Unicode 17 UAX29 grapheme clusters; JSON Schema code-point maxLength is not authoritative. */
            question: string;
            row_version: number;
        };
        PollCorrectionRequest: {
            /** @description Current visible-character limit uses Unicode 17 UAX29 grapheme clusters; JSON Schema code-point maxLength is not authoritative. */
            body: string;
            operation_id: components["schemas"]["Uuid"];
            reason: string;
        };
        PollEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Poll"];
            request_id: components["schemas"]["Uuid"];
        };
        PollInput: {
            closes_at: components["schemas"]["Timestamp"];
            options: string[];
            /** @description Current visible-character limit uses Unicode 17 UAX29 grapheme clusters; JSON Schema code-point maxLength is not authoritative. */
            question: string;
        };
        PollOption: {
            id: components["schemas"]["Uuid"];
            label: string;
            ordinal: number;
        };
        PollPatch: {
            base_version: number;
            closes_at?: components["schemas"]["Timestamp"];
            operation_id: components["schemas"]["Uuid"];
            options?: string[];
            /** @description Current visible-character limit uses Unicode 17 UAX29 grapheme clusters; JSON Schema code-point maxLength is not authoritative. */
            question?: string;
        };
        PollResults: {
            ended: boolean;
            /** Format: uuid */
            my_option_id: string | null;
            options: {
                option_id: components["schemas"]["Uuid"];
                votes: number;
            }[];
            poll_id: components["schemas"]["Uuid"];
            total_votes: number;
        };
        PollResultsEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["PollResults"];
            request_id: components["schemas"]["Uuid"];
        };
        PollVote: {
            operation_id: components["schemas"]["Uuid"];
            option_id: components["schemas"]["Uuid"];
        };
        Post: {
            allowed_actions: string[];
            author_id: components["schemas"]["Uuid"];
            /** @description Current visible-character limit uses Unicode 17 UAX29 grapheme clusters and active configuration. */
            body: string;
            created_at: components["schemas"]["Timestamp"];
            id: components["schemas"]["Uuid"];
            media: components["schemas"]["MediaReference"][];
            mentions: components["schemas"]["Uuid"][];
            poll?: components["schemas"]["Poll"];
            /** @enum {string} */
            reply_scope: "all_readers" | "author_follows" | "mentioned" | "closed";
            revision_id: components["schemas"]["Uuid"];
            row_version: number;
            source_id?: components["schemas"]["Uuid"];
            tags: string[];
            /** @enum {string} */
            type: "text" | "long_text" | "images" | "video" | "gif" | "poll" | "quote" | "repost";
            /** @enum {string} */
            visibility: "public" | "followers" | "self";
        };
        /** @description Type combinations must match PRD: image <=9; one video <=200MB/300s; one GIF <=15MB; poll 2..4 options without media; quote appends text only. MB=1,000,000 bytes; registered limits apply. */
        PostInput: {
            /** @description Current visible-character limit uses Unicode 17 UAX29 grapheme clusters and active configuration. */
            body: string;
            /** @enum {string} */
            indexing_mode?: "inherit" | "allow" | "deny";
            media_refs?: components["schemas"]["Uuid"][];
            mentions?: components["schemas"]["Uuid"][];
            poll?: components["schemas"]["PollInput"];
            /** @enum {string} */
            reply_scope: "all_readers" | "author_follows" | "mentioned" | "closed";
            source_id?: components["schemas"]["Uuid"];
            tags?: string[];
            /** @enum {string} */
            type: "text" | "long_text" | "images" | "video" | "gif" | "poll" | "quote";
            /** @enum {string} */
            visibility: "public" | "followers" | "self";
        };
        PostPage: {
            has_more: boolean;
            items: components["schemas"]["PostProjection"][];
            next_cursor: string | null;
        };
        PostPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["PostPage"];
            request_id: components["schemas"]["Uuid"];
        };
        PostProjection: components["schemas"]["Post"] | components["schemas"]["UnavailableResource"];
        /** @description Private App projection only. video_policy initial wifi_only; playback initially muted. Theme is local and never synchronized by this endpoint. */
        Preferences: {
            /** @enum {string} */
            dm_policy: "everyone" | "following" | "none";
            follow_approval: boolean;
            notification_categories: string[];
            preload: boolean;
            push: boolean;
            read_receipt: boolean;
            row_version: number;
            typing: boolean;
            /** @enum {string} */
            video_policy: "always" | "wifi_only" | "never";
        };
        PreferencesEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Preferences"];
            request_id: components["schemas"]["Uuid"];
        };
        PreferencesPatch: {
            base_version: number;
            /** @enum {string} */
            dm_policy?: "everyone" | "following" | "none";
            follow_approval?: boolean;
            notification_categories?: string[];
            operation_id: components["schemas"]["Uuid"];
            preload?: boolean;
            push?: boolean;
            read_receipt?: boolean;
            typing?: boolean;
            /** @enum {string} */
            video_policy?: "always" | "wifi_only" | "never";
        };
        Profile: {
            account_id: components["schemas"]["Uuid"];
            allowed_actions: string[];
            /** Format: uuid */
            avatar_media_ref: string | null;
            /** Format: uuid */
            background_media_ref: string | null;
            bio: string;
            followers_count: number;
            following_count: number;
            nickname: string;
            registered_at: components["schemas"]["Timestamp"];
            row_version: number;
            username: string;
        };
        ProfileEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Profile"];
            request_id: components["schemas"]["Uuid"];
        };
        ProfilePatch: {
            avatar_media_ref?: components["schemas"]["Uuid"];
            background_media_ref?: components["schemas"]["Uuid"];
            base_version: number;
            bio?: string;
            nickname?: string;
            operation_id: components["schemas"]["Uuid"];
            username?: string;
        };
        ProjectedEvent: components["schemas"]["RecipientEvent"] | components["schemas"]["ResourceEvent"];
        PublicationBatch: {
            batch_id: components["schemas"]["Uuid"];
            operation_id: components["schemas"]["Uuid"];
            /** Format: date-time */
            published_at: string | null;
            resource_ids: components["schemas"]["Uuid"][];
            /** @enum {string} */
            state: "preparing" | "awaiting_review" | "ready" | "published" | "rejected" | "failed" | "cancelled";
            thread_id: components["schemas"]["Uuid"];
        };
        PublicationBatchEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["PublicationBatch"];
            request_id: components["schemas"]["Uuid"];
        };
        PublishedDocument: {
            body: string;
            digest: components["schemas"]["Digest"];
            document_id: components["schemas"]["Uuid"];
            is_current: boolean;
            /** @enum {string} */
            kind: "community_rules" | "privacy" | "terms" | "processing_notice" | "help";
            locale: string;
            published_at: components["schemas"]["Timestamp"];
            release_id: components["schemas"]["Uuid"];
            scope: components["schemas"]["DocumentScope"];
            stable_key: string;
            /** @enum {string} */
            state: "published" | "superseded";
            title: string;
        };
        PublishedDocumentEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["PublishedDocument"];
            request_id: components["schemas"]["Uuid"];
        };
        PublishedDocumentSet: {
            document_set_digest: components["schemas"]["Digest"];
            documents: components["schemas"]["PublishedDocument"][];
        };
        /** @description All required physical stages must complete before physical_removed. Hiding a UI row is not purge. Shared valid interests remain independently authorized. */
        PurgeJob: {
            attempt: number;
            error_code: string | null;
            id: components["schemas"]["Uuid"];
            obligation_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            stage: "database" | "object" | "derivative" | "index" | "cache";
            /** @enum {string} */
            state: "pending" | "running" | "succeeded" | "failed" | "blocked";
            updated_at: components["schemas"]["Timestamp"];
            watermark: number;
        };
        PurgeJobEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["PurgeJob"];
            request_id: components["schemas"]["Uuid"];
        };
        /** @description Provider token never appears in response or logs. Provider acceptance is not device delivery. */
        PushDevice: {
            id: components["schemas"]["Uuid"];
            installation_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            permission: "granted" | "denied" | "provisional";
            /** @enum {string} */
            platform: "android" | "ios";
            /** @enum {string} */
            provider: "apns" | "fcm";
            registered_at: components["schemas"]["Timestamp"];
            row_version: number;
            /** @enum {string} */
            state: "active" | "revoked" | "unavailable";
        };
        PushDeviceEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["PushDevice"];
            request_id: components["schemas"]["Uuid"];
        };
        PushDeviceRegistration: {
            installation_id: components["schemas"]["Uuid"];
            operation_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            permission: "granted" | "denied" | "provisional";
            /** @enum {string} */
            platform: "android" | "ios";
            /** @enum {string} */
            provider: "apns" | "fcm";
            token: string;
        };
        ReactionReceipt: {
            active: boolean;
            count: number;
            target_id: components["schemas"]["Uuid"];
        };
        ReactionReceiptEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["ReactionReceipt"];
            request_id: components["schemas"]["Uuid"];
        };
        ReadNotifications: {
            ids: components["schemas"]["Uuid"][];
            operation_id: components["schemas"]["Uuid"];
        };
        /** @description Actual current read projection. Full post composition is planned separately. */
        ReadPost: {
            author_id: components["schemas"]["Uuid"];
            body: string;
            id: components["schemas"]["Uuid"];
            revision_id: components["schemas"]["Uuid"];
            row_version: number;
            /** @enum {string} */
            visibility: "public" | "followers" | "self";
        };
        ReadPostEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["ReadPost"];
            request_id: components["schemas"]["Uuid"];
        };
        ReasonCommand: {
            operation_id: components["schemas"]["Uuid"];
            reason: string;
        };
        RecipientEvent: {
            event_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            scope: "account";
            sequence: number;
            type: string;
        };
        RecoveryCase: {
            created_at: components["schemas"]["Timestamp"];
            id: components["schemas"]["Uuid"];
            /** @enum {string} */
            mode: "trusted" | "manual" | "mfa_emergency";
            row_version: number;
            /** @enum {string} */
            state: "received" | "reviewing" | "approved" | "rejected" | "need_evidence";
            updated_at: components["schemas"]["Timestamp"];
        };
        RecoveryCaseEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["RecoveryCase"];
            request_id: components["schemas"]["Uuid"];
        };
        RecoveryRequest: {
            /** @enum {string} */
            mode: "trusted" | "manual";
            operation_id: components["schemas"]["Uuid"];
        };
        RefreshedSession: {
            session: components["schemas"]["SessionTokens"];
        };
        RefreshedSessionEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["RefreshedSession"];
            request_id: components["schemas"]["Uuid"];
        };
        RefreshRequest: {
            refresh_token: string;
        };
        RegistrationChallengeRequest: {
            age_declaration: components["schemas"]["AgeDeclaration"];
            document_set_digest: components["schemas"]["Digest"];
            invitation_ref: string;
            operation_id: components["schemas"]["Uuid"];
            phone: string;
            /** @enum {string} */
            purpose: "register";
        };
        RegistrationDocument: {
            body: string;
            digest: components["schemas"]["Digest"];
            document_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            kind: "terms" | "privacy";
            release_id: components["schemas"]["Uuid"];
            title: string;
        };
        RegistrationDocuments: {
            age_declaration_version: string;
            document_set_digest: components["schemas"]["Digest"];
            documents: components["schemas"]["RegistrationDocument"][];
        };
        RegistrationVerificationRequest: {
            age_declaration: components["schemas"]["AgeDeclaration"];
            challenge_id: components["schemas"]["Uuid"];
            consents: components["schemas"]["Consent"][];
            document_set_digest: components["schemas"]["Digest"];
            operation_id: components["schemas"]["Uuid"];
            otp: string;
        };
        Relationship: {
            account_id: components["schemas"]["Uuid"];
            allowed_actions: string[];
            created_at: components["schemas"]["Timestamp"];
            /** @enum {string} */
            state: "none" | "pending" | "effective" | "ended";
        };
        RelationshipEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Relationship"];
            request_id: components["schemas"]["Uuid"];
        };
        RelationshipPage: {
            has_more: boolean;
            items: components["schemas"]["Relationship"][];
            next_cursor: string | null;
        };
        RelationshipPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["RelationshipPage"];
            request_id: components["schemas"]["Uuid"];
        };
        ReleaseConfirmation: {
            confirmed_at: components["schemas"]["Timestamp"];
            /** Format: date-time */
            consumed_at: string | null;
            expires_at: components["schemas"]["Timestamp"];
            id: components["schemas"]["Uuid"];
            plan_digest: components["schemas"]["Digest"];
            release_id: components["schemas"]["Uuid"];
            scope_digest: components["schemas"]["Digest"];
        };
        ReleaseConfirmationEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["ReleaseConfirmation"];
            request_id: components["schemas"]["Uuid"];
        };
        ReleaseConfirmationRequest: {
            /** @enum {boolean} */
            confirmed: true;
            member_account_ids: components["schemas"]["Uuid"][];
            operation_id: components["schemas"]["Uuid"];
            plan_digest: components["schemas"]["Digest"];
            reason: string;
            release_id: components["schemas"]["Uuid"];
            scope_digest: components["schemas"]["Digest"];
            stepup_id: components["schemas"]["Uuid"];
        };
        ReleaseManifest: {
            artifacts: components["schemas"]["ArtifactDigest"][];
            cohort_version: number;
            commit_sha: string;
            config_version: components["schemas"]["ConfigVersion"];
            contract_version: string;
            design_approval_refs: string[];
            /** @enum {string} */
            environment: "dev" | "test" | "production";
            health_observation: {
                health_checks: string[];
                window_seconds: number;
            };
            member_account_ids: components["schemas"]["Uuid"][];
            members_digest: components["schemas"]["Digest"];
            migration_digests: components["schemas"]["Digest"][];
            native_fingerprint?: string;
            native_runtime?: string;
            old_client_matrix: {
                compatible: boolean;
                release: string;
                unavailable_capabilities: string[];
            }[];
            permission_delta: string[];
            release_id: components["schemas"]["Uuid"];
            required_evidence_ids: components["schemas"]["Uuid"][];
            rollback_limits: string;
            sdk_version?: string;
            ui_version?: string;
        };
        ReleasePreview: {
            expires_at: components["schemas"]["Timestamp"];
            impacts: string[];
            missing_evidence_ids: components["schemas"]["Uuid"][];
            plan_digest: components["schemas"]["Digest"];
            preview_digest: components["schemas"]["Digest"];
            preview_id: components["schemas"]["Uuid"];
            rollback_limits: string;
            scope_digest: components["schemas"]["Digest"];
        };
        ReleasePreviewEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["ReleasePreview"];
            request_id: components["schemas"]["Uuid"];
        };
        ReleasePreviewRequest: {
            manifest: components["schemas"]["ReleaseManifest"];
            operation_id: components["schemas"]["Uuid"];
            reason: string;
        };
        ReleaseState: {
            allowed_actions: string[];
            artifacts: components["schemas"]["ArtifactDigest"][];
            /** @enum {string} */
            environment: "dev" | "test" | "production";
            id: components["schemas"]["Uuid"];
            plan_digest: components["schemas"]["Digest"];
            rollback_limits: string;
            scope_digest: components["schemas"]["Digest"];
            /** @enum {string} */
            state: "prepared" | "cloud_verified" | "awaiting_confirmation" | "approved" | "deploying" | "canary_observing" | "awaiting_expansion_confirmation" | "expanded" | "failed" | "interrupted" | "rollback_pending" | "recovered";
        };
        ReleaseStateEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["ReleaseState"];
            request_id: components["schemas"]["Uuid"];
        };
        ReplyPolicyPatch: {
            base_version: number;
            operation_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            scope: "all_readers" | "author_follows" | "mentioned" | "closed";
        };
        Report: {
            created_at: components["schemas"]["Timestamp"];
            id: components["schemas"]["Uuid"];
            public_feedback: string | null;
            /** @enum {string} */
            state: "pending" | "reviewing" | "processed" | "not_actionable";
            target_ref: components["schemas"]["Uuid"];
        };
        ReportEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Report"];
            request_id: components["schemas"]["Uuid"];
        };
        ReportPage: {
            has_more: boolean;
            items: components["schemas"]["Report"][];
            next_cursor: string | null;
        };
        ReportPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["ReportPage"];
            request_id: components["schemas"]["Uuid"];
        };
        ReportRequest: {
            evidence_refs?: components["schemas"]["Uuid"][];
            operation_id: components["schemas"]["Uuid"];
            reason: string;
            target_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            target_kind: "account" | "post" | "comment" | "message";
        };
        RequestAction: {
            /** @enum {string} */
            action: "accept" | "reject" | "delete" | "cancel";
            operation_id: components["schemas"]["Uuid"];
        };
        ResourceEvent: {
            aggregate_version: number;
            event_id: components["schemas"]["Uuid"];
            sequence: number;
            target_ref: components["schemas"]["Uuid"];
            type: string;
        };
        RestoreCommit: {
            backup_id: components["schemas"]["Uuid"];
            operation_id: components["schemas"]["Uuid"];
            preview_digest: components["schemas"]["Digest"];
            preview_id: components["schemas"]["Uuid"];
            reason: string;
            release_confirmation?: components["schemas"]["Uuid"];
            stepup_id: components["schemas"]["Uuid"];
        };
        RestorePreviewRequest: {
            backup_id: components["schemas"]["Uuid"];
            operation_id: components["schemas"]["Uuid"];
            reason: string;
            /** @enum {string} */
            target_environment: "dev" | "test" | "production";
        };
        /** @description Replay latest durable security journal before reopening; missing watermark, incomplete revocation replay or failed check keeps access closed. No promise of lossless down migration. */
        RestoreRun: {
            allowed_actions: string[];
            backup_id: components["schemas"]["Uuid"];
            checks: {
                code?: string;
                id: string;
                /** @enum {string} */
                state: "pending" | "passed" | "failed";
            }[];
            id: components["schemas"]["Uuid"];
            latest_security_watermark: number;
            replayed_sequence: number;
            rollback_limits: string;
            /** @enum {string} */
            state: "isolated" | "replay" | "rebuild" | "verify" | "ready" | "opened" | "failed";
        };
        RestoreRunEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["RestoreRun"];
            request_id: components["schemas"]["Uuid"];
        };
        RetentionExtensionCommit: {
            operation_id: components["schemas"]["Uuid"];
            preview_digest: components["schemas"]["Digest"];
            preview_id: components["schemas"]["Uuid"];
            reason: string;
            stepup_id: components["schemas"]["Uuid"];
        };
        RetentionExtensionRequest: {
            base_version: number;
            due_at: components["schemas"]["Timestamp"];
            evidence_ref: components["schemas"]["Uuid"];
            operation_id: components["schemas"]["Uuid"];
            purpose: string;
            reason: string;
        };
        RetentionObligation: {
            allowed_actions: string[];
            data_class: string;
            due_at: components["schemas"]["Timestamp"];
            id: components["schemas"]["Uuid"];
            legal_interests: {
                allowed_scope: string;
                expires_at: components["schemas"]["Timestamp"];
                purpose: string;
                reason: string;
            }[];
            owner_plugin: string;
            /** @enum {string} */
            purge_state: "pending" | "running" | "succeeded" | "failed" | "blocked";
            rule_version: string;
            target_ref: components["schemas"]["Uuid"];
            trigger_at: components["schemas"]["Timestamp"];
        };
        RetentionObligationEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["RetentionObligation"];
            request_id: components["schemas"]["Uuid"];
        };
        RetentionObligationPage: {
            has_more: boolean;
            items: components["schemas"]["RetentionObligation"][];
            next_cursor: string | null;
        };
        RetentionObligationPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["RetentionObligationPage"];
            request_id: components["schemas"]["Uuid"];
        };
        RevisionPage: {
            has_more: boolean;
            items: components["schemas"]["ContentRevision"][];
            next_cursor: string | null;
        };
        RevisionPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["RevisionPage"];
            request_id: components["schemas"]["Uuid"];
        };
        RevisionReceipt: {
            operation_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            publication_state: "preparing" | "awaiting_review" | "published" | "rejected" | "failed" | "cancelled";
            resource_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            review_state: "pending" | "approved" | "rejected";
            revision_id: components["schemas"]["Uuid"];
            row_version: number;
        };
        RevisionReceiptEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["RevisionReceipt"];
            request_id: components["schemas"]["Uuid"];
        };
        RevocationReceipt: {
            clear_restricted_cache: boolean;
            revoked: boolean;
        };
        RevocationReceiptEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["RevocationReceipt"];
            request_id: components["schemas"]["Uuid"];
        };
        RoleGrant: {
            account_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            environment: "dev" | "test" | "production";
            /** Format: date-time */
            expires_at: string | null;
            id: components["schemas"]["Uuid"];
            operation_scopes: string[];
            role: string;
            /** @enum {string} */
            state: "active" | "revoked" | "expired";
        };
        RoleGrantEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["RoleGrant"];
            request_id: components["schemas"]["Uuid"];
        };
        RoleGrantRequest: {
            account_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            environment: "dev" | "test" | "production";
            /** Format: date-time */
            expires_at?: string | null;
            operation_id: components["schemas"]["Uuid"];
            operation_scopes: string[];
            preview_digest?: components["schemas"]["Digest"];
            reason: string;
            resource_scope?: components["schemas"]["Uuid"][] | null;
            /** @enum {string} */
            role: "super_admin" | "content_moderator" | "community_operator" | "ai_operator" | "auditor";
            stepup_id?: components["schemas"]["Uuid"];
        };
        Sanction: {
            allowed_actions: string[];
            /** Format: date-time */
            ends_at: string | null;
            functions: string[];
            id: components["schemas"]["Uuid"];
            reason: string;
            starts_at: components["schemas"]["Timestamp"];
            /** @enum {string} */
            state: "active" | "revoked" | "expired";
            subject_id?: components["schemas"]["Uuid"];
            target_id?: components["schemas"]["Uuid"];
            /** @enum {string} */
            type: "function" | "temporary" | "permanent";
        };
        SanctionEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Sanction"];
            request_id: components["schemas"]["Uuid"];
        };
        SanctionPage: {
            has_more: boolean;
            items: components["schemas"]["Sanction"][];
            next_cursor: string | null;
        };
        SanctionPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["SanctionPage"];
            request_id: components["schemas"]["Uuid"];
        };
        Sandbox: {
            /** @enum {string} */
            environment: "dev" | "test";
            expires_at: components["schemas"]["Timestamp"];
            id: components["schemas"]["Uuid"];
            plugin_id: string;
            preview_path?: string;
            /** @enum {string} */
            state: "requested" | "provisioning" | "ready" | "failed" | "expired";
            version: string;
        };
        SandboxEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Sandbox"];
            request_id: components["schemas"]["Uuid"];
        };
        SandboxRequest: {
            /** @enum {string} */
            environment: "dev" | "test";
            expires_at: components["schemas"]["Timestamp"];
            limits: {
                cpu_millicores: number;
                max_requests: number;
                memory_bytes: number;
            };
            operation_id: components["schemas"]["Uuid"];
            plugin_id: string;
            version: string;
        };
        ScopedConfigValues: {
            /** @enum {string} */
            environment?: "dev" | "test" | "production";
            group?: string;
            owner?: string;
            priority?: number;
            /** @enum {string} */
            scope: "global" | "environment" | "module" | "plugin" | "user_group";
            values: {
                [key: string]: components["schemas"]["JsonValue"];
            };
        };
        SearchHistoryItem: {
            created_at: components["schemas"]["Timestamp"];
            id: components["schemas"]["Uuid"];
            query: string;
        };
        SearchHistoryPage: {
            has_more: boolean;
            items: components["schemas"]["SearchHistoryItem"][];
            next_cursor: string | null;
        };
        SearchHistoryPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["SearchHistoryPage"];
            request_id: components["schemas"]["Uuid"];
        };
        SearchPage: {
            has_more: boolean;
            items: components["schemas"]["SearchResult"][];
            next_cursor: string | null;
        };
        SearchPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["SearchPage"];
            request_id: components["schemas"]["Uuid"];
        };
        SearchResult: components["schemas"]["Post"] | components["schemas"]["Profile"] | {
            count: number;
            topic: string;
        };
        /** @description Exactly one recipient_id or conversation_id. Server serializes canonical unordered account pair; saved is not delivered. */
        SendMessage: {
            body: string;
            conversation_id?: components["schemas"]["Uuid"];
            media_refs?: components["schemas"]["Uuid"][];
            operation_id: components["schemas"]["Uuid"];
            recipient_id?: components["schemas"]["Uuid"];
            /** @enum {string} */
            type: "text" | "image" | "video" | "gif";
        };
        /** @description Public feature availability only, without hostnames, keys, provider account details or management-only diagnostics. */
        ServiceAvailability: {
            features: {
                id: string;
                public_code?: string;
                /** @enum {string} */
                state: "available" | "unavailable" | "unknown";
            }[];
            /** @enum {string} */
            state: "available" | "degraded" | "unavailable";
            updated_at: components["schemas"]["Timestamp"];
        };
        ServiceAvailabilityEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["ServiceAvailability"];
            request_id: components["schemas"]["Uuid"];
        };
        ServiceHealth: {
            checked_at: components["schemas"]["Timestamp"];
            code?: string;
            plugin_id?: string;
            service: string;
            /** @enum {string} */
            state: "healthy" | "degraded" | "unavailable" | "unknown";
        };
        SessionPage: {
            has_more: boolean;
            items: components["schemas"]["DeviceSession"][];
            next_cursor: string | null;
        };
        SessionPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["SessionPage"];
            request_id: components["schemas"]["Uuid"];
        };
        /** @description Official OTP/MFA adapter output accepts refresh token up to 4096. Current refresh input and browser cookie session validator accept at most 2048: this existing compatibility boundary is not backend completion. */
        SessionTokens: {
            /** @description Sensitive. All checked-in examples are deliberately fictitious. */
            access_token: string;
            expires_at: number;
            refresh_token: string;
        };
        StepupRequest: {
            action_digest: components["schemas"]["Digest"];
            challenge_id: components["schemas"]["Uuid"];
            code: string;
            factor_id: components["schemas"]["Uuid"];
        };
        Suggestion: {
            /** @enum {string} */
            kind: "query" | "account" | "topic";
            text: string;
        };
        SuggestionPage: {
            has_more: boolean;
            items: components["schemas"]["Suggestion"][];
            next_cursor: string | null;
        };
        SuggestionPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["SuggestionPage"];
            request_id: components["schemas"]["Uuid"];
        };
        TargetIndexPatch: {
            base_version: number;
            /** @enum {string} */
            mode: "inherit" | "allow" | "deny";
            operation_id: components["schemas"]["Uuid"];
        };
        TargetIndexPolicy: {
            effective_indexable: boolean;
            /** @enum {string} */
            mode: "inherit" | "allow" | "deny";
            policy_epoch: number;
            /** @enum {string} */
            projection_state: "pending" | "running" | "succeeded" | "failed" | "superseded";
            row_version: number;
            target_id: components["schemas"]["Uuid"];
            /** @enum {string} */
            target_kind: "post" | "thread";
        };
        TargetIndexPolicyEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["TargetIndexPolicy"];
            request_id: components["schemas"]["Uuid"];
        };
        Thread: {
            allowed_actions: string[];
            author_id: components["schemas"]["Uuid"];
            head_resource_id: components["schemas"]["Uuid"];
            id: components["schemas"]["Uuid"];
            items: components["schemas"]["PostProjection"][];
            row_version: number;
            /** @enum {string} */
            visibility: "public" | "followers" | "self";
        };
        ThreadBatch: {
            base_version: number;
            items: components["schemas"]["PostInput"][];
            operation_id: components["schemas"]["Uuid"];
        };
        ThreadCreate: {
            /** @enum {string} */
            indexing_mode?: "inherit" | "allow" | "deny";
            items: components["schemas"]["PostInput"][];
            operation_id: components["schemas"]["Uuid"];
        };
        ThreadEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Thread"];
            request_id: components["schemas"]["Uuid"];
        };
        /** Format: date-time */
        Timestamp: string;
        Topic: {
            display_name: string;
            id: components["schemas"]["Uuid"];
            normalized_key: string;
            row_version: number;
        };
        TopicEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["Topic"];
            request_id: components["schemas"]["Uuid"];
        };
        TopicPage: {
            has_more: boolean;
            items: components["schemas"]["Topic"][];
            next_cursor: string | null;
        };
        TopicPageEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["TopicPage"];
            request_id: components["schemas"]["Uuid"];
        };
        TopicWrite: {
            base_version?: number;
            display_name: string;
            normalized_key: string;
            operation_id: components["schemas"]["Uuid"];
        };
        TypingReceipt: {
            expires_at: components["schemas"]["Timestamp"];
        };
        TypingReceiptEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["TypingReceipt"];
            request_id: components["schemas"]["Uuid"];
        };
        TypingRequest: {
            typing: boolean;
        };
        /** @description No hidden body, author reason, private existence or counters in unavailable placeholder. */
        UnavailableResource: {
            allowed_actions: string[];
            id: components["schemas"]["Uuid"];
            /** @enum {string} */
            state: "unavailable";
        };
        UploadComplete: {
            operation_id: components["schemas"]["Uuid"];
            sha256: components["schemas"]["Digest"];
        };
        UploadedPart: {
            part: number;
            upload_id: components["schemas"]["Uuid"];
            uploaded_parts: number[];
        };
        UploadedPartEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["UploadedPart"];
            request_id: components["schemas"]["Uuid"];
        };
        UploadRequest: {
            /** @enum {string} */
            intent: "post" | "comment" | "profile" | "draft" | "message" | "evidence" | "ai_input";
            /** @enum {string} */
            kind: "image" | "video" | "gif";
            operation_id: components["schemas"]["Uuid"];
            sha256: components["schemas"]["Digest"];
            size_bytes: number;
        };
        UploadSession: {
            expires_at: components["schemas"]["Timestamp"];
            id: components["schemas"]["Uuid"];
            media_id: components["schemas"]["Uuid"];
            reusable_refs: components["schemas"]["Uuid"][];
            /** @enum {string} */
            state: "allocated" | "uploading" | "uploaded" | "validated" | "failed" | "quarantined";
            uploaded_parts: number[];
        };
        UploadSessionEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["UploadSession"];
            request_id: components["schemas"]["Uuid"];
        };
        /** Format: uuid */
        Uuid: string;
        VerifyRequest: components["schemas"]["OtpVerificationRequest"] | components["schemas"]["RegistrationVerificationRequest"];
        VersionedCommand: {
            base_version: number;
            operation_id: components["schemas"]["Uuid"];
        };
        VisibilityPatch: {
            base_version: number;
            operation_id: components["schemas"]["Uuid"];
            preview_digest?: components["schemas"]["Digest"];
            /** @enum {string} */
            visibility: "public" | "followers" | "self";
        };
    };
    responses: never;
    parameters: {
        /** @example fixture-v1 */
        ClientRelease: string;
        /** @description Display snapshot only; never freezes current authorization. */
        ConfigVersion: components["schemas"]["ConfigVersion"];
        /** @example 1 */
        Csrf: "1";
        Cursor: string;
        Limit: number;
        /**
         * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
         * @example http://127.0.0.1:4011
         */
        Origin: string;
    };
    requestBodies: never;
    headers: {
        /**
         * @description Current authorization responses cannot be cached.
         * @example no-store
         */
        CacheControl: "no-store";
        /** @description Single byte range or bytes *\/size on 416. */
        ContentRange: string;
        /** @description Quoted content hash; conditional requests still recheck authorization. */
        ETag: string;
        /** @description Encrypted HttpOnly SameSite=Strict session; Secure and __Host-agora-admin in production, agora-admin in local dev/test. Never copy tokens to JSON. */
        SetCookie: string;
    };
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    listAccountsCoreAdmin: {
        parameters: {
            query?: {
                cursor?: components["schemas"]["Uuid"];
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ManagedAccountPageEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method rejected; no successful business side effect. */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listAnnouncementsCoreAdmin: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AnnouncementPageEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createAnnouncementCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AnnouncementWrite"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AnnouncementEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteAnnouncementCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                itemId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VersionedCommand"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActionReceiptEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    patchAnnouncementCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                itemId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AnnouncementWrite"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AnnouncementEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAppealsCoreAdmin: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AppealPageEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    decideAppealCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                appealId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminDecision"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AppealEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getAuditCoreAdmin: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
                plugin_id?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuditPageEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listBackupsCoreAdmin: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BackupPageEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createBackupCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateBackupRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            202: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BackupEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getCasesCoreAdmin: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminCasePageEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    decideCaseCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                caseId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminDecision"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminCaseEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    readCaseEvidenceCoreAdmin: {
        parameters: {
            query: {
                reason: string;
            };
            header: {
                "X-Stepup-Id": components["schemas"]["Uuid"];
            };
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                caseId: components["schemas"]["Uuid"];
                /** @example 10000000-0000-4000-8000-000000000001 */
                evidenceRef: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EvidenceProjectionEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getOtpConfigurationCoreAdmin: {
        parameters: {
            query?: {
                group?: "otp";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OtpConfigurationEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method rejected; no successful business side effect. */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    previewOtpConfigurationCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfigPreviewRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigPreviewEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method rejected; no successful business side effect. */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    publishOtpConfigurationCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfigCommitRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigReleaseEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method rejected; no successful business side effect. */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    rollbackOtpConfigurationCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfigCommitRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigReleaseEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method rejected; no successful business side effect. */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getConfigurationDefinitionsCoreAdmin: {
        parameters: {
            query?: {
                namespace?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigDefinitionsEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    previewConfigurationCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FullConfigurationPreviewRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FullConfigPreviewEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    publishConfigurationCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfigCommitRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigReleaseEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    rollbackConfigurationCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfigCommitRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigReleaseEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getContentsCoreAdmin: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RevisionPageEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    inviteDeveloperCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeveloperInvitationRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeveloperInvitationEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    withdrawDocumentReleaseCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                releaseId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminSensitiveCommand"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentReleaseStateEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    patchDocumentRevisionCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                revisionId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DocumentRevisionWrite"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentRevisionEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    readyDocumentRevisionCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                revisionId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DocumentReady"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentRevisionEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listManagedDocumentsCoreAdmin: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ManagedDocumentPageEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createManagedDocumentCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ManagedDocumentCreate"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ManagedDocumentEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    previewDocumentReleaseCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                documentId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DocumentReleasePreviewRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImpactPreviewEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    publishDocumentReleaseCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                documentId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DocumentReleaseCommand"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentReleaseStateEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listDocumentRevisionsCoreAdmin: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                documentId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentRevisionPageEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createDocumentRevisionCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                documentId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DocumentRevisionWrite"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentRevisionEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getHealthCoreAdmin: {
        parameters: {
            query?: {
                plugin_id?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthSnapshotEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createInvitationCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InvitationRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InvitationReceiptEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    revokeInvitationCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                invitationId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminSensitiveCommand"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActionReceiptEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getMediaCoreAdmin: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminMediaPageEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createMfaRecoveryCaseCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MfaRecoveryCaseRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MfaRecoveryCaseEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getMfaRecoveryCaseCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                caseId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MfaRecoveryCaseEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    decideMfaRecoveryCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                caseId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MfaRecoveryDecision"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MfaRecoveryCaseEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    challengeMfaFactorCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MfaChallengeRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MfaChallengeEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method rejected; no successful business side effect. */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listMfaFactorsCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MfaFactorsEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method rejected; no successful business side effect. */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    enrollMfaFactorCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MfaEnrollmentRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MfaEnrollmentEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method rejected; no successful business side effect. */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    verifyMfaFactorCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MfaVerifyRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CoreMfaVerificationEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method rejected; no successful business side effect. */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getOverviewCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminOverviewEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getPlacementsCoreAdmin: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlacementPageEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createPlacementCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PlacementWrite"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlacementEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deletePlacementCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                itemId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VersionedCommand"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActionReceiptEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    patchPlacementCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                itemId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PlacementWrite"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PlacementEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    confirmPluginDataPurgeCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PluginLifecycleCommit"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActionReceiptEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    previewPluginDataPurgeCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PluginPurgePlan"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PluginPurgePreviewEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    changePluginLifecycleCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PluginLifecycleCommit"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PluginInstallationEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    previewPluginLifecycleCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PluginActionPlan"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PluginLifecyclePreviewEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listPluginsCoreAdmin: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PluginPageEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    grantPluginPermissionsCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example sample-a */
                pluginId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PluginPermissionGrant"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActionReceiptEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    reviewPluginCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example sample-a */
                pluginId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PluginReview"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActionReceiptEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listPluginVersionsCoreAdmin: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path: {
                /** @example sample-a */
                pluginId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PluginVersionPageEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    retryPurgeJobCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                jobId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminSensitiveCommand"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PurgeJobEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getReleaseCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                releaseId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReleaseStateEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getReleaseEvidenceCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                releaseId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EvidenceResultsEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    confirmReleaseCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReleaseConfirmationRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReleaseConfirmationEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    confirmReleaseExpansionCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReleaseConfirmationRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReleaseConfirmationEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    previewReleaseCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReleasePreviewRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReleasePreviewEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createRestoreCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RestoreCommit"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            202: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RestoreRunEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getRestoreCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                restoreId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RestoreRunEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    previewRestoreCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RestorePreviewRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImpactPreviewEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    listRetentionObligationsCoreAdmin: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                data_class?: string;
                limit?: components["parameters"]["Limit"];
                plugin_id?: string;
                state?: "pending" | "running" | "succeeded" | "failed" | "blocked";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RetentionObligationPageEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    previewRetentionExtensionCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                obligationId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RetentionExtensionRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImpactPreviewEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    extendRetentionObligationCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                obligationId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RetentionExtensionCommit"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RetentionObligationEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    decideRevisionCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                revisionId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminDecision"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RevisionReceiptEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    grantRoleCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RoleGrantRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RoleGrantEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    revokeRoleGrantCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                grantId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminSensitiveCommand"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActionReceiptEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    previewRoleGrantCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RoleGrantRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImpactPreviewEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createSanctionCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateSanction"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SanctionEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    revokeSanctionCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                sanctionId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminSensitiveCommand"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SanctionEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getSessionCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdministratorEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method rejected; no successful business side effect. */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createStepupCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StepupRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CoreStepupReceiptEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method rejected; no successful business side effect. */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getTopicsCoreAdmin: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TopicPageEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createTopicCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TopicWrite"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TopicEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    deleteTopicCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                itemId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VersionedCommand"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActionReceiptEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    patchTopicCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                itemId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TopicWrite"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TopicEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    createCoreManagementOtpChallenge: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginChallengeRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OtpChallengeEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method rejected; no successful business side effect. */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    logoutCoreManagementSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OperationCommand"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RevocationReceiptEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method rejected; no successful business side effect. */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    readCoreManagementOtpOperation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                operationId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OtpVerificationRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthOperationEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method rejected; no successful business side effect. */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    loginCorePassword: {
        parameters: {
            query?: never;
            header: {
                "X-Admin-Password-Nonce": components["schemas"]["Uuid"];
                "X-Admin-Password-Signature": components["schemas"]["Digest"];
                "X-Admin-Password-Time": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CorePasswordRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CoreMfaVerificationEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method rejected; no successful business side effect. */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    registerCorePasswordCaptcha: {
        parameters: {
            query?: never;
            header: {
                "X-Admin-Password-Nonce": components["schemas"]["Uuid"];
                "X-Admin-Password-Signature": components["schemas"]["Digest"];
                "X-Admin-Password-Time": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CoreCaptchaRegistration"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CoreCaptchaReceiptUnversionedEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method rejected; no successful business side effect. */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    requestCorePasswordRecovery: {
        parameters: {
            query?: never;
            header: {
                "X-Admin-Password-Nonce": components["schemas"]["Uuid"];
                "X-Admin-Password-Signature": components["schemas"]["Digest"];
                "X-Admin-Password-Time": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CoreForgotPasswordRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PasswordForgotReceiptUnversionedEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method rejected; no successful business side effect. */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    refreshCoreManagementSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RefreshedSessionEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method rejected; no successful business side effect. */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    verifyCoreManagementOtp: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OtpVerificationRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthReceiptEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method rejected; no successful business side effect. */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    getOperationCoreAdmin: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                operationId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccountOperationEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current action or audience denied */
            403: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized target (no private existence disclosure) */
            404: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method rejected; no successful business side effect. */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Version or operation payload conflict; preserve input */
            409: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input or unmet business requirement */
            422: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed; query original operation before retry */
            503: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
}
