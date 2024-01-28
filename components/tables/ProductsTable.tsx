import { Button } from "@/components/ui/button"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"



const ProductsTable = () => {
  return (
    <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[80px]">Image</TableHead>
        <TableHead className="max-w-[150px]">Name</TableHead>
        <TableHead className="hidden md:table-cell">Price</TableHead>
        <TableHead className="hidden md:table-cell">Inventory</TableHead>
        <TableHead className="hidden md:table-cell">Action</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>
          <img
            alt="Product image"
            className="aspect-square rounded-md object-cover"
            height="64"
            src="/assets/art.jpg"
            width="64"
          />
        </TableCell>
        <TableCell className="font-medium">Glimmer Lamps</TableCell>
        <TableCell className="hidden md:table-cell">In Production</TableCell>
        <TableCell>500</TableCell>
        <TableCell>
            <div className='flex'>
             <Button size="sm" variant="outline">
               Edit
             </Button>
             <Button className="ml-2" size="sm" variant="outline">
               Delete
             </Button>
             </div>
           </TableCell>
      </TableRow>
    </TableBody>
  </Table>
  )
}

export default ProductsTable