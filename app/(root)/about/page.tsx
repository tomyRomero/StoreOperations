
import { AccordionTrigger, AccordionContent, AccordionItem, Accordion } from "@/components/ui/accordion"

export default function page() {
  return (
    <section className="w-full max-md:pt-36 md:pt-36 px-16 lg:px-40 max-sm:px-8 max-xs:px-4 max-xs:pt-40">
    <main className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="font-bold tracking-tighter text-heading3-bold">
              Privacy Policy
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500">
              We value your privacy and ensure that your data is secure.
            </p>
          </div>
        </div>
        <div className="mt-12 space-y-8">
          <Accordion className="w-full" collapsible type="single">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <InfoIcon className="h-5 w-5 mr-2" />
                Information Collection
              </AccordionTrigger>
              <AccordionContent>We collect information to provide better services to all our users.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                <UserIcon className="h-5 w-5 mr-2" />
                Use of Information
              </AccordionTrigger>
              <AccordionContent>
                We use the information we collect to provide, maintain, protect and improve our services.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                <CookieIcon className="h-5 w-5 mr-2" />
                Cookies
              </AccordionTrigger>
              <AccordionContent>
                We use cookies to improve user experience, and analyze website traffic.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>
                <ChevronRightIcon className="h-5 w-5 mr-2" />
                Your Rights
              </AccordionTrigger>
              <AccordionContent>You have the right to access, correct, or delete your personal data.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </main>
  </section>
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


function CookieIcon(props: any) {
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
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
      <path d="M8.5 8.5v.01" />
      <path d="M16 15.5v.01" />
      <path d="M12 12v.01" />
      <path d="M11 17v.01" />
      <path d="M7 14v.01" />
    </svg>
  )
}


function InfoIcon(props: any) {
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
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
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
