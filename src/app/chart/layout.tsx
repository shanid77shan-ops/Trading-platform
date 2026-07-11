export default function ChartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="max-w-none">{children}</div>;
}
