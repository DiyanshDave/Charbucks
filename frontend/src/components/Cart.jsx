import { useState } from 'react';

export default function Cart({ cart, total, onCheckout, onUpdateQuantity, onRemoveItem }) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    await onCheckout();
    setIsCheckingOut(false);
  };

  const fmt = (price) =>
    new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);

  const categoryIcon = (cat) => {
    const map = { Food: '🍔', Beverage: '☕', Drinks: '🥤', Pastry: '🥐', Snack: '🍪' };
    return map[cat] || '🍽️';
  };

  const gst = total * 0.05;
  const service = total > 0 ? 20 : 0;
  const grandTotal = total + gst + service;

  return (
    <div
      className="w-[400px] flex flex-col bg-[#faf8f3] rounded-2xl shadow-xl overflow-hidden sticky top-8"
      style={{ maxHeight: 'calc(100vh - 4rem)' }}
    >
      {/* Header */}
      <div className="bg-[#1e3a1e] px-7 py-5 flex items-center justify-between flex-shrink-0">
        <h2 className="text-white text-xl font-bold tracking-wide">Order Summary</h2>
        <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
          {cart.reduce((s, i) => s + (i.quantity || 1), 0)} items
        </span>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4 opacity-40">🛒</div>
            <p className="text-[#5a5a4a] font-medium">Cart is empty</p>
            <p className="text-[#9a9a8a] text-sm mt-1">Add items from the menu</p>
          </div>
        ) : (
          cart.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md"
              style={{ animation: 'slideIn 0.2s ease forwards', animationDelay: `${index * 40}ms`, opacity: 0 }}
            >
              {/* Icon */}
              <div className="w-10 h-10 bg-[#f0ece0] rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                {categoryIcon(item.category)}
              </div>

              {/* Name + price */}
              <div className="flex-1 min-w-0">
                <p className="text-[#1e3a1e] font-semibold text-sm truncate">{item.name}</p>
                <p className="text-[#8a8a7a] text-xs">₹{fmt(item.price)} each</p>
              </div>

              {/* Qty controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onUpdateQuantity?.(index, (item.quantity || 1) - 1)}
                  disabled={(item.quantity || 1) <= 1}
                  className="w-6 h-6 rounded-full bg-[#f0ece0] text-[#1e3a1e] font-bold text-sm flex items-center justify-center disabled:opacity-30 hover:bg-[#1e3a1e] hover:text-white transition-colors"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm font-bold text-[#1e3a1e]">{item.quantity || 1}</span>
                <button
                  onClick={() => onUpdateQuantity?.(index, (item.quantity || 1) + 1)}
                  className="w-6 h-6 rounded-full bg-[#f0ece0] text-[#1e3a1e] font-bold text-sm flex items-center justify-center hover:bg-[#1e3a1e] hover:text-white transition-colors"
                >
                  +
                </button>
              </div>

              {/* Line total */}
              <div className="text-right min-w-[60px]">
                <p className="text-[#1e3a1e] font-bold text-sm">₹{fmt(item.price * (item.quantity || 1))}</p>
                <button
                  onClick={() => onRemoveItem?.(index)}
                  className="text-[#cc4444] text-xs hover:underline mt-0.5"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer totals + button */}
      {cart.length > 0 && (
        <div className="border-t border-[#e8e4d8] bg-white px-7 py-5 flex-shrink-0">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-[#6a6a5a]">
              <span>Subtotal</span>
              <span>₹{fmt(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#6a6a5a]">
              <span>GST (5%)</span>
              <span>₹{fmt(gst)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#6a6a5a] pb-3 border-b border-[#e8e4d8]">
              <span>Service Charge</span>
              <span>₹{fmt(service)}</span>
            </div>
            <div className="flex justify-between text-[#1e3a1e] font-bold text-lg pt-1">
              <span>Total</span>
              <span>₹{fmt(grandTotal)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="w-full py-3.5 bg-[#1e3a1e] text-white rounded-xl font-semibold text-base tracking-wide hover:bg-[#2d5a2d] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isCheckingOut ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>💳 Proceed to Payment</>
            )}
          </button>

          <p className="text-center text-[#9a9a8a] text-xs mt-3">Free cancellation within 5 minutes</p>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}