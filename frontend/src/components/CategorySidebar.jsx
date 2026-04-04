export default function CategorySidebar() {
  return (
    <div className="w-64 bg-primary text-white p-6 rounded-r-2xl">
      <p className="text-xs uppercase opacity-60 mb-4">Categories</p>

      <div className="space-y-3">
        <div className="bg-white text-primary p-3 rounded-full">
          Pizza
        </div>
        <div className="opacity-70">Burger</div>
        <div className="opacity-70">Coffee</div>
      </div>
    </div>
  );
}