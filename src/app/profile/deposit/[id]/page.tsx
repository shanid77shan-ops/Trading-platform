import { DepositDetailView } from "@/components/deposit/DepositDetailView";

export default async function ProfileDepositDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DepositDetailView methodId={id} />;
}
