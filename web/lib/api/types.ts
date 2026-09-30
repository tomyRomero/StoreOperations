import type { components } from "./schema";

// Shorter names for the API's shapes, generated from its contract
type Schemas = components["schemas"];

export type CurrentUser = Schemas["CurrentUserResponse"];
export type OrderStatus = Schemas["OrderStatus"];
