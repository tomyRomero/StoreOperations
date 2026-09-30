import type { components } from "./schema";

// Shorter names for the API's shapes, generated from its contract
type Schemas = components["schemas"];

export type CurrentUser = Schemas["CurrentUserResponse"];
export type OrderStatus = Schemas["OrderStatus"];

export type Category = Schemas["CategoryResponse"];
export type Product = Schemas["ProductResponse"];
export type ProductSort = Schemas["ProductSort"];

export type Cart = Schemas["CartResponse"];
export type CartLine = Schemas["CartLineResponse"];
export type CartLineIssue = Schemas["CartLineIssue"];

export type StoreSettings = Schemas["PublicStoreSettingsResponse"];
