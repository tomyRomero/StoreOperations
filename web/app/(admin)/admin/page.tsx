import { redirect } from "next/navigation";

// Until the dashboard is built, the admin starts at the activity feed as before
export default function AdminHome() {
  redirect("/admin/activity");
}
