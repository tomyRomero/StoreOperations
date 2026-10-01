import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";

export const metadata: Metadata = { title: "Add a category" };

export default function NewCategoryPage() {
  return (
    <>
      <AdminPageHeader back={{ href: "/admin/categories", label: "All categories" }} title="Add a category" description="It shows in the store's menu and category tiles." />
      <section className="max-w-2xl rounded-md border bg-card p-5 sm:p-6">
        <CategoryForm category={null} />
      </section>
    </>
  );
}
