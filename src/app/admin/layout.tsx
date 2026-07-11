export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="max-w-none">{children}</div>;
}
