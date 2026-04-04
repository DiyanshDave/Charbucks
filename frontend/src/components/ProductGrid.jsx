export default function ProductGrid({ products, addToCart }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {products.map((p) => (
        <div
          key={p.id}
          className="bg-surface-low p-4 rounded-xl hover:scale-105 transition"
        >
          <div className="h-40 bg-white rounded-lg mb-4"></div>

          <h2 className="font-serif text-lg text-primary">
            {p.name}
          </h2>

          <p className="text-secondary text-sm">₹{p.price}</p>

          <button
            onClick={() => addToCart(p)}
            className="mt-4 w-full bg-primary text-white py-2 rounded-full"
          >
            Add to order
          </button>
        </div>
      ))}
    </div>
  );
}