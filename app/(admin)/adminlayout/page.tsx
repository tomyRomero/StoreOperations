import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"

export default function page() {
  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Header</CardTitle>
          <CardDescription>Customize the header of your homepage.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 grid gap-4">
          <div className="flex items-center gap-4">
            <Label className="flex-1" htmlFor="logo">
              Logo
            </Label>
            <Input id="logo" placeholder="Enter URL" />
            <Button className="h-8">Upload</Button>
          </div>
          <div className="flex items-center gap-4">
            <Label className="flex-1" htmlFor="background">
              Background Color
            </Label>
            <Input className="w-auto" id="background" type="color" value="#ffffff" />
          </div>
          <div className="flex items-center gap-4">
            <Label className="flex-1" htmlFor="nav">
              Navigation Links
            </Label>
            <div className="flex items-center gap-4">
              <Input id="nav1" placeholder="Enter URL" />
              <Button className="h-8">Add Link</Button>
            </div>
            <div className="flex items-center gap-4">
              <Input id="nav2" placeholder="Enter URL" />
              <Button className="h-8">Add Link</Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Label className="flex-1" htmlFor="social">
              Social Media Icons
            </Label>
            <div className="flex items-center gap-4">
              <div className="w-24">
              {/* id="social" */}
              <Select >
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter</option>
                <option value="instagram">Instagram</option>
              </Select>
              </div>
              <Input id="socialUrl" placeholder="Enter URL" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Hero Section</CardTitle>
          <CardDescription>Add content for the hero section of your homepage.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 grid gap-4">
          <div className="flex items-center gap-4">
            <Label className="flex-1" htmlFor="heroTitle">
              Hero Title
            </Label>
            <Input id="heroTitle" placeholder="Enter Title" />
          </div>
          <div className="flex items-center gap-4">
            <Label className="flex-1" htmlFor="heroText">
              Hero Text
            </Label>
            <Input id="heroText" placeholder="Enter Text" />
          </div>
          <div className="flex items-center gap-4">
            <Label className="flex-1" htmlFor="heroImage">
              Hero Image
            </Label>
            <Input id="heroImage" type="file" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>App Store Name</CardTitle>
          <CardDescription>Set the name of your app store.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 grid gap-4">
          <div className="flex items-center gap-4">
            <Label className="flex-1" htmlFor="appName">
              App Store Name
            </Label>
            <Input id="appName" placeholder="Enter Name" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Footer</CardTitle>
          <CardDescription>Customize the footer of your homepage.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 grid gap-4">
          <div className="flex items-center gap-4">
            <Label className="flex-1" htmlFor="footerText">
              Footer Text
            </Label>
            <Input id="footerText" placeholder="Enter Text" />
          </div>
          <div className="flex items-center gap-4">
            <Label className="flex-1" htmlFor="footerLinks">
              Footer Links
            </Label>
            <div className="flex items-center gap-4">
              <Input id="footerLink1" placeholder="Enter URL" />
              <Button className="h-8">Add Link</Button>
            </div>
            <div className="flex items-center gap-4">
              <Input id="footerLink2" placeholder="Enter URL" />
              <Button className="h-8">Add Link</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

