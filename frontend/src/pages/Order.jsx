import { useParams, useNavigate } from "react-router-dom";
import { products } from "../data/mockData";
import { useState } from "react";

export default function Order() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="p-6">
      <h1>Table: {tableId}</h1>

      <div className="grid grid-cols-2 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            onClick={() => addToCart(p)}
            className="bg-gray-200 p-4 rounded cursor-pointer"
          >
            {p.name} - ₹{p.price}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h2>Cart</h2>
        {cart.map((item, i) => (
          <div key={i}>{item.name}</div>
        ))}
        <p>Total: ₹{total}</p>

        <button
          onClick={() => navigate("/payment", { state: { total } })}
          className="bg-green-500 text-white px-4 py-2 mt-4"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}