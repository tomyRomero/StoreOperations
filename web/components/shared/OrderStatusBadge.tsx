import { Badge } from "@/components/ui/badge"
import type { OrderStatus } from "@/lib/api/types"
import { orderStatusLabel } from "@/lib/format"

// Orders waiting on the store stand out; finished ones step back
const variants: Record<OrderStatus, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "default",
  shipped: "secondary",
  delivered: "outline",
  cancelled: "destructive",
  refunded: "destructive",
}

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => (
  <Badge variant={variants[status]} className="whitespace-nowrap">{orderStatusLabel(status)}</Badge>
)

export default OrderStatusBadge
