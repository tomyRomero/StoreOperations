"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TableRow, TableCell } from "@/components/ui/table"
import { toast } from "../ui/use-toast"
import { api } from "@/lib/api/browser"
import { problemMessage } from "@/lib/api/problems"
import type { AdminProduct } from "@/lib/api/types"
import { formatDate } from "@/lib/format"
import { formatMoney } from "@/lib/money"

type Props = { product: AdminProduct; lowStockThreshold: number; timeZone: string };

// Products are archived rather than deleted, so past orders keep their links. Archiving takes the
// product out of the store; restoring puts it back.
const ProductRow = ({ product, lowStockThreshold, timeZone }: Props) => {
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  const archived = product.archivedAtUtc !== null

  const toggleArchive = async () => {
    if (!archived && !window.confirm(`Archive ${product.name}? It leaves the store and customers' carts, and can be restored later.`)) return

    setBusy(true)
    const path = { params: { path: { id: product.id } } }
    const { error, response } = archived
      ? await api.POST("/api/admin/products/{id}/restore", path)
      : await api.POST("/api/admin/products/{id}/archive", path)
    setBusy(false)

    if (!response.ok) {
      toast({ title: archived ? "Couldn't restore the product" : "Couldn't archive the product", description: problemMessage(error), variant: "destructive" })
      return
    }
    toast({ title: archived ? `${product.name} is back in the store` : `${product.name} archived` })
    router.refresh()
  }

  return (
      <TableRow className={archived ? "opacity-60" : ""}>
        <TableCell>
          <Link href={`/adminaddproduct/${product.id}`}>
            <Image
              alt=""
              className="aspect-square rounded-md object-cover"
              height="64"
              src={product.imageUrl}
              width="64"
            />
          </Link>
        </TableCell>
        <TableCell className="font-bold hover:underline">
          <Link href={`/adminaddproduct/${product.id}`}>{product.name}</Link>
          {archived && <span className="ml-2 font-normal text-gray-500">(archived)</span>}
        </TableCell>
        <TableCell>
          <div className='flex flex-wrap gap-2'>
            <Button asChild size="sm" variant="outline">
              <Link href={`/adminaddproduct/${product.id}`}>Edit</Link>
            </Button>
            {!archived && (
              <Button asChild size="sm" variant="outline">
                <Link href={`/adminaddproduct/deal/${product.id}`}>{product.compareAtPriceCents !== null ? "View Deal" : "Make Deal"}</Link>
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={toggleArchive} disabled={busy}>
              {archived ? "Restore" : "Archive"}
            </Button>
          </div>
        </TableCell>
        <TableCell className={`text-center font-bold ${product.stock === 0 ? "text-red-500" : product.stock <= lowStockThreshold ? "text-amber-600" : ""}`}>
          {product.stock}
        </TableCell>
        <TableCell className="text-center font-bold">
          {product.compareAtPriceCents !== null && (
            <span className="mr-1 font-normal text-gray-500 line-through">{formatMoney(product.compareAtPriceCents)}</span>
          )}
          <span className="text-green-600">{formatMoney(product.priceCents)}</span>
        </TableCell>
        <TableCell className="font-semibold">{product.categoryName}</TableCell>
        <TableCell>{formatDate(product.createdAtUtc, timeZone)}</TableCell>
      </TableRow>
  )
}

export default ProductRow;
