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

export type PostalAddress = Schemas["PostalAddress"];
export type Address = Schemas["AddressResponse"];
export type NewAddress = Schemas["NewAddressRequest"];

export type OrderSummary = Schemas["OrderSummaryResponse"];
export type Order = Schemas["OrderResponse"];
export type OrderLine = Schemas["OrderLineResponse"];
export type Carrier = NonNullable<Schemas["Carrier"]>;

export type Checkout = Schemas["CheckoutResponse"];
export type CheckoutLine = Schemas["CheckoutLineResponse"];
export type PaymentResult = Schemas["PaymentResult"];

export type AdminOrderSummary = Schemas["AdminOrderSummaryResponse"];
export type AdminOrder = Schemas["AdminOrderResponse"];
export type AdminOrderSort = Schemas["AdminOrderSort"];
export type AdminSettings = Schemas["StoreSettingsResponse"];
export type AdminProduct = Schemas["AdminProductResponse"];
export type AdminCategory = Schemas["AdminCategoryResponse"];
export type ProductStatus = Schemas["ProductStatus"];
export type AdminProductSort = Schemas["AdminProductSort"];
export type StockLevel = NonNullable<Schemas["StockLevel"]>;
export type ProductBulkAction = Schemas["ProductBulkAction"];
export type AdminCustomerSummary = Schemas["AdminCustomerSummaryResponse"];
export type AdminCustomer = Schemas["AdminCustomerResponse"];
export type AdminCustomerSort = Schemas["AdminCustomerSort"];
export type AccountRole = NonNullable<Schemas["AccountRole"]>;
export type ActivityEntry = Schemas["ActivityEntryResponse"];
export type ActivityEntity = NonNullable<Schemas["ActivityEntity"]>;
export type Subscriber = Schemas["SubscriberResponse"];
export type Dashboard = Schemas["DashboardResponse"];
export type Comparison = Schemas["Comparison"];
export type DailyRevenue = Schemas["DailyRevenue"];
