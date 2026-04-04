import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import CategorySidebar from "../components/CategorySidebar";
import ProductGrid from "../components/ProductGrid";
import Cart from "../components/Cart";
import BASE_URL from "../config/api";

export default function Order() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/products`);
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
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      const orderRes = await fetch(`${BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: tableId,
          totalAmount: total,
          items: cart.map((item) => ({
            productId: item.id,
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

      const orderId = orderData.orderId;

      await fetch(`${BASE_URL}/api/orders/${orderId}/send`, {
        method: "POST",
      });

      navigate("/payment", { state: { total, orderId, tableId } });
    } catch (err) {
      console.error(err);
      alert("Something went wrong: " + err.message);
    }
  };

  return (
    <div className="flex bg-surface min-h-screen">
      <Sidebar />
      <CategorySidebar />

      <div className="flex-1 p-8 ml-16">
        <h1 className="text-3xl font-serif text-primary mb-6">
          Table {tableId}
        </h1>

        {loading && <p className="text-gray-500">Loading products...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <ProductGrid products={products} addToCart={addToCart} />
        )}
      </div>

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