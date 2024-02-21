import AboutDetails from "@/components/home/AboutDetails";

const page = ()=> {
  return (
    <section className="w-full max-md:pt-36 md:pt-36 px-16 lg:px-40 max-sm:px-8 max-xs:px-4 max-xs:pt-40">
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
        <AboutDetails />
      </div>
  </section>
  )
}

export default page;