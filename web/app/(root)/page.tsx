import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import Promotion from "@/components/home/Promotion";
import { getCategories, getDeals } from "@/lib/data/catalog";

export default async function Home() {
  const [categories, deals] = await Promise.all([getCategories(), getDeals()]);

  return (
    <section className="md:pt-10 flex flex-col w-full items-center justify-center">
      <Hero />
      <Categories data={categories}/>
      <Promotion deals={deals}/>
    </section>
  );
}
