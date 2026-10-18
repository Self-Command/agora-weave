export interface paths {
    "/ai/answers/{answerId}/copy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * copyAiAnswer
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["copyAiAnswer"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ai/answers/{answerId}/feedback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * submitAiFeedback
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["submitAiFeedback"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ai/conversations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listAiConversations
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["listAiConversations"];
        put?: never;
        /**
         * createAiConversation
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["createAiConversation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ai/conversations/{conversationId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getAiConversation
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["getAiConversation"];
        put?: never;
        post?: never;
        /**
         * deleteAiConversation
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        delete: operations["deleteAiConversation"];
        options?: never;
        head?: never;
        /**
         * renameAiConversation
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        patch: operations["renameAiConversation"];
        trace?: never;
    };
    "/ai/models": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listAiModels
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["listAiModels"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ai/requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * createAiRequest
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["createAiRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ai/requests/{requestId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getAiRequest
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["getAiRequest"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ai/requests/{requestId}/retry": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * retryAiRequest
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["retryAiRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ai/requests/{requestId}/stop": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * stopAiRequest
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["stopAiRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ai/requests/{requestId}/stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * streamAiRequest
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["streamAiRequest"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ai/usage": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getAiUsage
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["getAiUsage"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/appeals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listOwnAppeals
         * @description Lists only the authenticated appellant's own cases and public decision status.
         */
        get: operations["listOwnAppeals"];
        put?: never;
        /**
         * createAppeal
         * @description Accepts one appeal for an owned sanction with durable operation lookup. Intake leaves the case awaiting independent review.
         */
        post: operations["createAppeal"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
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
         * createOtpChallenge
         * @description E.164 + login/register only; registration needs invitation, age declaration and current document set. Accepted SMS required for success. Same operation never sends twice. No OTP in response.
         */
        post: operations["createOtpChallenge"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/dev-test-login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Development test account login
         * @description Enabled only for the single provisioned ordinary test account in the local dev environment. Uses official Auth password verification and binds a real admitted session. This route is unavailable in test and production.
         */
        post: operations["devTestLogin"];
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
         * logoutAppSession
         * @description Revokes current session. Exact same signed session may read only its durable logout receipt after revocation.
         */
        post: operations["logoutAppSession"];
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
         * readOtpVerificationOperation
         * @description Proof-bearing read, not new verification. Path UUID equals body operation_id. No SMS or Auth verify call; exact still-authorized receipt or pending/unknown.
         */
        post: operations["readOtpVerificationOperation"];
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
         * refreshAppSession
         * @description Current implementation.
         */
        post: operations["refreshAppSession"];
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
         * verifyOtpChallenge
         * @description Six digit OTP and operation UUID. New registration atomically admits invitation, current terms consents and adult declaration. Unconfirmed outcome: retain exact input and query original operation; token receipt <=5 minutes and still current-authorized.
         */
        post: operations["verifyOtpChallenge"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/client/compatibility": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getClientCompatibility
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["getClientCompatibility"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/comments/{commentId}": {
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
         * deleteComment
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        delete: operations["deleteComment"];
        options?: never;
        head?: never;
        /**
         * patchComment
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        patch: operations["patchComment"];
        trace?: never;
    };
    "/config/effective": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getEffectiveConfiguration
         * @description mobile requires current App session; anonymous/share-read uses share only. Never secrets or account preferences to share. Values validated against registered config schemas.
         */
        get: operations["getEffectiveConfiguration"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/deletions/{deletionId}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * restoreResource
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["restoreResource"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/developer/plugin-packages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listDeveloperPackages
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["listDeveloperPackages"];
        put?: never;
        /**
         * submitPluginPackage
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["submitPluginPackage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/developer/sandboxes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * createDeveloperSandbox
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["createDeveloperSandbox"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/developer/sandboxes/{sandboxId}/evidence": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getSandboxEvidence
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["getSandboxEvidence"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/discover": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getDiscovery
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["getDiscovery"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dm/conversations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listDmConversations
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["listDmConversations"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dm/conversations/{conversationId}/listing": {
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
         * hideConversationListing
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        delete: operations["hideConversationListing"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dm/conversations/{conversationId}/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listDmMessages
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["listDmMessages"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dm/conversations/{conversationId}/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * recordConversationRead
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["recordConversationRead"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dm/conversations/{conversationId}/typing": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * signalTyping
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["signalTyping"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dm/eligibility/{recipientId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getDmEligibility
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["getDmEligibility"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dm/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * sendDmMessage
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["sendDmMessage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dm/messages/{messageId}/access": {
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
         * revokeOwnMessageAccess
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        delete: operations["revokeOwnMessageAccess"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dm/messages/{messageId}/delivery": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * recordMessageDelivery
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["recordMessageDelivery"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dm/requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listDmRequests
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["listDmRequests"];
        put?: never;
        /**
         * createDmRequest
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["createDmRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/dm/requests/{requestId}/actions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * actOnDmRequest
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["actOnDmRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/documents/{documentId}/releases/{releaseId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getPublishedDocument
         * @description documentId is UUID or stable key; releaseId UUID or current. Superseded legal history is_current=false; withdrawn/prepared never readable.
         */
        get: operations["getPublishedDocument"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/documents/current": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getCurrentDocuments
         * @description No query or terms/app/zh-CN returns registration set plus age_declaration_version; other selections return full published set. Authenticated App only app; share-read only share; admin rejected. GET never records consent.
         */
        get: operations["getCurrentDocuments"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getProjectedEvents
         * @description Default JSON current-recipient metadata projection, not raw internal envelope. SSE: id=sequence, event=changed, data=ProjectedEvent. WebSocket Upgrade 101 and one ProjectedEvent JSON/frame, closes 1008 access change, 1013 backpressure, 1011 service failure.
         */
        get: operations["getProjectedEvents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/extensions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listExtensions
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["listExtensions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/feeds/{kind}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listPersonalFeed
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["listPersonalFeed"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/feeds/latest": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listLatestPosts
         * @description Public currently approved posts, creation order; guest or App session. share-read forbidden. Opaque query/session/release/config bound cursor. Text-only minimal current projection.
         */
        get: operations["listLatestPosts"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/follow-requests/{requestId}/actions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * actOnFollowRequest
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["actOnFollowRequest"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/ai-use-policy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getAuthorAiUsePolicy
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["getAuthorAiUsePolicy"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * patchAuthorAiUsePolicy
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        patch: operations["patchAuthorAiUsePolicy"];
        trace?: never;
    };
    "/me/blocks/{accountId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * putBlock
         * @description A current authenticated account blocks another active account; the same transaction removes both effective follow directions. An exact operation retry returns the original receipt. Unblock does not restore relationships.
         */
        put: operations["putBlock"];
        post?: never;
        /**
         * removeBlock
         * @description A current authenticated account removes its own active block. The existing block fact is retained for audit and effective follows stay removed. An exact operation retry returns the original receipt.
         */
        delete: operations["removeBlock"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/bookmarks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listBookmarks
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["listBookmarks"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/bookmarks/{postId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getBookmark
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["getBookmark"];
        /**
         * putBookmark
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        put: operations["putBookmark"];
        post?: never;
        /**
         * deleteBookmark
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        delete: operations["deleteBookmark"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/cancellation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * cancelAccount
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["cancelAccount"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/cancellation/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * previewCancellation
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["previewCancellation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/contents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List the current account's submitted posts
         * @description Author-only current revisions including pending, published and rejected posts. Never used by public profile or feed reads. Cursor is bound to the current account, session, environment, limit and client release.
         */
        get: operations["listOwnedContents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/document-receipts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listDocumentReceipts
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["listDocumentReceipts"];
        put?: never;
        /**
         * recordDocumentReceipt
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["recordDocumentReceipt"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/drafts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listDrafts
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["listDrafts"];
        put?: never;
        /**
         * createDraft
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["createDraft"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/drafts/{draftId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getDraft
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["getDraft"];
        put?: never;
        post?: never;
        /**
         * deleteDraft
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        delete: operations["deleteDraft"];
        options?: never;
        head?: never;
        /**
         * patchDraft
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        patch: operations["patchDraft"];
        trace?: never;
    };
    "/me/follow-requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listFollowRequests
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["listFollowRequests"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/followers/{accountId}": {
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
         * removeFollower
         * @description Planned: remove current incoming follow relation immediately. New re-follow rechecks approval/cooldown/block; does not change public read rights.
         */
        delete: operations["removeFollower"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/follows/{accountId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * putFollow
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        put: operations["putFollow"];
        post?: never;
        /**
         * removeFollow
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        delete: operations["removeFollow"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/interests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getInterests
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["getInterests"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * patchInterests
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        patch: operations["patchInterests"];
        trace?: never;
    };
    "/me/mutes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listMutes
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["listMutes"];
        /**
         * putMute
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        put: operations["putMute"];
        post?: never;
        /**
         * deleteMute
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        delete: operations["deleteMute"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/phone-change": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * changePhone
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["changePhone"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/phone-change/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * previewPhoneChange
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["previewPhoneChange"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/preferences": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getPreferences
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["getPreferences"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * patchPreferences
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        patch: operations["patchPreferences"];
        trace?: never;
    };
    "/me/profile": {
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
         * updateProfile
         * @description Create or update the authenticated account profile using the current row-version CAS and operation idempotency.
         */
        patch: operations["updateProfile"];
        trace?: never;
    };
    "/me/push-devices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * registerPushDevice
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["registerPushDevice"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/push-devices/{deviceId}": {
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
         * revokePushDevice
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        delete: operations["revokePushDevice"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/recently-deleted": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listRecentlyDeleted
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["listRecentlyDeleted"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listOwnReports
         * @description Read the current reporter's own report summaries and states without another reporter's evidence or internal case details.
         */
        get: operations["listOwnReports"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/sanctions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listOwnSanctions
         * @description Lists sanctions on the authenticated account or its own content, without exposing another account's records.
         */
        get: operations["listOwnSanctions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/search-history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listSearchHistory
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["listSearchHistory"];
        put?: never;
        post?: never;
        /**
         * clearSearchHistory
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        delete: operations["clearSearchHistory"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/search-indexing": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getAuthorIndexPolicy
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["getAuthorIndexPolicy"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * patchAuthorIndexPolicy
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        patch: operations["patchAuthorIndexPolicy"];
        trace?: never;
    };
    "/me/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listDeviceSessions
         * @description Current implementation.
         */
        get: operations["listDeviceSessions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/sessions/{sessionId}": {
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
         * revokeDeviceSession
         * @description Current device can be revoked. Reject stale row_version; subsequent new access rejects revoked session.
         */
        delete: operations["revokeDeviceSession"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/media/{mediaId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getMediaBytes
         * @description Proxy bytes, no redirect/origin URL. Single bytes range; derivative inherits parent authorization. Conditional/range and each stream chunk recheck current access. HEAD no successful body. Invalid Range empty 416.
         */
        get: operations["getMediaBytes"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        /**
         * headMediaBytes
         * @description Proxy bytes, no redirect/origin URL. Single bytes range; derivative inherits parent authorization. Conditional/range and each stream chunk recheck current access. HEAD no successful body. Invalid Range empty 416.
         */
        head: operations["headMediaBytes"];
        patch?: never;
        trace?: never;
    };
    "/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listNotifications
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["listNotifications"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/notifications/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * readNotifications
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["readNotifications"];
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
         * getAppOperation
         * @description Current actor scoped durable status and permitted immutable receipt. Config result requires the current management actor with signed aal2.
         */
        get: operations["getAppOperation"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/plugins/{pluginId}/actions/{action}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * executePluginAction
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["executePluginAction"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/polls/{pollId}": {
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
         * patchPoll
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        patch: operations["patchPoll"];
        trace?: never;
    };
    "/polls/{pollId}/corrections": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * correctPoll
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["correctPoll"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/polls/{pollId}/end": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * endPoll
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["endPoll"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/polls/{pollId}/results": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getPollResults
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["getPollResults"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/polls/{pollId}/votes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * castPollVote
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["castPollVote"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/posts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * createPost
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["createPost"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/posts/{postId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getPost
         * @description Exact existing six-field DTO; followers/self may return to currently authorized actor. No expanded media/counters/future fields currently present.
         */
        get: operations["getPost"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * patchPost
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        patch: operations["patchPost"];
        trace?: never;
    };
    "/posts/{postId}/comments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listComments
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["listComments"];
        put?: never;
        /**
         * createComment
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["createComment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/posts/{postId}/reply-policy": {
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
         * patchReplyPolicy
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        patch: operations["patchReplyPolicy"];
        trace?: never;
    };
    "/posts/{postId}/reposts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * putPostRepost
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        put: operations["putPostRepost"];
        post?: never;
        /**
         * removePostRepost
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        delete: operations["removePostRepost"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/posts/{postId}/revisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listPostRevisions
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["listPostRevisions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/posts/{postId}/visibility": {
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
         * patchPostVisibility
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        patch: operations["patchPostVisibility"];
        trace?: never;
    };
    "/profiles/{accountId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getProfile
         * @description Read a current profile only when the viewer is authorized. An account without a saved profile returns unavailable rather than sample data.
         */
        get: operations["getProfile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/profiles/{accountId}/contents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listProfileContents
         * @description Deployed handler for approved posts and image posts (type=posts or type=media). Replies and reposts remain planned. Visibility, block and current authorization rules apply.
         */
        get: operations["listProfileContents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/profiles/{accountId}/relationships": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listProfileRelationships
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["listProfileRelationships"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/recovery-cases": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * createRecoveryCase
         * @description Authenticated owned account request; trusted/manual only. Receipt means received, not recovery completed.
         */
        post: operations["createRecoveryCase"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/recovery-cases/{caseId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getRecoveryCase
         * @description Current implementation.
         */
        get: operations["getRecoveryCase"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * createReport
         * @description Submit a report for an authorized current target. A durable receipt confirms intake, not a violation finding or sanction.
         */
        post: operations["createReport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/resources/{resourceId}/ai-use-policy": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getResourceAiUsePolicy
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["getResourceAiUsePolicy"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * patchResourceAiUsePolicy
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        patch: operations["patchResourceAiUsePolicy"];
        trace?: never;
    };
    "/resources/{resourceId}/deletion": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * deleteResource
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["deleteResource"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/resources/{resourceId}/interactions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * listInteractions
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["listInteractions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/resources/{resourceId}/likes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Current account like state and visible count
         * @description Reads current permission and reaction state for a visible resource. An old cursor or locally cached state does not grant access.
         */
        get: operations["getResourceLike"];
        /**
         * putResourceLike
         * @description Deployed handler sets a visible resource like for the authenticated account. Retry by querying the original operation ID after an uncertain result.
         */
        put: operations["putResourceLike"];
        post?: never;
        /**
         * removeResourceLike
         * @description Deployed handler removes a visible resource like for the authenticated account. Retry by querying the original operation ID after an uncertain result.
         */
        delete: operations["removeResourceLike"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/resources/{resourceId}/search-indexing": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getTargetIndexPolicy
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["getTargetIndexPolicy"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * patchTargetIndexPolicy
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        patch: operations["patchTargetIndexPolicy"];
        trace?: never;
    };
    "/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * searchCommunity
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["searchCommunity"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/search/suggestions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * suggestSearch
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["suggestSearch"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getServiceAvailability
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["getServiceAvailability"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/threads": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * createThread
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["createThread"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/threads/{threadId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * getThread
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        get: operations["getThread"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/threads/{threadId}/batches": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * appendThreadBatch
         * @description Planned product API; no deployed handler. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["appendThreadBatch"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/uploads": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * createUpload
         * @description Implemented bounded static image upload. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["createUpload"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/uploads/{uploadId}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * completeUpload
         * @description Implemented bounded static image upload. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        post: operations["completeUpload"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/uploads/{uploadId}/parts/{part}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * putUploadPart
         * @description Implemented bounded static image upload. DTO design for independent client/backend development. Current authorization and registered limits apply.
         */
        put: operations["putUploadPart"];
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
            action: "auth.register" | "session.revoke" | "auth.logout" | "recovery.request" | "config.release" | "config.rollback" | "post.create" | "comment.create" | "like.put" | "like.remove" | "block.put" | "block.remove" | "profile.update" | "report.create" | "appeal.create" | "moderation.revisions.decide" | "upload.create" | "upload.part" | "upload.complete";
            operation_id: components["schemas"]["Uuid"];
            result?: components["schemas"]["ConfigRelease"] | components["schemas"]["RevisionReceipt"] | components["schemas"]["ReactionReceipt"] | components["schemas"]["ActionReceipt"] | components["schemas"]["Profile"] | components["schemas"]["Report"] | components["schemas"]["Appeal"] | components["schemas"]["UploadSession"] | components["schemas"]["UploadedPart"];
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
            /** @enum {string} */
            publication_state: "awaiting_review" | "published" | "rejected";
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
    copyAiAnswer: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                answerId: components["schemas"]["Uuid"];
            };
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
                    "application/json": components["schemas"]["AiAnswerCopyEnvelope"];
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
    submitAiFeedback: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                answerId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AiFeedbackRequest"];
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
    listAiConversations: {
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
                    "application/json": components["schemas"]["AiConversationPageEnvelope"];
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
    createAiConversation: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AiConversationCreate"];
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
                    "application/json": components["schemas"]["AiConversationEnvelope"];
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
    getAiConversation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                conversationId: components["schemas"]["Uuid"];
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
                    "application/json": components["schemas"]["AiConversationDetailEnvelope"];
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
    deleteAiConversation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                conversationId: components["schemas"]["Uuid"];
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
    renameAiConversation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                conversationId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AiConversationPatch"];
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
                    "application/json": components["schemas"]["AiConversationEnvelope"];
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
    listAiModels: {
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
                    "application/json": components["schemas"]["AiModelsEnvelope"];
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
    createAiRequest: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AiRequestInput"];
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
                    "application/json": components["schemas"]["AiRequestEnvelope"];
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
    getAiRequest: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                requestId: components["schemas"]["Uuid"];
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
                    "application/json": components["schemas"]["AiRequestEnvelope"];
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
    retryAiRequest: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                requestId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OperationCommand"];
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
                    "application/json": components["schemas"]["AiRequestEnvelope"];
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
    stopAiRequest: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                requestId: components["schemas"]["Uuid"];
            };
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
                    "application/json": components["schemas"]["AiRequestEnvelope"];
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
    streamAiRequest: {
        parameters: {
            query?: never;
            header?: {
                "Last-Event-ID"?: string;
            };
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                requestId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description SSE data is AiStreamEvent; current dependency permission continuously rechecked. Heartbeat does not constitute useful output. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example id: 1
                     *     event: status
                     *     data: {"event_id":1,"request_id":"10000000-0000-4000-8000-000000000001","type":"status","state":"submitted"}
                     */
                    "text/event-stream": string;
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
    getAiUsage: {
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
                    "application/json": components["schemas"]["AiUsageEnvelope"];
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
    listOwnAppeals: {
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
    createAppeal: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AppealRequest"];
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
    createOtpChallenge: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OtpChallengeRequest"];
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
    devTestLogin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "username": "synthetic-dev-user",
                 *       "password": "FICTITIOUS_PASSWORD_FOR_SCHEMA_ONLY"
                 *     }
                 */
                "application/json": {
                    /** Format: password */
                    password: string;
                    username: string;
                };
            };
        };
        responses: {
            /** @description Real admitted development session */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthReceiptEnvelope"];
                };
            };
            /** @description Invalid credentials or ineligible account */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Unsupported method */
            405: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Invalid input */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Official Auth rate limit */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Development login disabled or outcome unconfirmed */
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
    logoutAppSession: {
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
    readOtpVerificationOperation: {
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
                "application/json": components["schemas"]["VerifyRequest"];
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
    refreshAppSession: {
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
    verifyOtpChallenge: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyRequest"];
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
    getClientCompatibility: {
        parameters: {
            query: {
                platform: "android" | "ios" | "web";
            };
            header: {
                /** @example fixture-v1 */
                "X-Client-Release": components["parameters"]["ClientRelease"];
            };
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
                    "application/json": components["schemas"]["ClientCompatibilityEnvelope"];
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
    deleteComment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                commentId: components["schemas"]["Uuid"];
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
    patchComment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                commentId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ContentPatch"];
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
    getEffectiveConfiguration: {
        parameters: {
            query?: {
                consumer?: "mobile" | "share";
            };
            header?: {
                /** @example fixture-v1 */
                "X-Client-Release"?: string;
            };
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
                    "application/json": components["schemas"]["EffectiveConfigurationEnvelope"];
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
    restoreResource: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                deletionId: components["schemas"]["Uuid"];
            };
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
                    "application/json": components["schemas"]["DeletionEnvelope"];
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
    listDeveloperPackages: {
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
                    "application/json": components["schemas"]["PluginPackagePageEnvelope"];
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
    submitPluginPackage: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PluginPackageSubmit"];
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
                    "application/json": components["schemas"]["PluginPackageEnvelope"];
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
    createDeveloperSandbox: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SandboxRequest"];
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
                    "application/json": components["schemas"]["SandboxEnvelope"];
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
    getSandboxEvidence: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                sandboxId: components["schemas"]["Uuid"];
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
    getDiscovery: {
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
                    "application/json": components["schemas"]["DiscoveryEnvelope"];
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
    listDmConversations: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                filter?: "all" | "unread";
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
                    "application/json": components["schemas"]["ConversationPageEnvelope"];
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
    hideConversationListing: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                conversationId: components["schemas"]["Uuid"];
            };
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
    listDmMessages: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                conversationId: components["schemas"]["Uuid"];
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
                    "application/json": components["schemas"]["MessagePageEnvelope"];
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
    recordConversationRead: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                conversationId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConversationReadRequest"];
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
    signalTyping: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                conversationId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TypingRequest"];
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
                    "application/json": components["schemas"]["TypingReceiptEnvelope"];
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
    getDmEligibility: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                recipientId: components["schemas"]["Uuid"];
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
                    "application/json": components["schemas"]["DmEligibilityEnvelope"];
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
    sendDmMessage: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SendMessage"];
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
                    "application/json": components["schemas"]["MessageEnvelope"];
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
    revokeOwnMessageAccess: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                messageId: components["schemas"]["Uuid"];
            };
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
    recordMessageDelivery: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                messageId: components["schemas"]["Uuid"];
            };
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
    listDmRequests: {
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
                    "application/json": components["schemas"]["DmRequestPageEnvelope"];
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
    createDmRequest: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateDmRequest"];
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
                    "application/json": components["schemas"]["DmRequestEnvelope"];
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
    actOnDmRequest: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                requestId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RequestAction"];
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
                    "application/json": components["schemas"]["DmRequestEnvelope"];
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
    getPublishedDocument: {
        parameters: {
            query?: {
                kind?: "community_rules" | "privacy" | "terms" | "processing_notice" | "help";
                locale?: string;
                surface?: "app" | "share";
            };
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                documentId: string;
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
                    "application/json": components["schemas"]["PublishedDocumentEnvelope"];
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
    getCurrentDocuments: {
        parameters: {
            query?: {
                kind?: "community_rules" | "privacy" | "terms" | "processing_notice" | "help";
                locale?: string;
                stable_key?: string;
                surface?: "app" | "share" | "admin";
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
                    "application/json": components["schemas"]["CurrentDocumentsEnvelope"];
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
    getProjectedEvents: {
        parameters: {
            query?: {
                after?: number;
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description WebSocket upgraded; frames ProjectedEvent. */
            101: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Success. Saving/acceptance does not imply publication or external delivery. */
            200: {
                headers: {
                    "Cache-Control": components["headers"]["CacheControl"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EventPageEnvelope"];
                    /**
                     * @example id: 1
                     *     event: changed
                     *     data: {"event_id":"10000000-0000-4000-8000-000000000001","type":"resource.changed","scope":"account","sequence":1}
                     */
                    "text/event-stream": string;
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
    listExtensions: {
        parameters: {
            query: {
                slot: string;
                version?: string;
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
                    "application/json": components["schemas"]["ExtensionsEnvelope"];
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
    listPersonalFeed: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path: {
                /** @example recommended */
                kind: "recommended" | "following";
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
                    "application/json": components["schemas"]["PostPageEnvelope"];
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
    listLatestPosts: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
            };
            header: {
                /** @example fixture-v1 */
                "X-Client-Release": components["parameters"]["ClientRelease"];
            };
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
                    "application/json": components["schemas"]["LatestPageEnvelope"];
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
    actOnFollowRequest: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                requestId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RequestAction"];
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
                    "application/json": components["schemas"]["FollowRequestEnvelope"];
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
    getAuthorAiUsePolicy: {
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
                    "application/json": components["schemas"]["AiUsePolicyEnvelope"];
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
    patchAuthorAiUsePolicy: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AiUsePolicyPatch"];
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
                    "application/json": components["schemas"]["AiUsePolicyEnvelope"];
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
    putBlock: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                accountId: components["schemas"]["Uuid"];
            };
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
    removeBlock: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                accountId: components["schemas"]["Uuid"];
            };
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
    listBookmarks: {
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
                    "application/json": components["schemas"]["BookmarkPageEnvelope"];
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
    getBookmark: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                postId: components["schemas"]["Uuid"];
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
                    "application/json": components["schemas"]["BookmarkEnvelope"];
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
    putBookmark: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                postId: components["schemas"]["Uuid"];
            };
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
                    "application/json": components["schemas"]["BookmarkEnvelope"];
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
    deleteBookmark: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                postId: components["schemas"]["Uuid"];
            };
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
    cancelAccount: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CancellationRequest"];
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
                    "application/json": components["schemas"]["CancellationReceiptEnvelope"];
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
    previewCancellation: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CancellationRequest"];
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
    listOwnedContents: {
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
    listDocumentReceipts: {
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
                    "application/json": components["schemas"]["DocumentReceiptPageEnvelope"];
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
    recordDocumentReceipt: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DocumentReceiptRequest"];
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
                    "application/json": components["schemas"]["DocumentReceiptEnvelope"];
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
    listDrafts: {
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
                    "application/json": components["schemas"]["DraftPageEnvelope"];
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
    createDraft: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DraftWrite"];
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
                    "application/json": components["schemas"]["DraftEnvelope"];
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
    getDraft: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                draftId: components["schemas"]["Uuid"];
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
                    "application/json": components["schemas"]["DraftEnvelope"];
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
    deleteDraft: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                draftId: components["schemas"]["Uuid"];
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
    patchDraft: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                draftId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DraftWrite"];
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
                    "application/json": components["schemas"]["DraftEnvelope"];
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
    listFollowRequests: {
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
                    "application/json": components["schemas"]["FollowRequestPageEnvelope"];
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
    removeFollower: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                accountId: components["schemas"]["Uuid"];
            };
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
                    "application/json": components["schemas"]["RelationshipEnvelope"];
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
    putFollow: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                accountId: components["schemas"]["Uuid"];
            };
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
                    "application/json": components["schemas"]["RelationshipEnvelope"];
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
    removeFollow: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                accountId: components["schemas"]["Uuid"];
            };
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
                    "application/json": components["schemas"]["RelationshipEnvelope"];
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
    getInterests: {
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
                    "application/json": components["schemas"]["InterestsEnvelope"];
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
    patchInterests: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InterestsPatch"];
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
                    "application/json": components["schemas"]["InterestsEnvelope"];
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
    listMutes: {
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
                    "application/json": components["schemas"]["MutePageEnvelope"];
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
    putMute: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MuteCommand"];
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
                    "application/json": components["schemas"]["MuteRuleEnvelope"];
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
    deleteMute: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MuteCommand"];
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
    changePhone: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PhoneChangeRequest"];
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
                    "application/json": components["schemas"]["PhoneChangeReceiptEnvelope"];
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
    previewPhoneChange: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PhoneChangeRequest"];
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
    getPreferences: {
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
                    "application/json": components["schemas"]["PreferencesEnvelope"];
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
    patchPreferences: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PreferencesPatch"];
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
                    "application/json": components["schemas"]["PreferencesEnvelope"];
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
    updateProfile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProfilePatch"];
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
                    "application/json": components["schemas"]["ProfileEnvelope"];
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
    registerPushDevice: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PushDeviceRegistration"];
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
                    "application/json": components["schemas"]["PushDeviceEnvelope"];
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
    revokePushDevice: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                deviceId: components["schemas"]["Uuid"];
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
    listRecentlyDeleted: {
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
                    "application/json": components["schemas"]["DeletionPageEnvelope"];
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
    listOwnReports: {
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
                    "application/json": components["schemas"]["ReportPageEnvelope"];
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
    listOwnSanctions: {
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
                    "application/json": components["schemas"]["SanctionPageEnvelope"];
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
    listSearchHistory: {
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
                    "application/json": components["schemas"]["SearchHistoryPageEnvelope"];
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
    clearSearchHistory: {
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
    getAuthorIndexPolicy: {
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
                    "application/json": components["schemas"]["AuthorIndexPolicyEnvelope"];
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
    patchAuthorIndexPolicy: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AuthorIndexPatch"];
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
                    "application/json": components["schemas"]["AuthorIndexPolicyEnvelope"];
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
    listDeviceSessions: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
            };
            header: {
                /** @example fixture-v1 */
                "X-Client-Release": components["parameters"]["ClientRelease"];
            };
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
                    "application/json": components["schemas"]["SessionPageEnvelope"];
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
    revokeDeviceSession: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                sessionId: components["schemas"]["Uuid"];
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
    getMediaBytes: {
        parameters: {
            query?: {
                variant?: string;
            };
            header?: {
                "If-None-Match"?: string;
                "If-Range"?: string;
                Range?: string;
            };
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                mediaId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Authorized bytes */
            200: {
                headers: {
                    "Accept-Ranges"?: "bytes";
                    "Cache-Control": components["headers"]["CacheControl"];
                    "Content-Length"?: number;
                    "Content-Range": components["headers"]["ContentRange"];
                    ETag: components["headers"]["ETag"];
                    [name: string]: unknown;
                };
                content: {
                    /** @example SYNTHETIC_MEDIA_BYTES */
                    "application/octet-stream": string;
                };
            };
            /** @description Authorized bytes */
            206: {
                headers: {
                    "Accept-Ranges"?: "bytes";
                    "Cache-Control": components["headers"]["CacheControl"];
                    "Content-Length"?: number;
                    "Content-Range": components["headers"]["ContentRange"];
                    ETag: components["headers"]["ETag"];
                    [name: string]: unknown;
                };
                content: {
                    /** @example SYNTHETIC_MEDIA_BYTES */
                    "application/octet-stream": string;
                };
            };
            /** @description Currently authorized ETag match, no body */
            304: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
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
            /** @description Unsatisfiable single byte range, no body */
            416: {
                headers: {
                    "Content-Range": components["headers"]["ContentRange"];
                    [name: string]: unknown;
                };
                content?: never;
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
    headMediaBytes: {
        parameters: {
            query?: {
                variant?: string;
            };
            header?: {
                "If-None-Match"?: string;
                "If-Range"?: string;
                Range?: string;
            };
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                mediaId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Authorized metadata, no body */
            200: {
                headers: {
                    "Accept-Ranges"?: "bytes";
                    "Cache-Control": components["headers"]["CacheControl"];
                    "Content-Length"?: number;
                    "Content-Range": components["headers"]["ContentRange"];
                    ETag: components["headers"]["ETag"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Authorized metadata, no body */
            206: {
                headers: {
                    "Accept-Ranges"?: "bytes";
                    "Cache-Control": components["headers"]["CacheControl"];
                    "Content-Length"?: number;
                    "Content-Range": components["headers"]["ContentRange"];
                    ETag: components["headers"]["ETag"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Currently authorized ETag match, no body */
            304: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
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
            /** @description Unsatisfiable single byte range, no body */
            416: {
                headers: {
                    "Content-Range": components["headers"]["ContentRange"];
                    [name: string]: unknown;
                };
                content?: never;
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
    listNotifications: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                kind?: string;
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
                    "application/json": components["schemas"]["NotificationPageEnvelope"];
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
    readNotifications: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReadNotifications"];
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
    getAppOperation: {
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
    executePluginAction: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example create_record */
                action: string;
                /** @example sample-a */
                pluginId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PluginActionRequest"];
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
                    "application/json": components["schemas"]["PluginActionReceiptEnvelope"];
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
    patchPoll: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                pollId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PollPatch"];
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
                    "application/json": components["schemas"]["PollEnvelope"];
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
    correctPoll: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                pollId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PollCorrectionRequest"];
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
                    "application/json": components["schemas"]["PollEnvelope"];
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
    endPoll: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                pollId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReasonCommand"];
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
                    "application/json": components["schemas"]["PollEnvelope"];
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
    getPollResults: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                pollId: components["schemas"]["Uuid"];
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
                    "application/json": components["schemas"]["PollResultsEnvelope"];
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
    castPollVote: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                pollId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PollVote"];
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
    createPost: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreatePostRequest"];
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
    getPost: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                postId: components["schemas"]["Uuid"];
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
                    "application/json": components["schemas"]["ReadPostEnvelope"];
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
    patchPost: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                postId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ContentPatch"];
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
    listComments: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
                sort?: "latest" | "hot";
            };
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                postId: components["schemas"]["Uuid"];
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
                    "application/json": components["schemas"]["CommentPageEnvelope"];
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
    createComment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                postId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommentCreate"];
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
    patchReplyPolicy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                postId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReplyPolicyPatch"];
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
    putPostRepost: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                postId: components["schemas"]["Uuid"];
            };
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
                    "application/json": components["schemas"]["ReactionReceiptEnvelope"];
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
    removePostRepost: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                postId: components["schemas"]["Uuid"];
            };
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
                    "application/json": components["schemas"]["ReactionReceiptEnvelope"];
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
    listPostRevisions: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                postId: components["schemas"]["Uuid"];
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
    patchPostVisibility: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                postId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VisibilityPatch"];
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
    getProfile: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                accountId: components["schemas"]["Uuid"];
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
                    "application/json": components["schemas"]["ProfileEnvelope"];
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
    listProfileContents: {
        parameters: {
            query?: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
                type?: "posts" | "replies" | "reposts" | "media";
            };
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                accountId: components["schemas"]["Uuid"];
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
                    "application/json": components["schemas"]["PostPageEnvelope"];
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
    listProfileRelationships: {
        parameters: {
            query: {
                cursor?: components["parameters"]["Cursor"];
                kind: "followers" | "following";
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                accountId: components["schemas"]["Uuid"];
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
                    "application/json": components["schemas"]["RelationshipPageEnvelope"];
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
    createRecoveryCase: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RecoveryRequest"];
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
                    "application/json": components["schemas"]["RecoveryCaseEnvelope"];
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
    getRecoveryCase: {
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
                    "application/json": components["schemas"]["RecoveryCaseEnvelope"];
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
    createReport: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReportRequest"];
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
                    "application/json": components["schemas"]["ReportEnvelope"];
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
    getResourceAiUsePolicy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                resourceId: components["schemas"]["Uuid"];
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
                    "application/json": components["schemas"]["AiUsePolicyEnvelope"];
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
    patchResourceAiUsePolicy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                resourceId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AiUsePolicyPatch"];
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
                    "application/json": components["schemas"]["AiUsePolicyEnvelope"];
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
    deleteResource: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                resourceId: components["schemas"]["Uuid"];
            };
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
                    "application/json": components["schemas"]["DeletionEnvelope"];
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
    listInteractions: {
        parameters: {
            query: {
                cursor?: components["parameters"]["Cursor"];
                kind: "like" | "repost";
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                resourceId: components["schemas"]["Uuid"];
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
                    "application/json": components["schemas"]["InteractionResultsEnvelope"];
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
    getResourceLike: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                resourceId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current visible like state */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReactionReceiptEnvelope"];
                };
            };
            /** @description Current session invalid */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Resource unavailable or not visible */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description Current permission or output unavailable */
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
    putResourceLike: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                resourceId: components["schemas"]["Uuid"];
            };
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
                    "application/json": components["schemas"]["ReactionReceiptEnvelope"];
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
    removeResourceLike: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                resourceId: components["schemas"]["Uuid"];
            };
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
                    "application/json": components["schemas"]["ReactionReceiptEnvelope"];
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
    getTargetIndexPolicy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                resourceId: components["schemas"]["Uuid"];
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
                    "application/json": components["schemas"]["TargetIndexPolicyEnvelope"];
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
    patchTargetIndexPolicy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                resourceId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TargetIndexPatch"];
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
                    "application/json": components["schemas"]["TargetIndexPolicyEnvelope"];
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
    searchCommunity: {
        parameters: {
            query: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
                q: string;
                show_muted?: boolean;
                time?: "all" | "day" | "week" | "month" | "year";
                type?: "posts" | "accounts" | "topics";
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
                    "application/json": components["schemas"]["SearchPageEnvelope"];
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
    suggestSearch: {
        parameters: {
            query: {
                cursor?: components["parameters"]["Cursor"];
                limit?: components["parameters"]["Limit"];
                q: string;
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
                    "application/json": components["schemas"]["SuggestionPageEnvelope"];
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
    getServiceAvailability: {
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
                    "application/json": components["schemas"]["ServiceAvailabilityEnvelope"];
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
    createThread: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ThreadCreate"];
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
                    "application/json": components["schemas"]["PublicationBatchEnvelope"];
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
    getThread: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                threadId: components["schemas"]["Uuid"];
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
                    "application/json": components["schemas"]["ThreadEnvelope"];
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
    appendThreadBatch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                threadId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ThreadBatch"];
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
                    "application/json": components["schemas"]["PublicationBatchEnvelope"];
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
    createUpload: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UploadRequest"];
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
                    "application/json": components["schemas"]["UploadSessionEnvelope"];
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
    completeUpload: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @example 10000000-0000-4000-8000-000000000001 */
                uploadId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UploadComplete"];
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
                    "application/json": components["schemas"]["UploadSessionEnvelope"];
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
    putUploadPart: {
        parameters: {
            query?: never;
            header: {
                /** @description Operation UUID for idempotent binary part command. */
                "X-Operation-Id": components["schemas"]["Uuid"];
            };
            path: {
                /** @example 0 */
                part: number;
                /** @example 10000000-0000-4000-8000-000000000001 */
                uploadId: components["schemas"]["Uuid"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/octet-stream": string;
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
                    "application/json": components["schemas"]["UploadedPartEnvelope"];
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
}
