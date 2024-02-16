import OrderSuccess from "@/components/cards/OrderSuccess";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const page = async () => {

  const session = await getServerSession(authOptions);

  if(!session)
  {
    redirect("/")
  }

  return (
    <section className="w-full max-md:pt-36 md:pt-36 px-16 lg:px-40 max-sm:px-8 max-xs:px-4 max-xs:pt-40">
      <OrderSuccess />
    </section>
  );
};

export default page;
