import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Sidebar from "../components/Sidebar";
import CategorySidebar from "../components/CategorySidebar";
import ProductGrid from "../components/ProductGrid";
import Cart from "../components/Cart";

export default function Order() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch products from your backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = (product) => {
    // check if product already in cart
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      // increase quantity
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // add new item with quantity 1
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  // total calculated with quantity
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // create order + send to kitchen
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      // 1. create order — using contract field names
      const orderRes = await fetch("http://localhost:3000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableId: tableId,         // contract uses tableId not table_id
          totalAmount: total,       // contract uses totalAmount not total_amount
          items: cart.map((item) => ({
            productId: item.id,     // contract uses productId not product_id
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || "Order creation failed");
      }

      const orderId = orderData.orderId; // contract returns orderId not order_id

      // 2. send to kitchen
      await fetch(`http://localhost:3000/api/orders/${orderId}/send`, {
        method: "POST",
      });

      // 3. navigate to payment
      navigate("/payment", { state: { total, orderId, tableId } });

    } catch (err) {
      console.error(err);
      alert("Something went wrong: " + err.message);
    }
  };

  return (
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

        {/* loading state */}
        {loading && (
          <p className="text-gray-500">Loading products...</p>
        )}

        {/* error state */}
        {error && (
          <p className="text-red-500">{error}</p>
        )}

        {/* products loaded */}
        {!loading && !error && (
          <ProductGrid
            products={products}
            addToCart={addToCart}
          />
        )}
      </div>

      {/* RIGHT CART PANEL */}
      <div className="p-6">
        <Cart
          cart={cart}
          total={total}
          onCheckout={handleCheckout}
          onRemove={removeFromCart}
        />
      </div>

    </div>
  );
}