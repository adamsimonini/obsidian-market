export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="py-8">{children}</div>
    </div>
  );
}
