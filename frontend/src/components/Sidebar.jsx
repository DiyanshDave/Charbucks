import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openSection, setOpenSection] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const isActive = (path) => location.pathname === path;

  const navItem = (label, path) => (
    <div
      onClick={() => navigate(path)}
      className={`pl-4 py-2 rounded-full cursor-pointer text-sm transition
        ${isActive(path)
          ? "bg-white text-primary font-semibold"
          : "opacity-70 hover:opacity-100 hover:bg-white/10"
        }`}
    >
      {label}
    </div>
  );

  const sectionHeader = (label, section) => (
    <div
      onClick={() => toggleSection(section)}
      className={`flex justify-between items-center p-3 rounded-full cursor-pointer transition
        ${openSection === section
          ? "bg-white text-primary font-semibold"
          : "opacity-70 hover:opacity-100 hover:bg-white/10"
        }`}
    >
      <span>{label}</span>
      <span className="text-xs">
        {openSection === section ? "▲" : "▼"}
      </span>
    </div>
  );

  return (
    <>
      {/* overlay — clicking outside closes sidebar */}
      {expanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setExpanded(false);
            setOpenSection(null);
          }}
        />
      )}

      {/* sidebar */}
      <div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={`h-screen bg-primary text-white p-6 rounded-r-2xl fixed z-50
          overflow-y-auto transition-all duration-300 ease-in-out
          ${expanded ? "w-64 shadow-2xl" : "w-16"}`}
      >

        {/* brand */}
        <h1
          onClick={() => navigate("/")}
          className="font-serif text-xl mb-10 cursor-pointer whitespace-nowrap overflow-hidden"
        >
          {expanded ? "Charbucks" : "C"}
        </h1>

        {/* nav items — only show when expanded */}
        {expanded && (
          <div className="space-y-2">

            {/* Floor Plan */}
            <div
              onClick={() => navigate("/")}
              className={`p-3 rounded-full cursor-pointer transition
                ${isActive("/")
                  ? "bg-white text-primary font-semibold"
                  : "opacity-70 hover:opacity-100 hover:bg-white/10"
                }`}
            >
              Floor Plan
            </div>

            {/* Orders */}
            {sectionHeader("Orders", "orders")}
            {openSection === "orders" && (
              <div className="space-y-1 ml-2">
                {navItem("All Orders", "/orders")}
                {navItem("Kitchen Display", "/kitchen")}
              </div>
            )}

            {/* Products */}
            {sectionHeader("Products", "products")}
            {openSection === "products" && (
              <div className="space-y-1 ml-2">
                {navItem("All Products", "/products")}
                {navItem("Add Product", "/products/add")}
              </div>
            )}

            {/* Payments */}
            {sectionHeader("Payments", "payments")}
            {openSection === "payments" && (
              <div className="space-y-1 ml-2">
                {navItem("Payment History", "/payments")}
                {navItem("Payment Methods", "/payment-methods")}
              </div>
            )}

            {/* Sessions */}
            {sectionHeader("Sessions", "sessions")}
            {openSection === "sessions" && (
              <div className="space-y-1 ml-2">
                {navItem("All Sessions", "/sessions")}
                {navItem("Open Session", "/sessions/open")}
              </div>
            )}

            {/* Reports */}
            {sectionHeader("Reports", "reports")}
            {openSection === "reports" && (
              <div className="space-y-1 ml-2">
                {navItem("Dashboard", "/reports/dashboard")}
                {navItem("Full Reports", "/reports")}
              </div>
            )}

            {/* Account */}
            {sectionHeader("Account", "account")}
            {openSection === "account" && (
              <div className="space-y-1 ml-2">
                {navItem("Login", "/login")}
                {navItem("Signup", "/signup")}
              </div>
            )}

          </div>
        )}

        {/* collapsed state icons */}
        {!expanded && (
          <div className="space-y-6 mt-4 flex flex-col items-center opacity-70">
            <span title="Floor Plan">🏠</span>
            <span title="Orders">📋</span>
            <span title="Products">🍕</span>
            <span title="Payments">💳</span>
            <span title="Sessions">🕐</span>
            <span title="Reports">📊</span>
            <span title="Account">👤</span>
          </div>
        )}

      </div>

      {/* spacer so content doesnt go under sidebar */}
      <div className={`transition-all duration-300 ${expanded ? "ml-64" : "ml-16"}`} />
    </>
  );
}