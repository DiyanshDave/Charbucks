export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-primary text-white p-6 rounded-r-2xl fixed">
      <h1 className="font-serif text-xl mb-10">Charbucks</h1>

      <div className="space-y-4">
        <div className="bg-white text-primary p-3 rounded-full">
          Floor Plan
        </div>
        <div className="opacity-70">Orders</div>
        <div className="opacity-70">Kitchen</div>
      </div>
    </div>
  );
}