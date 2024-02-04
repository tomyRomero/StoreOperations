import Hero from "@/components/Hero";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Categories from "@/components/Categories";
import Promotion from "@/components/Promotion";
import { redirect } from "next/navigation";
import { getAllCategories } from "@/lib/actions/store.actions";

export default async function Home() {

  const categories = await getAllCategories();

  return (
    <section className="md:pt-10 flex flex-col w-full items-center justify-center">
      <Hero />
      <Categories data={categories}/>
      <Promotion />
    </section>
  );
}
