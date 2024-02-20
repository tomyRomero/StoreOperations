import NewsletterSubscribers from "@/components/cards/NewsletterSubscribers";
import NewsletterForm from "@/components/forms/NewsletterForm";
import { getAllSubscribedEmails } from "@/lib/actions/store.actions";

const page = async ()=> {

  const emails = await getAllSubscribedEmails();


  return (
    <section className="md:pt-24 max-sm:pt-20 lg:pt-0 flex flex-col h-full">
    <NewsletterSubscribers emails={emails} />
    <br/>
      <NewsletterForm />
    </section>
  )
}

export default page;
