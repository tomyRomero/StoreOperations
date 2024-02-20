import Hero from "@/components/home/Hero";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Categories from "@/components/home/Categories";
import Promotion from "@/components/home/Promotion";
import { redirect } from "next/navigation";
import { getAllCategories, getDeals } from "@/lib/actions/store.actions";

export default async function Home() {

  interface Deal {
    stripeProductId: string;
    name: string;
    description: string;
    stock: string;
    price: string;
    category: string;
    photo: string;
    date: string;
    oldPrice: string; 
    dealDescription: string; 
  }

  const categories = await getAllCategories();
  const deals:Deal[]  = await getDeals();

  return (
    <section className="md:pt-10 flex flex-col w-full items-center justify-center">
      <Hero />
      <Categories data={categories}/>
      <Promotion deals={deals}/>
    </section>
  );
}
