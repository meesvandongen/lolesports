import { RedirectType, redirect } from "next/navigation";

export default async function HomePage() {
  redirect("/emea", RedirectType.replace);

  return null;
}
