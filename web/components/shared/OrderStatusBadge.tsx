import { Badge } from "@/components/ui/badge"
import type { OrderStatus } from "@/lib/api/types"
import { orderStatusLabel } from "@/lib/format"

// Waiting on the store is amber, on its way is the accent, done is green, and the two endings that
// return the money are sale red. The label always says which.
const variants: Record<OrderStatus, "warning" | "accent" | "success" | "sale"> = {
  pending: "warning",
  shipped: "accent",
  delivered: "success",
  cancelled: "sale",
  refunded: "sale",
}

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => (
  <Badge variant={variants[status]}>{orderStatusLabel(status)}</Badge>
)

export default OrderStatusBadge
