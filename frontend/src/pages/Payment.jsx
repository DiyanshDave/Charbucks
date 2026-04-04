import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import Sidebar from "../components/Sidebar";

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const total = state?.total || 0;

  const upiLink = `upi://pay?pa=test@upi&pn=Charbucks&am=${total}`;

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

        {/* PAYMENT METHODS */}
        <div className="grid grid-cols-3 gap-6">

          {/* CASH */}
          <div className="bg-surface-low p-6 rounded-xl cursor-pointer hover:scale-105 transition">
            <h2 className="font-bold text-primary">Cash</h2>
            <p className="text-sm text-secondary">
              Pay using cash
            </p>
          </div>

          {/* CARD */}
          <div className="bg-surface-low p-6 rounded-xl cursor-pointer hover:scale-105 transition">
            <h2 className="font-bold text-primary">Card</h2>
            <p className="text-sm text-secondary">
              Debit / Credit
            </p>
          </div>

          {/* UPI QR */}
          <div className="bg-primary text-white p-6 rounded-xl">
            <h2 className="font-bold mb-4">UPI QR</h2>

            <div className="bg-white p-4 rounded-lg flex justify-center">
              <QRCodeCanvas value={upiLink} size={150} />
            </div>

            <p className="mt-4 text-sm">
              Scan to pay ₹{total}
            </p>
          </div>

        </div>

        {/* COMPLETE BUTTON */}
        <button
          onClick={() => navigate("/")}
          className="mt-10 bg-primary text-white px-8 py-4 rounded-full"
        >
          Payment Done
        </button>

      </div>
    </div>
  );
}