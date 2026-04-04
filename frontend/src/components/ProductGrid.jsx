export default function ProductGrid({ products, addToCart }) {
  const grouped = products.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const icons  = { Beverage: "☕", Pastry: "🥐", Snack: "🍪", Food: "🍔", Drinks: "🥤" };
  const colors = {
    Beverage: "bg-blue-50 text-blue-700",
    Pastry:   "bg-amber-50 text-amber-700",
    Snack:    "bg-green-50 text-green-700",
    Food:     "bg-orange-50 text-orange-700",
    Drinks:   "bg-cyan-50 text-cyan-700",
  };
  const bgColors = {
    Beverage: "from-blue-50 to-blue-100",
    Pastry:   "from-amber-50 to-amber-100",
    Snack:    "from-green-50 to-green-100",
    Food:     "from-orange-50 to-orange-100",
    Drinks:   "from-cyan-50 to-cyan-100",
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-[#9a9a8a] animate-fade-in">
        <div className="text-6xl mb-4">🍽️</div>
        <p className="text-lg font-medium">No products available</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="animate-fade-in">

          {/* Category header */}
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#e8e4d8]">
            <span className="text-2xl">{icons[category] || "📦"}</span>
            <h3 className="font-serif text-xl text-[#1e3a1e] font-semibold">{category}</h3>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${colors[category] || "bg-gray-100 text-gray-600"}`}>
              {items.length} items
            </span>
          </div>

          {/* Products */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((p, i) => (
              <div
                key={p.id}
                className="group bg-white rounded-2xl overflow-hidden border border-[#f0ece0] hover:border-[#1e3a1e]/30 hover:shadow-xl transition-all duration-250 hover:-translate-y-1"
                style={{ animation: 'fadeIn 0.3s ease forwards', animationDelay: `${i * 40}ms`, opacity: 0 }}
              >
                {/* Image area */}
                <div className={`relative h-36 bg-gradient-to-br ${bgColors[category] || "from-gray-50 to-gray-100"} flex items-center justify-center`}>
                  <span className="text-5xl opacity-60 group-hover:opacity-90 group-hover:scale-110 transition-all duration-300">
                    {icons[category] || "🍽️"}
                  </span>
                  <span className={`absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-semibold ${colors[category] || "bg-gray-100 text-gray-600"}`}>
                    {category}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h4 className="font-semibold text-[#1e3a1e] text-sm mb-1 truncate">{p.name}</h4>
                  <p className="font-bold text-[#1e3a1e] text-xl mb-3">
                    ₹{typeof p.price === "number" ? p.price.toLocaleString("en-IN") : p.price}
                  </p>
                  <button
                    onClick={() => addToCart(p)}
                    className="w-full py-2 bg-[#1e3a1e] text-white text-sm font-medium rounded-xl
                      hover:bg-[#2d5a2d] active:scale-95 transition-all duration-150
                      flex items-center justify-center gap-1.5"
                  >
                    <span>+</span> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}