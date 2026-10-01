import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { ErrorState } from "@/components/shared/ErrorState";
import { RetryButton } from "@/components/shared/RetryButton";
import { getAdminCategories } from "@/lib/data/admin-catalog";

export const metadata: Metadata = { title: "Add a product" };

export default async function NewProductPage() {
  const categories = await getAdminCategories();

  return (
    <>
      <AdminPageHeader back={{ href: "/admin/products", label: "All products" }} title="Add a product" description="It goes into the store as soon as it's added." />
      {categories ? (
        <section className="max-w-2xl rounded-md border bg-card p-5 sm:p-6">
          <ProductForm product={null} categories={categories} />
        </section>
      ) : (
        <ErrorState title="We couldn't load the categories" action={<RetryButton />} />
      )}
    </>
  );
}
