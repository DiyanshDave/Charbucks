import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const total = state?.total || 0;
  const orderId = state?.orderId || null;
  const tableId = state?.tableId || null;

  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paid, setPaid] = useState(false);

  // UPI QR link
const upiLink = `upi://pay?pa=${import.meta.env.VITE_UPI_ID}&pn=Charbucks&am=${total}`;
  // handle cash or card payment (no razorpay needed)
  const handleOfflinePayment = async (method) => {
    if (!orderId) {
      alert("No order found");
      return;
    }

    setLoading(true);
    setSelectedMethod(method);

    try {
      // step 1 — create razorpay order in backend
      const createRes = await fetch(
        "http://localhost:3000/api/payments/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        }
      );

      const createData = await createRes.json();

      if (!createRes.ok) {
        throw new Error(createData.error || "Failed to create payment");
      }

      // step 2 — open razorpay checkout popup
      const options = {
        key: import.meta.env.RAZORPAY_KEY_ID,
        amount: createData.amount,
        currency: createData.currency,
        order_id: createData.razorpayOrderId,
        name: "Charbucks",
        description: `Payment for Order ${orderId}`,
        handler: async function (response) {
          // step 3 — verify payment on backend
          const verifyRes = await fetch(
            "http://localhost:3000/api/payments/verify",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId,
                method,
              }),
            }
          );

          const verifyData = await verifyRes.json();

          if (!verifyRes.ok) {
            throw new Error(verifyData.error || "Payment verification failed");
          }

          // payment success
          setPaid(true);
          setTimeout(() => navigate("/"), 2000);
        },
        prefill: {
          name: "Customer",
        },
        theme: {
          color: "#000000",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // handle UPI QR payment confirmation
  const handleUPIConfirm = async () => {
    if (!orderId) {
      alert("No order found");
      return;
    }

    setLoading(true);

    try {
      const createRes = await fetch(
        "http://localhost:3000/api/payments/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        }
      );

      const createData = await createRes.json();

      if (!createRes.ok) {
        throw new Error(createData.error || "Failed to create payment");
      }

      const options = {
        key: import.meta.env.RAZORPAY_KEY_ID,
        amount: createData.amount,
        currency: createData.currency,
        order_id: createData.razorpayOrderId,
        name: "Charbucks",
        description: `UPI Payment for Order ${orderId}`,
        method: {
          upi: true,
          card: false,
          netbanking: false,
          wallet: false,
        },
        handler: async function (response) {
          const verifyRes = await fetch(
            "http://localhost:3000/api/payments/verify",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId,
                method: "UPI",
              }),
            }
          );

          const verifyData = await verifyRes.json();

          if (!verifyRes.ok) {
            throw new Error(verifyData.error || "UPI verification failed");
          }

          setPaid(true);
          setTimeout(() => navigate("/"), 2000);
        },
        theme: {
          color: "#000000",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("UPI Payment failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // payment success screen
  if (paid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            Payment Successful
          </h1>
          <p className="text-secondary">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-surface min-h-screen">
      <Sidebar />

      <div className="ml-64 p-10 w-full">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-serif text-primary">
            Final Settlement
          </h1>

          <div className="bg-surface-low p-6 rounded-xl text-right">
            <p className="text-sm text-secondary">Total</p>
            <h2 className="text-3xl font-bold text-primary">
              ₹{total}
            </h2>
          </div>
        </div>

        {/* order info */}
        {orderId && (
          <p className="text-secondary mb-6 text-sm">
            Order ID: {orderId} | Table: {tableId}
          </p>
        )}

        {/* PAYMENT METHODS */}
        <div className="grid grid-cols-3 gap-6">

          {/* CASH */}
          <div
            onClick={() => !loading && handleOfflinePayment("Cash")}
            className={`bg-surface-low p-6 rounded-xl cursor-pointer hover:scale-105 transition
              ${selectedMethod === "Cash" ? "ring-2 ring-primary" : ""}
              ${loading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <h2 className="font-bold text-primary">Cash</h2>
            <p className="text-sm text-secondary">Pay using cash</p>
          </div>

          {/* CARD */}
          <div
            onClick={() => !loading && handleOfflinePayment("Digital")}
            className={`bg-surface-low p-6 rounded-xl cursor-pointer hover:scale-105 transition
              ${selectedMethod === "Digital" ? "ring-2 ring-primary" : ""}
              ${loading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <h2 className="font-bold text-primary">Card</h2>
            <p className="text-sm text-secondary">Debit / Credit</p>
          </div>

          {/* UPI QR */}
          <div className="bg-primary text-white p-6 rounded-xl">
            <h2 className="font-bold mb-4">UPI QR</h2>

            <div className="bg-white p-4 rounded-lg flex justify-center">
              <QRCodeCanvas value={upiLink} size={150} />
            </div>

            <p className="mt-4 text-sm">Scan to pay ₹{total}</p>

            <button
              onClick={() => !loading && handleUPIConfirm()}
              disabled={loading}
              className="mt-4 w-full bg-white text-primary font-bold py-2 rounded-lg
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Confirm UPI Payment"}
            </button>
          </div>

        </div>

        {/* loading indicator */}
        {loading && (
          <p className="mt-6 text-secondary text-sm">
            Opening payment gateway...
          </p>
        )}

      </div>
    </div>
  );
}