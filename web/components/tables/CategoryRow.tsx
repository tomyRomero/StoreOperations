"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { TableRow, TableCell } from "@/components/ui/table"
import { toast } from '../ui/use-toast'
import { api } from '@/lib/api/browser'
import { problemMessage } from '@/lib/api/problems'
import type { AdminCategory } from '@/lib/api/types'

// Only an empty category can be deleted: products, archived ones too, keep their category
const CategoryRow = ({ category }: { category: AdminCategory }) => {
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  const deleteCategory = async () => {
    if (!window.confirm(`Delete the ${category.name} category?`)) return

    setBusy(true)
    const { error, response } = await api.DELETE("/api/admin/categories/{id}", { params: { path: { id: category.id } } })
    setBusy(false)

    if (!response.ok) {
      toast({ title: "Couldn't delete the category", description: problemMessage(error), variant: "destructive" })
      return
    }
    toast({ title: `${category.name} deleted` })
    router.refresh()
  }

  return (
    <TableRow>
      <TableCell>
        <Link href={`/admin/categories/${category.id}`}>
          <Image
            alt=""
            className="aspect-square rounded-md object-cover"
            height="64"
            src={category.imageUrl}
            width="64"
          />
        </Link>
      </TableCell>
      <TableCell>
        <div className='flex flex-wrap gap-2'>
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/categories/${category.id}`}>Edit</Link>
          </Button>
          {category.canDelete && (
            <Button size="sm" variant="outline" onClick={deleteCategory} disabled={busy}>
              Delete
            </Button>
          )}
        </div>
      </TableCell>
      <TableCell className="font-bold hover:underline"><Link href={`/admin/categories/${category.id}`}>{category.name}</Link></TableCell>
      <TableCell className="text-center">{category.productCount}</TableCell>
    </TableRow>
  )
}

export default CategoryRow
