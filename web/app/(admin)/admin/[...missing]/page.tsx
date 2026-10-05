import { notFound } from "next/navigation";

// Unknown /admin addresses get the admin's own not-found page, inside the admin shell
export default function MissingAdminPage() {
  notFound();
}
