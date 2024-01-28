
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function AddProductForm() {
  return (
    <div className="flex flex-col max-w-md mx-auto">
      <Link href={'/admincategories'} className="w-0">
      <Button className="flex px-6 border border-black" variant="ghost">
          <Image
            src="/assets/back.png"
            alt="go back icon"
            width={32}
            height={32}
            className="px-1"
          />
          <span className="ml-2">Go Back</span>
        </Button>
      </Link>
      <br />
      <h1 className="text-2xl font-bold text-center mb-6">Add New Product</h1>
      <form className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="product-name">Product Name</Label>
          <Input id="product-name" placeholder="Enter product name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-description">Product Description</Label>
          <Textarea id="product-description" placeholder="Enter product description" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-price">Product Price</Label>
          <Input id="product-price" placeholder="Enter product price" required type="number" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-category">Product Category</Label>
          
          <Select defaultValue="" 
          //@ts-ignore
          id="product-category">
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="fashion">Fashion</SelectItem>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="books">Books</SelectItem>
              <SelectItem value="beauty">Beauty</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-image">Product Image</Label>
          <Input id="product-image" required type="file" />
        </div>
        <Button className="w-full" type="submit">
          Add Product
        </Button>
      </form>
    </div>
  )
}

