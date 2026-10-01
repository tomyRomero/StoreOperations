import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { DeleteCategoryButton } from "@/components/admin/categories/DeleteCategoryButton";
import { Button } from "@/components/ui/button";
import { getAdminCategory } from "@/lib/data/admin-catalog";

type Props = { params: Promise<{ id: string }> };

async function categoryFor(props: Props) {
  const id = Number((await props.params).id);
  return Number.isInteger(id) && id > 0 ? getAdminCategory(id) : null;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  return { title: (await categoryFor(props))?.name ?? "Category" };
}

export default async function CategoryPage(props: Props) {
  const category = await categoryFor(props);
  if (!category) notFound();

  return (
    <>
      <AdminPageHeader
        back={{ href: "/admin/categories", label: "All categories" }}
        title={category.name}
        description={`${category.productCount} ${category.productCount === 1 ? "product" : "products"}, archived ones included`}
        actions={
          <>
            {category.productCount > 0 && (
              <Button asChild variant="ghost">
                <Link href={`/admin/products?category=${category.id}&status=all`}>See its products</Link>
              </Button>
            )}
            {category.canDelete && <DeleteCategoryButton category={category} />}
          </>
        }
      />
      <section className="max-w-2xl rounded-md border bg-card p-5 sm:p-6">
        {/* A new version (after a save) starts the form again from it */}
        <CategoryForm key={`${category.name}-${category.imageKey}`} category={category} />
        {!category.canDelete && (
          <p className="mt-6 border-t pt-4 text-sm text-muted-foreground">
            Only an empty category can be deleted. Move its products to another category first, archived ones too.
          </p>
        )}
      </section>
    </>
  );
}
