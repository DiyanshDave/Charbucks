import { useLocation, useNavigate } from "react-router-dom";

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1>Payment</h1>
      <p>Total: ₹{state?.total}</p>

      <button className="bg-blue-500 text-white px-4 py-2 m-2">
        Cash
      </button>

      <button className="bg-purple-500 text-white px-4 py-2 m-2">
        UPI QR
      </button>

      <button
        onClick={() => navigate("/")}
        className="bg-green-500 text-white px-4 py-2 m-2"
      >
        Complete Payment
      </button>
    </div>
  );
}