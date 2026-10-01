// Generated from openapi.json by npm run api:types. Don't edit it by hand.

export interface paths {
    "/api/admin/settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["StoreSettingsResponse"];
                        "application/json": components["schemas"]["StoreSettingsResponse"];
                        "text/json": components["schemas"]["StoreSettingsResponse"];
                    };
                };
            };
        };
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["UpdateStoreSettingsRequest"];
                    "text/json": components["schemas"]["UpdateStoreSettingsRequest"];
                    "application/*+json": components["schemas"]["UpdateStoreSettingsRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["StoreSettingsResponse"];
                        "application/json": components["schemas"]["StoreSettingsResponse"];
                        "text/json": components["schemas"]["StoreSettingsResponse"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/store": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["PublicStoreSettingsResponse"];
                        "application/json": components["schemas"]["PublicStoreSettingsResponse"];
                        "text/json": components["schemas"]["PublicStoreSettingsResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/orders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    search?: string;
                    status?: components["schemas"]["OrderStatus"];
                    customerId?: number;
                    sort?: components["schemas"]["AdminOrderSort"];
                    page?: number;
                    pageSize?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["PagedOfAdminOrderSummaryResponse"];
                        "application/json": components["schemas"]["PagedOfAdminOrderSummaryResponse"];
                        "text/json": components["schemas"]["PagedOfAdminOrderSummaryResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/orders/{orderNumber}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    orderNumber: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AdminOrderResponse"];
                        "application/json": components["schemas"]["AdminOrderResponse"];
                        "text/json": components["schemas"]["AdminOrderResponse"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    orderNumber: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["UpdateOrderRequest"];
                    "text/json": components["schemas"]["UpdateOrderRequest"];
                    "application/*+json": components["schemas"]["UpdateOrderRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AdminOrderResponse"];
                        "application/json": components["schemas"]["AdminOrderResponse"];
                        "text/json": components["schemas"]["AdminOrderResponse"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/orders/bulk-status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["BulkOrderStatusRequest"];
                    "text/json": components["schemas"]["BulkOrderStatusRequest"];
                    "application/*+json": components["schemas"]["BulkOrderStatusRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["BulkResultOfstring"];
                        "application/json": components["schemas"]["BulkResultOfstring"];
                        "text/json": components["schemas"]["BulkResultOfstring"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/account/orders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    page?: number;
                    pageSize?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["PagedOfOrderSummaryResponse"];
                        "application/json": components["schemas"]["PagedOfOrderSummaryResponse"];
                        "text/json": components["schemas"]["PagedOfOrderSummaryResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/account/orders/{orderNumber}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    orderNumber: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["OrderResponse"];
                        "application/json": components["schemas"]["OrderResponse"];
                        "text/json": components["schemas"]["OrderResponse"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/newsletter/subscribers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    search?: string;
                    page?: number;
                    pageSize?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["PagedOfSubscriberResponse"];
                        "application/json": components["schemas"]["PagedOfSubscriberResponse"];
                        "text/json": components["schemas"]["PagedOfSubscriberResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/newsletter/subscribers/remove": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["RemoveSubscribersRequest"];
                    "text/json": components["schemas"]["RemoveSubscribersRequest"];
                    "application/*+json": components["schemas"]["RemoveSubscribersRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["RemovedSubscribersResponse"];
                        "application/json": components["schemas"]["RemovedSubscribersResponse"];
                        "text/json": components["schemas"]["RemovedSubscribersResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/newsletter/send": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["NewsletterRequest"];
                    "text/json": components["schemas"]["NewsletterRequest"];
                    "application/*+json": components["schemas"]["NewsletterRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["NewsletterQueuedResponse"];
                        "application/json": components["schemas"]["NewsletterQueuedResponse"];
                        "text/json": components["schemas"]["NewsletterQueuedResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/newsletter/send-test": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["NewsletterRequest"];
                    "text/json": components["schemas"]["NewsletterRequest"];
                    "application/*+json": components["schemas"]["NewsletterRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["NewsletterQueuedResponse"];
                        "application/json": components["schemas"]["NewsletterQueuedResponse"];
                        "text/json": components["schemas"]["NewsletterQueuedResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/newsletter": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["SubscribeRequest"];
                    "text/json": components["schemas"]["SubscribeRequest"];
                    "application/*+json": components["schemas"]["SubscribeRequest"];
                };
            };
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/newsletter/unsubscribe/{token}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    token: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/images": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "multipart/form-data": {
                        file?: components["schemas"]["IFormFile"];
                    };
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["UploadedImageResponse"];
                        "application/json": components["schemas"]["UploadedImageResponse"];
                        "text/json": components["schemas"]["UploadedImageResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/images/{key}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    key: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/dashboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    days?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["DashboardResponse"];
                        "application/json": components["schemas"]["DashboardResponse"];
                        "text/json": components["schemas"]["DashboardResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/customers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    search?: string;
                    role?: components["schemas"]["AccountRole"];
                    sort?: components["schemas"]["AdminCustomerSort"];
                    page?: number;
                    pageSize?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["PagedOfAdminCustomerSummaryResponse"];
                        "application/json": components["schemas"]["PagedOfAdminCustomerSummaryResponse"];
                        "text/json": components["schemas"]["PagedOfAdminCustomerSummaryResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/customers/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AdminCustomerResponse"];
                        "application/json": components["schemas"]["AdminCustomerResponse"];
                        "text/json": components["schemas"]["AdminCustomerResponse"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/customers/{id}/disable": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AdminCustomerResponse"];
                        "application/json": components["schemas"]["AdminCustomerResponse"];
                        "text/json": components["schemas"]["AdminCustomerResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/customers/{id}/enable": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AdminCustomerResponse"];
                        "application/json": components["schemas"]["AdminCustomerResponse"];
                        "text/json": components["schemas"]["AdminCustomerResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/contact": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ContactRequest"];
                    "text/json": components["schemas"]["ContactRequest"];
                    "application/*+json": components["schemas"]["ContactRequest"];
                };
            };
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/checkout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["StartCheckoutRequest"];
                    "text/json": components["schemas"]["StartCheckoutRequest"];
                    "application/*+json": components["schemas"]["StartCheckoutRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CheckoutResponse"];
                        "application/json": components["schemas"]["CheckoutResponse"];
                        "text/json": components["schemas"]["CheckoutResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/checkout/result": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query: {
                    paymentIntentId: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CheckoutResultResponse"];
                        "application/json": components["schemas"]["CheckoutResultResponse"];
                        "text/json": components["schemas"]["CheckoutResultResponse"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stripe/webhook": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AdminCategoryResponse"][];
                        "application/json": components["schemas"]["AdminCategoryResponse"][];
                        "text/json": components["schemas"]["AdminCategoryResponse"][];
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["CategoryRequest"];
                    "text/json": components["schemas"]["CategoryRequest"];
                    "application/*+json": components["schemas"]["CategoryRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AdminCategoryResponse"];
                        "application/json": components["schemas"]["AdminCategoryResponse"];
                        "text/json": components["schemas"]["AdminCategoryResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/categories/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AdminCategoryResponse"];
                        "application/json": components["schemas"]["AdminCategoryResponse"];
                        "text/json": components["schemas"]["AdminCategoryResponse"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["CategoryRequest"];
                    "text/json": components["schemas"]["CategoryRequest"];
                    "application/*+json": components["schemas"]["CategoryRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AdminCategoryResponse"];
                        "application/json": components["schemas"]["AdminCategoryResponse"];
                        "text/json": components["schemas"]["AdminCategoryResponse"];
                    };
                };
            };
        };
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/products": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    search?: string;
                    status?: components["schemas"]["ProductStatus"];
                    categoryId?: number;
                    stock?: components["schemas"]["StockLevel"];
                    onDeal?: boolean;
                    sort?: components["schemas"]["AdminProductSort"];
                    page?: number;
                    pageSize?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["PagedOfAdminProductResponse"];
                        "application/json": components["schemas"]["PagedOfAdminProductResponse"];
                        "text/json": components["schemas"]["PagedOfAdminProductResponse"];
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ProductRequest"];
                    "text/json": components["schemas"]["ProductRequest"];
                    "application/*+json": components["schemas"]["ProductRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AdminProductResponse"];
                        "application/json": components["schemas"]["AdminProductResponse"];
                        "text/json": components["schemas"]["AdminProductResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/products/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AdminProductResponse"];
                        "application/json": components["schemas"]["AdminProductResponse"];
                        "text/json": components["schemas"]["AdminProductResponse"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["UpdateProductRequest"];
                    "text/json": components["schemas"]["UpdateProductRequest"];
                    "application/*+json": components["schemas"]["UpdateProductRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AdminProductResponse"];
                        "application/json": components["schemas"]["AdminProductResponse"];
                        "text/json": components["schemas"]["AdminProductResponse"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/products/{id}/deal": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["DealRequest"];
                    "text/json": components["schemas"]["DealRequest"];
                    "application/*+json": components["schemas"]["DealRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AdminProductResponse"];
                        "application/json": components["schemas"]["AdminProductResponse"];
                        "text/json": components["schemas"]["AdminProductResponse"];
                    };
                };
            };
        };
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AdminProductResponse"];
                        "application/json": components["schemas"]["AdminProductResponse"];
                        "text/json": components["schemas"]["AdminProductResponse"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/products/{id}/archive": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AdminProductResponse"];
                        "application/json": components["schemas"]["AdminProductResponse"];
                        "text/json": components["schemas"]["AdminProductResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/products/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AdminProductResponse"];
                        "application/json": components["schemas"]["AdminProductResponse"];
                        "text/json": components["schemas"]["AdminProductResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/products/bulk": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ProductBulkRequest"];
                    "text/json": components["schemas"]["ProductBulkRequest"];
                    "application/*+json": components["schemas"]["ProductBulkRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["BulkResultOfint"];
                        "application/json": components["schemas"]["BulkResultOfint"];
                        "text/json": components["schemas"]["BulkResultOfint"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CategoryResponse"][];
                        "application/json": components["schemas"]["CategoryResponse"][];
                        "text/json": components["schemas"]["CategoryResponse"][];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/products": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    categoryId?: number[];
                    search?: string;
                    onDeal?: boolean;
                    inStock?: boolean;
                    minPriceCents?: number;
                    maxPriceCents?: number;
                    sort?: components["schemas"]["ProductSort"];
                    page?: number;
                    pageSize?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["PagedOfProductResponse"];
                        "application/json": components["schemas"]["PagedOfProductResponse"];
                        "text/json": components["schemas"]["PagedOfProductResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/products/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProductResponse"];
                        "application/json": components["schemas"]["ProductResponse"];
                        "text/json": components["schemas"]["ProductResponse"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/products/{id}/related": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    limit?: number;
                };
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProductResponse"][];
                        "application/json": components["schemas"]["ProductResponse"][];
                        "text/json": components["schemas"]["ProductResponse"][];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cart": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CartResponse"];
                        "application/json": components["schemas"]["CartResponse"];
                        "text/json": components["schemas"]["CartResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cart/items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["AddToCartRequest"];
                    "text/json": components["schemas"]["AddToCartRequest"];
                    "application/*+json": components["schemas"]["AddToCartRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CartResponse"];
                        "application/json": components["schemas"]["CartResponse"];
                        "text/json": components["schemas"]["CartResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cart/items/{productId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    productId: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["SetQuantityRequest"];
                    "text/json": components["schemas"]["SetQuantityRequest"];
                    "application/*+json": components["schemas"]["SetQuantityRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CartResponse"];
                        "application/json": components["schemas"]["CartResponse"];
                        "text/json": components["schemas"]["CartResponse"];
                    };
                };
            };
        };
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    productId: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CartResponse"];
                        "application/json": components["schemas"]["CartResponse"];
                        "text/json": components["schemas"]["CartResponse"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cart/merge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["CartLinesRequest"];
                    "text/json": components["schemas"]["CartLinesRequest"];
                    "application/*+json": components["schemas"]["CartLinesRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CartResponse"];
                        "application/json": components["schemas"]["CartResponse"];
                        "text/json": components["schemas"]["CartResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cart/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["CartLinesRequest"];
                    "text/json": components["schemas"]["CartLinesRequest"];
                    "application/*+json": components["schemas"]["CartLinesRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CartResponse"];
                        "application/json": components["schemas"]["CartResponse"];
                        "text/json": components["schemas"]["CartResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["RegisterRequest"];
                    "text/json": components["schemas"]["RegisterRequest"];
                    "application/*+json": components["schemas"]["RegisterRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CurrentUserResponse"];
                        "application/json": components["schemas"]["CurrentUserResponse"];
                        "text/json": components["schemas"]["CurrentUserResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["LoginRequest"];
                    "text/json": components["schemas"]["LoginRequest"];
                    "application/*+json": components["schemas"]["LoginRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CurrentUserResponse"];
                        "application/json": components["schemas"]["CurrentUserResponse"];
                        "text/json": components["schemas"]["CurrentUserResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["CurrentUserResponse"];
                        "application/json": components["schemas"]["CurrentUserResponse"];
                        "text/json": components["schemas"]["CurrentUserResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/change-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ChangePasswordRequest"];
                    "text/json": components["schemas"]["ChangePasswordRequest"];
                    "application/*+json": components["schemas"]["ChangePasswordRequest"];
                };
            };
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/forgot-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ForgotPasswordRequest"];
                    "text/json": components["schemas"]["ForgotPasswordRequest"];
                    "application/*+json": components["schemas"]["ForgotPasswordRequest"];
                };
            };
            responses: {
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ResetPasswordRequest"];
                    "text/json": components["schemas"]["ResetPasswordRequest"];
                    "application/*+json": components["schemas"]["ResetPasswordRequest"];
                };
            };
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/activity": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    entityType?: components["schemas"]["ActivityEntity"];
                    entityId?: number;
                    page?: number;
                    pageSize?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["PagedOfActivityEntryResponse"];
                        "application/json": components["schemas"]["PagedOfActivityEntryResponse"];
                        "text/json": components["schemas"]["PagedOfActivityEntryResponse"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/account/addresses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AddressResponse"][];
                        "application/json": components["schemas"]["AddressResponse"][];
                        "text/json": components["schemas"]["AddressResponse"][];
                    };
                };
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["NewAddressRequest"];
                    "text/json": components["schemas"]["NewAddressRequest"];
                    "application/*+json": components["schemas"]["NewAddressRequest"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AddressResponse"];
                        "application/json": components["schemas"]["AddressResponse"];
                        "text/json": components["schemas"]["AddressResponse"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/account/addresses/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AddressResponse"];
                        "application/json": components["schemas"]["AddressResponse"];
                        "text/json": components["schemas"]["AddressResponse"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["AddressRequest"];
                    "text/json": components["schemas"]["AddressRequest"];
                    "application/*+json": components["schemas"]["AddressRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AddressResponse"];
                        "application/json": components["schemas"]["AddressResponse"];
                        "text/json": components["schemas"]["AddressResponse"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/account/addresses/{id}/default": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: number;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["AddressResponse"][];
                        "application/json": components["schemas"]["AddressResponse"][];
                        "text/json": components["schemas"]["AddressResponse"][];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/plain": components["schemas"]["ProblemDetails"];
                        "application/json": components["schemas"]["ProblemDetails"];
                        "text/json": components["schemas"]["ProblemDetails"];
                    };
                };
            };
        };
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
        /** @enum {unknown} */
        AccountRole: "customer" | "admin" | null;
        /** @enum {unknown} */
        ActivityAction: "user_registered" | "customer_disabled" | "customer_enabled" | "admin_role_granted" | "admin_role_removed" | "newsletter_subscribed" | "newsletter_unsubscribed" | "subscribers_removed" | "newsletter_sent" | "order_created" | "order_status_changed" | "product_created" | "product_updated" | "product_archived" | "product_restored" | "deal_started" | "deal_ended" | "category_created" | "category_updated" | "category_deleted" | "settings_changed";
        /** @enum {unknown} */
        ActivityEntity: "user" | "order" | "product" | "category" | "store_settings" | "newsletter_subscriber" | null;
        ActivityEntryResponse: {
            /** Format: int32 */
            id: number;
            /** Format: date-time */
            occurredAtUtc: string;
            action: components["schemas"]["ActivityAction"];
            entityType: null | components["schemas"]["ActivityEntity"];
            /** Format: int32 */
            entityId: null | number;
            actor: null | string;
            details: null | components["schemas"]["JsonElement"];
        };
        AddressRequest: {
            recipientName: string;
            line1: string;
            line2?: null | string;
            city: string;
            state?: null | string;
            postalCode?: null | string;
            countryCode: string;
        };
        AddressResponse: {
            /** Format: int32 */
            id: number;
            recipientName: string;
            line1: string;
            line2: null | string;
            city: string;
            state: null | string;
            postalCode: null | string;
            countryCode: string;
            isDefault: boolean;
        };
        AddToCartRequest: {
            /** Format: int32 */
            productId: number;
            /** Format: int32 */
            quantity?: number;
        };
        AdminCategoryResponse: {
            /** Format: int32 */
            id: number;
            name: string;
            imageKey: string;
            imageUrl: string;
            /** Format: int32 */
            productCount: number;
            canDelete: boolean;
        };
        AdminCustomerResponse: {
            /** Format: int32 */
            id: number;
            username: string;
            email: string;
            /** Format: date-time */
            joinedAtUtc: string;
            isAdmin: boolean;
            isDisabled: boolean;
            /** Format: int32 */
            orderCount: number;
            /** Format: int32 */
            spentCents: number;
            addresses: components["schemas"]["AddressResponse"][];
            recentOrders: components["schemas"]["AdminOrderSummaryResponse"][];
        };
        /** @enum {unknown} */
        AdminCustomerSort: "joined" | "joined_desc" | "username" | "username_desc";
        AdminCustomerSummaryResponse: {
            /** Format: int32 */
            id: number;
            username: string;
            email: string;
            /** Format: date-time */
            joinedAtUtc: string;
            isAdmin: boolean;
            isDisabled: boolean;
            /** Format: int32 */
            orderCount: number;
        };
        AdminOrderResponse: {
            orderNumber: string;
            status: components["schemas"]["OrderStatus"];
            nextStatuses: components["schemas"]["OrderStatus"][];
            /** Format: date-time */
            placedAtUtc: string;
            /** Format: int32 */
            customerId: number;
            customerName: string;
            customerEmail: string;
            lines: components["schemas"]["OrderLineResponse"][];
            /** Format: int32 */
            subtotalCents: number;
            /** Format: int32 */
            shippingCents: number;
            /** Format: int32 */
            taxCents: number;
            /** Format: int32 */
            totalCents: number;
            shipTo: components["schemas"]["PostalAddress"];
            carrier: null | components["schemas"]["Carrier"];
            trackingNumber: null | string;
            trackingUrl: null | string;
            /** Format: date */
            estimatedDeliveryDate: null | string;
            timeline: components["schemas"]["AdminOrderStepResponse"][];
            stripePaymentIntentId: string;
            /** Format: byte */
            rowVersion: string;
        };
        /** @enum {unknown} */
        AdminOrderSort: "placed" | "placed_desc" | "total" | "total_desc";
        AdminOrderStepResponse: {
            status: components["schemas"]["OrderStatus"];
            /** Format: date-time */
            changedAtUtc: string;
            note: null | string;
            changedBy: null | string;
        };
        AdminOrderSummaryResponse: {
            orderNumber: string;
            status: components["schemas"]["OrderStatus"];
            nextStatuses: components["schemas"]["OrderStatus"][];
            /** Format: date-time */
            placedAtUtc: string;
            customerName: string;
            customerEmail: string;
            /** Format: int32 */
            itemCount: number;
            /** Format: int32 */
            totalCents: number;
        };
        AdminProductResponse: {
            /** Format: int32 */
            id: number;
            name: string;
            description: string;
            /** Format: int32 */
            categoryId: number;
            categoryName: string;
            /** Format: int32 */
            priceCents: number;
            /** Format: int32 */
            compareAtPriceCents: null | number;
            dealDescription: null | string;
            /** Format: int32 */
            stock: number;
            imageKey: string;
            imageUrl: string;
            /** Format: date-time */
            createdAtUtc: string;
            /** Format: date-time */
            updatedAtUtc: string;
            /** Format: date-time */
            archivedAtUtc: null | string;
            /** Format: byte */
            rowVersion: string;
        };
        /** @enum {unknown} */
        AdminProductSort: "name" | "name_desc" | "price" | "price_desc" | "stock" | "stock_desc" | "created" | "created_desc";
        BulkFailureOfint: {
            /** Format: int32 */
            id: number;
            code: string;
            message: string;
        };
        BulkFailureOfstring: {
            id: null | string;
            code: string;
            message: string;
        };
        BulkOrderStatusRequest: {
            orderNumbers: string[];
            status: components["schemas"]["OrderStatus"];
            emailCustomer?: null | boolean;
            confirmRefund?: boolean;
        };
        BulkResultOfint: {
            succeeded: number[];
            failed: components["schemas"]["BulkFailureOfint"][];
        };
        BulkResultOfstring: {
            succeeded: string[];
            failed: components["schemas"]["BulkFailureOfstring"][];
        };
        /** @enum {unknown} */
        Carrier: "ups" | "usps" | "fedex" | "dhl" | "other" | null;
        /** @enum {unknown} */
        CartLineIssue: "unavailable" | "out_of_stock" | "not_enough_stock" | null;
        CartLineRequest: {
            /** Format: int32 */
            productId: number;
            /** Format: int32 */
            quantity: number;
        };
        CartLineResponse: {
            /** Format: int32 */
            productId: number;
            name: string;
            /** Format: int32 */
            priceCents: number;
            /** Format: int32 */
            compareAtPriceCents: null | number;
            imageUrl: string;
            /** Format: int32 */
            quantity: number;
            /** Format: int32 */
            stock: number;
            /** Format: int32 */
            lineTotalCents: number;
            issue: null | components["schemas"]["CartLineIssue"];
        };
        CartLinesRequest: {
            items: components["schemas"]["CartLineRequest"][];
        };
        CartResponse: {
            lines: components["schemas"]["CartLineResponse"][];
            /** Format: int32 */
            itemCount: number;
            /** Format: int32 */
            subtotalCents: number;
            canCheckout: boolean;
        };
        CategoryRequest: {
            name: string;
            imageKey: string;
        };
        CategoryResponse: {
            /** Format: int32 */
            id: number;
            name: string;
            imageUrl: string;
        };
        ChangePasswordRequest: {
            currentPassword: string;
            newPassword: string;
        };
        CheckoutLineResponse: {
            /** Format: int32 */
            productId: number;
            name: string;
            /** Format: int32 */
            unitPriceCents: number;
            /** Format: int32 */
            quantity: number;
            /** Format: int32 */
            lineTotalCents: number;
            imageUrl: string;
        };
        CheckoutResponse: {
            /** Format: int32 */
            checkoutId: number;
            clientSecret: string;
            lines: components["schemas"]["CheckoutLineResponse"][];
            shipTo: components["schemas"]["PostalAddress"];
            /** Format: int32 */
            subtotalCents: number;
            /** Format: int32 */
            shippingCents: number;
            /** Format: int32 */
            taxCents: number;
            /** Format: int32 */
            totalCents: number;
        };
        CheckoutResultResponse: {
            result: components["schemas"]["PaymentResult"];
            orderNumber: null | string;
        };
        Comparison: {
            /** Format: int32 */
            value: number;
            /** Format: int32 */
            previous: number;
        };
        ContactRequest: {
            name: string;
            email: string;
            subject: string;
            message: string;
        };
        CurrentUserResponse: {
            /** Format: int32 */
            id: number;
            username: string;
            email: string;
            isAdmin: boolean;
        };
        DailyRevenue: {
            /** Format: date */
            date: string;
            /** Format: int32 */
            revenueCents: number;
            /** Format: int32 */
            orders: number;
        };
        DashboardKpis: {
            revenueCents: components["schemas"]["Comparison"];
            orders: components["schemas"]["Comparison"];
            averageOrderCents: components["schemas"]["Comparison"];
            newCustomers: components["schemas"]["Comparison"];
            /** Format: int32 */
            toShip: number;
            /** Format: int32 */
            lowStock: number;
        };
        DashboardResponse: {
            /** Format: date */
            first: string;
            /** Format: date */
            last: string;
            timeZoneId: string;
            kpis: components["schemas"]["DashboardKpis"];
            revenueByDay: components["schemas"]["DailyRevenue"][];
            ordersByStatus: components["schemas"]["StatusCount"][];
            topProducts: components["schemas"]["TopProduct"][];
            lowStockProducts: components["schemas"]["LowStockProduct"][];
        };
        DealRequest: {
            /** Format: int32 */
            dealPriceCents: number;
            description?: null | string;
        };
        ForgotPasswordRequest: {
            email: string;
        };
        /** Format: binary */
        IFormFile: string;
        JsonElement: unknown;
        LoginRequest: {
            email: string;
            password: string;
        };
        LowStockProduct: {
            /** Format: int32 */
            productId: number;
            name: string;
            /** Format: int32 */
            stock: number;
        };
        NewAddressRequest: {
            isDefault?: boolean;
            recipientName: string;
            line1: string;
            line2?: null | string;
            city: string;
            state?: null | string;
            postalCode?: null | string;
            countryCode: string;
        };
        NewsletterQueuedResponse: {
            /** Format: int32 */
            recipients: number;
        };
        NewsletterRequest: {
            subject: string;
            body: string;
        };
        OrderLineResponse: {
            /** Format: int32 */
            productId: number;
            name: string;
            /** Format: int32 */
            unitPriceCents: number;
            /** Format: int32 */
            quantity: number;
            /** Format: int32 */
            lineTotalCents: number;
            imageUrl: string;
        };
        OrderResponse: {
            orderNumber: string;
            status: components["schemas"]["OrderStatus"];
            /** Format: date-time */
            placedAtUtc: string;
            lines: components["schemas"]["OrderLineResponse"][];
            /** Format: int32 */
            subtotalCents: number;
            /** Format: int32 */
            shippingCents: number;
            /** Format: int32 */
            taxCents: number;
            /** Format: int32 */
            totalCents: number;
            shipTo: components["schemas"]["PostalAddress"];
            carrier: null | components["schemas"]["Carrier"];
            trackingNumber: null | string;
            trackingUrl: null | string;
            /** Format: date */
            estimatedDeliveryDate: null | string;
            timeline: components["schemas"]["OrderStepResponse"][];
        };
        /** @enum {unknown} */
        OrderStatus: "pending" | "shipped" | "delivered" | "cancelled" | "refunded";
        OrderStepResponse: {
            status: components["schemas"]["OrderStatus"];
            /** Format: date-time */
            changedAtUtc: string;
            note: null | string;
        };
        OrderSummaryResponse: {
            orderNumber: string;
            status: components["schemas"]["OrderStatus"];
            /** Format: date-time */
            placedAtUtc: string;
            /** Format: int32 */
            itemCount: number;
            /** Format: int32 */
            totalCents: number;
            imageUrl: null | string;
        };
        PagedOfActivityEntryResponse: {
            items: components["schemas"]["ActivityEntryResponse"][];
            /** Format: int32 */
            page: number;
            /** Format: int32 */
            pageSize: number;
            /** Format: int32 */
            totalCount: number;
            /** Format: int32 */
            totalPages: number;
        };
        PagedOfAdminCustomerSummaryResponse: {
            items: components["schemas"]["AdminCustomerSummaryResponse"][];
            /** Format: int32 */
            page: number;
            /** Format: int32 */
            pageSize: number;
            /** Format: int32 */
            totalCount: number;
            /** Format: int32 */
            totalPages: number;
        };
        PagedOfAdminOrderSummaryResponse: {
            items: components["schemas"]["AdminOrderSummaryResponse"][];
            /** Format: int32 */
            page: number;
            /** Format: int32 */
            pageSize: number;
            /** Format: int32 */
            totalCount: number;
            /** Format: int32 */
            totalPages: number;
        };
        PagedOfAdminProductResponse: {
            items: components["schemas"]["AdminProductResponse"][];
            /** Format: int32 */
            page: number;
            /** Format: int32 */
            pageSize: number;
            /** Format: int32 */
            totalCount: number;
            /** Format: int32 */
            totalPages: number;
        };
        PagedOfOrderSummaryResponse: {
            items: components["schemas"]["OrderSummaryResponse"][];
            /** Format: int32 */
            page: number;
            /** Format: int32 */
            pageSize: number;
            /** Format: int32 */
            totalCount: number;
            /** Format: int32 */
            totalPages: number;
        };
        PagedOfProductResponse: {
            items: components["schemas"]["ProductResponse"][];
            /** Format: int32 */
            page: number;
            /** Format: int32 */
            pageSize: number;
            /** Format: int32 */
            totalCount: number;
            /** Format: int32 */
            totalPages: number;
        };
        PagedOfSubscriberResponse: {
            items: components["schemas"]["SubscriberResponse"][];
            /** Format: int32 */
            page: number;
            /** Format: int32 */
            pageSize: number;
            /** Format: int32 */
            totalCount: number;
            /** Format: int32 */
            totalPages: number;
        };
        /** @enum {unknown} */
        PaymentResult: "processing" | "paid" | "refunded" | "failed";
        PostalAddress: {
            recipientName: string;
            line1: string;
            line2: null | string;
            city: string;
            state: null | string;
            postalCode: null | string;
            countryCode: string;
        };
        ProblemDetails: {
            type?: null | string;
            title?: null | string;
            /** Format: int32 */
            status?: null | number;
            detail?: null | string;
            instance?: null | string;
        };
        /** @enum {unknown} */
        ProductBulkAction: "archive" | "end_deal" | "move";
        ProductBulkRequest: {
            ids: number[];
            action: components["schemas"]["ProductBulkAction"];
            /** Format: int32 */
            categoryId?: null | number;
        };
        ProductRequest: {
            name: string;
            description: string;
            /** Format: int32 */
            categoryId: number;
            /** Format: int32 */
            priceCents: number;
            /** Format: int32 */
            stock: number;
            imageKey: string;
        };
        ProductResponse: {
            /** Format: int32 */
            id: number;
            name: string;
            description: string;
            /** Format: int32 */
            priceCents: number;
            /** Format: int32 */
            compareAtPriceCents: null | number;
            dealDescription: null | string;
            /** Format: int32 */
            stock: number;
            /** Format: int32 */
            categoryId: number;
            categoryName: string;
            imageUrl: string;
        };
        /** @enum {unknown} */
        ProductSort: "newest" | "oldest" | "cheapest" | "priciest";
        /** @enum {unknown} */
        ProductStatus: "active" | "archived" | "all";
        PublicStoreSettingsResponse: {
            storeName: string;
            supportEmail: null | string;
            /** Format: int32 */
            shippingFlatRateCents: number;
            /** Format: int32 */
            freeShippingThresholdCents: null | number;
            returnPolicy: components["schemas"]["ReturnPolicy"];
            /** Format: int16 */
            returnWindowDays: null | number;
            returnPolicyNote: null | string;
            /** Format: int32 */
            lowStockThreshold: number;
            timeZoneId: string;
        };
        RegisterRequest: {
            username: string;
            email: string;
            password: string;
        };
        RemovedSubscribersResponse: {
            /** Format: int32 */
            removed: number;
        };
        RemoveSubscribersRequest: {
            ids: number[];
        };
        ResetPasswordRequest: {
            /** Format: int32 */
            userId?: number;
            token: string;
            newPassword: string;
        };
        /** @enum {unknown} */
        ReturnPolicy: "no_returns" | "exchanges" | "refunds";
        SetQuantityRequest: {
            /** Format: int32 */
            quantity: number;
        };
        StartCheckoutRequest: {
            /** Format: int32 */
            addressId: number;
        };
        StatusCount: {
            status: components["schemas"]["OrderStatus"];
            /** Format: int32 */
            count: number;
        };
        /** @enum {unknown} */
        StockLevel: "in_stock" | "low" | "sold_out" | null;
        StoreSettingsResponse: {
            storeName: string;
            supportEmail: null | string;
            /** Format: int32 */
            shippingFlatRateCents: number;
            /** Format: int32 */
            freeShippingThresholdCents: null | number;
            returnPolicy: components["schemas"]["ReturnPolicy"];
            /** Format: int16 */
            returnWindowDays: null | number;
            returnPolicyNote: null | string;
            /** Format: int32 */
            lowStockThreshold: number;
            emailCustomerOnStatusUpdateByDefault: boolean;
            timeZoneId: string;
            /** Format: date-time */
            updatedAtUtc: string;
            /** Format: byte */
            rowVersion: string;
        };
        SubscribeRequest: {
            email: string;
        };
        SubscriberResponse: {
            /** Format: int32 */
            id: number;
            email: string;
            /** Format: date-time */
            subscribedAtUtc: string;
        };
        TopProduct: {
            /** Format: int32 */
            productId: number;
            name: string;
            /** Format: int32 */
            quantity: number;
            /** Format: int32 */
            revenueCents: number;
        };
        UpdateOrderRequest: {
            status: components["schemas"]["OrderStatus"];
            carrier?: null | components["schemas"]["Carrier"];
            trackingNumber?: null | string;
            /** Format: date */
            estimatedDeliveryDate?: null | string;
            note?: null | string;
            emailCustomer?: null | boolean;
            confirmRefund?: boolean;
            /** Format: byte */
            rowVersion: string;
        };
        UpdateProductRequest: {
            /** Format: byte */
            rowVersion: string;
            name: string;
            description: string;
            /** Format: int32 */
            categoryId: number;
            /** Format: int32 */
            priceCents: number;
            /** Format: int32 */
            stock: number;
            imageKey: string;
        };
        UpdateStoreSettingsRequest: {
            storeName: string;
            supportEmail?: null | string;
            /** Format: int32 */
            shippingFlatRateCents: number;
            /** Format: int32 */
            freeShippingThresholdCents?: null | number;
            returnPolicy: components["schemas"]["ReturnPolicy"];
            /** Format: int16 */
            returnWindowDays?: null | number;
            returnPolicyNote?: null | string;
            /** Format: int32 */
            lowStockThreshold: number;
            emailCustomerOnStatusUpdateByDefault: boolean;
            timeZoneId: string;
            /** Format: byte */
            rowVersion: string;
        };
        UploadedImageResponse: {
            key: string;
            url: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
