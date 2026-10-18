export interface paths {
    "/admin/accounts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listAccountsManagement
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        get: operations["listAccountsManagement"];
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
         * listAnnouncementsManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["listAnnouncementsManagement"];
        put?: never;
        /**
         * createAnnouncementManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["createAnnouncementManagement"];
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
         * deleteAnnouncementManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        delete: operations["deleteAnnouncementManagement"];
        options?: never;
        head?: never;
        /**
         * patchAnnouncementManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        patch: operations["patchAnnouncementManagement"];
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
         * getAppealsManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getAppealsManagement"];
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
         * decideAppealManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["decideAppealManagement"];
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
         * getAuditManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getAuditManagement"];
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
         * listBackupsManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["listBackupsManagement"];
        put?: never;
        /**
         * createBackupManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["createBackupManagement"];
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
         * getCasesManagement
         * @description List currently authorized report case summaries without reason or evidence. Case decisions remain unavailable. Browser uses cookie; core consumes server-held Bearer token.
         */
        get: operations["getCasesManagement"];
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
         * decideCaseManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["decideCaseManagement"];
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
         * readCaseEvidenceManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["readCaseEvidenceManagement"];
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
         * getOtpConfigurationManagement
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        get: operations["getOtpConfigurationManagement"];
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
         * previewOtpConfigurationManagement
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        post: operations["previewOtpConfigurationManagement"];
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
         * publishOtpConfigurationManagement
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        post: operations["publishOtpConfigurationManagement"];
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
         * rollbackOtpConfigurationManagement
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        post: operations["rollbackOtpConfigurationManagement"];
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
         * getConfigurationDefinitionsManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getConfigurationDefinitionsManagement"];
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
         * previewConfigurationManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["previewConfigurationManagement"];
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
         * publishConfigurationManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["publishConfigurationManagement"];
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
         * rollbackConfigurationManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["rollbackConfigurationManagement"];
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
         * getContentsManagement
         * @description List currently selected revisions only, with per-resource current grant and MFA checks. No private full-history access. Browser uses cookie; core consumes server-held Bearer token.
         */
        get: operations["getContentsManagement"];
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
         * inviteDeveloperManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["inviteDeveloperManagement"];
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
         * withdrawDocumentReleaseManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["withdrawDocumentReleaseManagement"];
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
         * patchDocumentRevisionManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        patch: operations["patchDocumentRevisionManagement"];
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
         * readyDocumentRevisionManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["readyDocumentRevisionManagement"];
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
         * listManagedDocumentsManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["listManagedDocumentsManagement"];
        put?: never;
        /**
         * createManagedDocumentManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["createManagedDocumentManagement"];
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
         * previewDocumentReleaseManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["previewDocumentReleaseManagement"];
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
         * publishDocumentReleaseManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["publishDocumentReleaseManagement"];
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
         * listDocumentRevisionsManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["listDocumentRevisionsManagement"];
        put?: never;
        /**
         * createDocumentRevisionManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["createDocumentRevisionManagement"];
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
         * getHealthManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getHealthManagement"];
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
         * createInvitationManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["createInvitationManagement"];
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
         * revokeInvitationManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["revokeInvitationManagement"];
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
         * getMediaManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getMediaManagement"];
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
         * createMfaRecoveryCaseManagement
         * @description Planned bounded case intake for current official identity. Intake never grants aal2 or resets factors. Final recovery requires a different currently qualified administrator and audited ownership proof; sole-owner emergency uses protected deployment-owner procedure, no public reset HTTP bypass.
         */
        post: operations["createMfaRecoveryCaseManagement"];
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
         * getMfaRecoveryCaseManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getMfaRecoveryCaseManagement"];
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
         * decideMfaRecoveryManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["decideMfaRecoveryManagement"];
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
         * challengeMfaFactorManagement
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        post: operations["challengeMfaFactorManagement"];
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
         * listMfaFactorsManagement
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        get: operations["listMfaFactorsManagement"];
        put?: never;
        /**
         * enrollMfaFactorManagement
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        post: operations["enrollMfaFactorManagement"];
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
         * verifyMfaFactorManagement
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        post: operations["verifyMfaFactorManagement"];
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
         * getOverviewManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getOverviewManagement"];
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
         * getPlacementsManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getPlacementsManagement"];
        put?: never;
        /**
         * createPlacementManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["createPlacementManagement"];
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
         * deletePlacementManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        delete: operations["deletePlacementManagement"];
        options?: never;
        head?: never;
        /**
         * patchPlacementManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        patch: operations["patchPlacementManagement"];
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
         * confirmPluginDataPurgeManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["confirmPluginDataPurgeManagement"];
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
         * previewPluginDataPurgeManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["previewPluginDataPurgeManagement"];
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
         * changePluginLifecycleManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["changePluginLifecycleManagement"];
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
         * previewPluginLifecycleManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["previewPluginLifecycleManagement"];
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
         * listPluginsManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["listPluginsManagement"];
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
         * grantPluginPermissionsManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["grantPluginPermissionsManagement"];
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
         * reviewPluginManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["reviewPluginManagement"];
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
         * listPluginVersionsManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["listPluginVersionsManagement"];
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
         * retryPurgeJobManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["retryPurgeJobManagement"];
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
         * getReleaseManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getReleaseManagement"];
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
         * getReleaseEvidenceManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getReleaseEvidenceManagement"];
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
         * confirmReleaseManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["confirmReleaseManagement"];
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
         * confirmReleaseExpansionManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["confirmReleaseExpansionManagement"];
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
         * previewReleaseManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["previewReleaseManagement"];
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
         * createRestoreManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["createRestoreManagement"];
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
         * getRestoreManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getRestoreManagement"];
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
         * previewRestoreManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["previewRestoreManagement"];
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
         * listRetentionObligationsManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["listRetentionObligationsManagement"];
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
         * previewRetentionExtensionManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["previewRetentionExtensionManagement"];
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
         * extendRetentionObligationManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["extendRetentionObligationManagement"];
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
         * decideRevisionManagement
         * @description Commit an exact decision preview with one-use MFA stepup, current action/resource/environment grant, revision-version CAS, and operation idempotency. Browser uses cookie and same-origin CSRF; core consumes server-held Bearer token.
         */
        post: operations["decideRevisionManagement"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/revisions/{revisionId}/decision-previews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * previewRevisionDecisionManagement
         * @description Create a five-minute, actor/session/environment-bound preview of the exact current revision decision and reason. Its action_digest is used for the existing one-use management stepup; commit rechecks current grant, revision version, preview, and stepup in one transaction.
         */
        post: operations["previewRevisionDecisionManagement"];
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
         * grantRoleManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["grantRoleManagement"];
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
         * revokeRoleGrantManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["revokeRoleGrantManagement"];
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
         * previewRoleGrantManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["previewRoleGrantManagement"];
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
         * createSanctionManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["createSanctionManagement"];
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
         * revokeSanctionManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["revokeSanctionManagement"];
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
         * getSessionManagement
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        get: operations["getSessionManagement"];
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
         * createStepupManagement
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        post: operations["createStepupManagement"];
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
         * getTopicsManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        get: operations["getTopicsManagement"];
        put?: never;
        /**
         * createTopicManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        post: operations["createTopicManagement"];
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
         * deleteTopicManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        delete: operations["deleteTopicManagement"];
        options?: never;
        head?: never;
        /**
         * patchTopicManagement
         * @description Planned management domain API, not deployed. Per action/resource/environment grants, current MFA and sensitive cooldown apply. Browser uses cookie + same-origin CSRF; core consumes server-held Bearer token. No role self-assertion, private full-history access or production authorization from mock results.
         */
        patch: operations["patchTopicManagement"];
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
         * createManagementOtpChallenge
         * @description Browser BFF: same-origin JSON + CSRF, encrypted HttpOnly cookie. Login rechecks current management grant before setting cookie. No access_token or refresh_token in browser JSON.
         */
        post: operations["createManagementOtpChallenge"];
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
         * logoutManagementSession
         * @description Browser BFF: same-origin JSON + CSRF, encrypted HttpOnly cookie. Login rechecks current management grant before setting cookie. No access_token or refresh_token in browser JSON.
         */
        post: operations["logoutManagementSession"];
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
         * readManagementOtpOperation
         * @description Browser BFF: same-origin JSON + CSRF, encrypted HttpOnly cookie. Login rechecks current management grant before setting cookie. No access_token or refresh_token in browser JSON. Pending/unknown core result has no session: BFF currently returns SERVICE_UNAVAILABLE 503 instead of pending.
         */
        post: operations["readManagementOtpOperation"];
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
         * loginManagementPassword
         * @description Browser BFF: same-origin JSON + CSRF. Auth tokens stay inside encrypted HttpOnly cookie. Password fallback disabled by default; full initialization/acceptance incomplete.
         */
        post: operations["loginManagementPassword"];
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
         * createManagementPasswordCaptcha
         * @description Browser BFF: same-origin JSON + CSRF. Auth tokens stay inside encrypted HttpOnly cookie. Password fallback disabled by default; full initialization/acceptance incomplete.
         */
        post: operations["createManagementPasswordCaptcha"];
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
         * requestManagementPasswordRecovery
         * @description Browser BFF: same-origin JSON + CSRF. Auth tokens stay inside encrypted HttpOnly cookie. Password fallback disabled by default; full initialization/acceptance incomplete.
         */
        post: operations["requestManagementPasswordRecovery"];
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
         * refreshManagementSession
         * @description Browser BFF: same-origin JSON + CSRF, encrypted HttpOnly cookie. Login rechecks current management grant before setting cookie. No access_token or refresh_token in browser JSON.
         */
        post: operations["refreshManagementSession"];
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
         * verifyManagementOtp
         * @description Browser BFF: same-origin JSON + CSRF, encrypted HttpOnly cookie. Login rechecks current management grant before setting cookie. No access_token or refresh_token in browser JSON.
         */
        post: operations["verifyManagementOtp"];
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
         * getOperationManagement
         * @description Recheck current management grant. aal1 only session/MFA onboarding, permissions empty. Business access requires signed aal2, current official TOTP factor/session and environment grant. Config preview binds all six OTP values or rollback version; commit consumes single-use exact stepup. Production publication refused without concrete confirmation.
         */
        get: operations["getOperationManagement"];
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
            action: "auth.register" | "session.revoke" | "auth.logout" | "recovery.request" | "config.release" | "config.rollback" | "post.create" | "comment.create" | "like.put" | "like.remove" | "block.put" | "block.remove" | "profile.update" | "report.create" | "moderation.revisions.decide" | "upload.create" | "upload.part" | "upload.complete";
            operation_id: components["schemas"]["Uuid"];
            result?: components["schemas"]["ConfigRelease"] | components["schemas"]["RevisionReceipt"] | components["schemas"]["ReactionReceipt"] | components["schemas"]["ActionReceipt"] | components["schemas"]["Profile"] | components["schemas"]["Report"] | components["schemas"]["UploadSession"] | components["schemas"]["UploadedPart"];
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
            /** @description Image posts may have an empty caption; other types require nonempty body. Current visible-character limit uses Unicode 17 UAX29 grapheme clusters and active configuration. */
            body?: string;
            operation_id: components["schemas"]["Uuid"];
            tags?: string[];
        };
        ContentRevision: {
            alt_text: string[];
            /** @description Image posts may have an empty caption; other types require nonempty body. Current visible-character limit uses Unicode 17 UAX29 grapheme clusters and active configuration. */
            body: string;
            id: components["schemas"]["Uuid"];
            media_refs: components["schemas"]["Uuid"][];
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
            /** @description Image posts may have an empty caption; other types require nonempty body. Current visible-character limit uses Unicode 17 UAX29 grapheme clusters and active configuration. */
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
            /** @description Image posts may have an empty caption; other types require nonempty body. Current visible-character limit uses Unicode 17 UAX29 grapheme clusters and active configuration. */
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
            /** @description Image posts may have an empty caption; other types require nonempty body. Current visible-character limit uses Unicode 17 UAX29 grapheme clusters and active configuration. */
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
            media_refs: components["schemas"]["Uuid"][];
            revision_id: components["schemas"]["Uuid"];
            row_version: number;
            /** @enum {string} */
            type: "text" | "images";
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
            /** @description Image posts may have an empty caption; other types require nonempty body. Current visible-character limit uses Unicode 17 UAX29 grapheme clusters and active configuration. */
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
            /** @description Image posts may have an empty caption; other types require nonempty body. Current visible-character limit uses Unicode 17 UAX29 grapheme clusters and active configuration. */
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
            media_refs: components["schemas"]["Uuid"][];
            revision_id: components["schemas"]["Uuid"];
            row_version: number;
            /** @enum {string} */
            type: "text" | "images";
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
        RevisionDecisionPreview: {
            action_digest: components["schemas"]["Digest"];
            base_version: number;
            expires_at: components["schemas"]["Timestamp"];
            preview_digest: components["schemas"]["Digest"];
            preview_id: components["schemas"]["Uuid"];
            revision_id: components["schemas"]["Uuid"];
        };
        RevisionDecisionPreviewEnvelope: {
            config_version: components["schemas"]["ConfigVersion"];
            data: components["schemas"]["RevisionDecisionPreview"];
            request_id: components["schemas"]["Uuid"];
        };
        RevisionDecisionPreviewRequest: {
            /** @enum {string} */
            decision: "approve" | "reject";
            operation_id: components["schemas"]["Uuid"];
            reason: string;
        };
        RevisionDecisionRequest: {
            base_version: number;
            /** @enum {string} */
            decision: "approve" | "reject";
            operation_id: components["schemas"]["Uuid"];
            preview_digest: components["schemas"]["Digest"];
            preview_id: components["schemas"]["Uuid"];
            reason: string;
            stepup_id: components["schemas"]["Uuid"];
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
    listAccountsManagement: {
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
    listAnnouncementsManagement: {
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
    createAnnouncementManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    deleteAnnouncementManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    patchAnnouncementManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    getAppealsManagement: {
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
    decideAppealManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    getAuditManagement: {
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
    listBackupsManagement: {
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
    createBackupManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    getCasesManagement: {
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
    decideCaseManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    readCaseEvidenceManagement: {
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
    getOtpConfigurationManagement: {
        parameters: {
            query: {
                group: "otp";
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
    previewOtpConfigurationManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    publishOtpConfigurationManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    rollbackOtpConfigurationManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    getConfigurationDefinitionsManagement: {
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
    previewConfigurationManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    publishConfigurationManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    rollbackConfigurationManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    getContentsManagement: {
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
    inviteDeveloperManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    withdrawDocumentReleaseManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    patchDocumentRevisionManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    readyDocumentRevisionManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    listManagedDocumentsManagement: {
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
    createManagedDocumentManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    previewDocumentReleaseManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    publishDocumentReleaseManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    listDocumentRevisionsManagement: {
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
    createDocumentRevisionManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    getHealthManagement: {
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
    createInvitationManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    revokeInvitationManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    getMediaManagement: {
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
    createMfaRecoveryCaseManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    getMfaRecoveryCaseManagement: {
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
    decideMfaRecoveryManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    challengeMfaFactorManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    listMfaFactorsManagement: {
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
    enrollMfaFactorManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BrowserMfaEnrollmentRequest"];
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
    verifyMfaFactorManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
                    "Set-Cookie": components["headers"]["SetCookie"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BrowserAdministratorEnvelope"];
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
    getOverviewManagement: {
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
    getPlacementsManagement: {
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
    createPlacementManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    deletePlacementManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    patchPlacementManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    confirmPluginDataPurgeManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    previewPluginDataPurgeManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    changePluginLifecycleManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    previewPluginLifecycleManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    listPluginsManagement: {
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
    grantPluginPermissionsManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    reviewPluginManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    listPluginVersionsManagement: {
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
    retryPurgeJobManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    getReleaseManagement: {
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
    getReleaseEvidenceManagement: {
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
    confirmReleaseManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    confirmReleaseExpansionManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    previewReleaseManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    createRestoreManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    getRestoreManagement: {
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
    previewRestoreManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    listRetentionObligationsManagement: {
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
    previewRetentionExtensionManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    extendRetentionObligationManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    decideRevisionManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                revisionId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RevisionDecisionRequest"];
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
    previewRevisionDecisionManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
            path: {
                revisionId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RevisionDecisionPreviewRequest"];
            };
        };
        responses: {
            /** @description Exact decision preview; no decision has been applied */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RevisionDecisionPreviewEnvelope"];
                };
            };
            /** @description Invalid or revoked current session */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current grant or MFA denied */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unavailable or unauthorized revision */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Revision or operation conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid decision or reason */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Rate limited */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Dependency unavailable or outcome unconfirmed */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    grantRoleManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    revokeRoleGrantManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    previewRoleGrantManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    createSanctionManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    revokeSanctionManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    getSessionManagement: {
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
    createStepupManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
                    "Set-Cookie": components["headers"]["SetCookie"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BrowserStepupReceiptEnvelope"];
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
    getTopicsManagement: {
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
    createTopicManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    deleteTopicManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    patchTopicManagement: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    createManagementOtpChallenge: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    logoutManagementSession: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
    readManagementOtpOperation: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
                    "Set-Cookie": components["headers"]["SetCookie"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BrowserAdministratorEnvelope"];
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
    loginManagementPassword: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BrowserPasswordRequest"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    "Set-Cookie": components["headers"]["SetCookie"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BrowserAdministratorEnvelope"];
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
    createManagementPasswordCaptcha: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Empty"];
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
                    "application/json": components["schemas"]["CaptchaUnversionedEnvelope"];
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
    requestManagementPasswordRecovery: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BrowserForgotPasswordRequest"];
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
    refreshManagementSession: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Empty"];
            };
        };
        responses: {
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    "Set-Cookie": components["headers"]["SetCookie"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BrowserAdministratorEnvelope"];
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
    verifyManagementOtp: {
        parameters: {
            query?: never;
            header: {
                /**
                 * @description Must equal actual BFF origin; forged forwarded headers do not establish origin.
                 * @example http://127.0.0.1:4011
                 */
                Origin: components["parameters"]["Origin"];
                /** @example 1 */
                "X-AgoraWeave-CSRF": components["parameters"]["Csrf"];
            };
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
                    "Set-Cookie": components["headers"]["SetCookie"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BrowserAdministratorEnvelope"];
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
    getOperationManagement: {
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
