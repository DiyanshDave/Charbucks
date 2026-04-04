import { useParams, useNavigate } from "react-router-dom";
import { products } from "../data/mockData";
import { useState } from "react";

import Sidebar from "../components/Sidebar";
import CategorySidebar from "../components/CategorySidebar";
import ProductGrid from "../components/ProductGrid";
import Cart from "../components/Cart";

export default function Order() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    // 🔥 THIS IS THE MAIN CONTAINER
    <div className="flex bg-surface min-h-screen">

      {/* LEFT NAV */}
      <Sidebar />

      {/* CATEGORY PANEL */}
      <CategorySidebar />

      {/* MAIN PRODUCT AREA */}
      <div className="flex-1 p-8 ml-64">
        <h1 className="text-3xl font-serif text-primary mb-6">
          Table {tableId}
        </h1>

        <ProductGrid products={products} addToCart={addToCart} />
      </div>

      {/* RIGHT CART PANEL */}
      <div className="p-6">
        <Cart
          cart={cart}
          total={total}
          onCheckout={() =>
            navigate("/payment", { state: { total } })
          }
        />
      </div>

    </div>
  );
}