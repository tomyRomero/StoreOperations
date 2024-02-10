
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function page() {
  return (
    <Card>
      <CardHeader className="flex items-center gap-4">
        <CardTitle>Recent Activity</CardTitle>
        <Button size="sm">Load more</Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          <div className="flex items-center gap-4 p-4">
            <div className="flex items-center gap-4">
              <ClockIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div className="font-medium">2 minutes ago</div>
            </div>
            <div className="flex items-center gap-4">
              <UserIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div className="font-medium">Alice Johnson</div>
            </div>
            <div className="flex items-center gap-4">
              <MailIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div className="font-medium">Email Sent</div>
            </div>
            <div className="flex items-center gap-4">
              <ChevronRightIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <Button className="rounded-full" size="icon" variant="outline">
                <ChevronRightIcon className="w-4 h-4" />
                <span className="sr-only">View</span>
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <div className="flex items-center gap-4">
              <ClockIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div className="font-medium">1 hour ago</div>
            </div>
            <div className="flex items-center gap-4">
              <UserIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div className="font-medium">Bob Smith</div>
            </div>
            <div className="flex items-center gap-4">
              <MailIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div className="font-medium">Email Opened</div>
            </div>
            <div className="flex items-center gap-4">
              <ChevronRightIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <Button className="rounded-full" size="icon" variant="outline">
                <ChevronRightIcon className="w-4 h-4" />
                <span className="sr-only">View</span>
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <div className="flex items-center gap-4">
              <ClockIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div className="font-medium">2 hours ago</div>
            </div>
            <div className="flex items-center gap-4">
              <UserIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div className="font-medium">Charlie Brown</div>
            </div>
            <div className="flex items-center gap-4">
              <MailIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div className="font-medium">Email Clicked</div>
            </div>
            <div className="flex items-center gap-4">
              <ChevronRightIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <Button className="rounded-full" size="icon" variant="outline">
                <ChevronRightIcon className="w-4 h-4" />
                <span className="sr-only">View</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ChevronRightIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}


function ClockIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}


function MailIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}


function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
