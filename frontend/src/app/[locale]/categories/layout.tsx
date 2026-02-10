export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-main mx-auto px-4 py-8 md:px-8">{children}</div>
    </div>
  );
}
