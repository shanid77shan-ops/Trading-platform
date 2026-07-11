import { redirect } from "next/navigation";

export default async function DepositDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/profile/deposit/${id}`);
}
