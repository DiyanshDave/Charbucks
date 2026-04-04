export default function Cart({ cart, total, onCheckout }) {
  return (
    <div className="w-80 bg-surface-low p-6 rounded-xl">
      <h2 className="font-serif text-xl text-primary mb-4">
        Order Summary
      </h2>

      <div className="space-y-2">
        {cart.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span>{item.name}</span>
            <span>₹{item.price}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 text-lg font-bold text-primary">
        Total: ₹{total}
      </div>

      <button
        onClick={onCheckout}
        className="mt-4 w-full bg-primary text-white py-3 rounded-full"
      >
        Proceed to Payment
      </button>
    </div>
  );
}