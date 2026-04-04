import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [expanded, setExpanded]       = useState(false);
  const [openSection, setOpenSection] = useState(null);

  const isActive  = (path) => location.pathname === path;
  const toggleSec = (sec) => setOpenSection(openSection === sec ? null : sec);

  const NavItem = ({ label, path }) => (
    <div
      onClick={() => navigate(path)}
      className={`pl-4 py-2 rounded-xl cursor-pointer text-sm transition-all duration-150
        ${isActive(path)
          ? "bg-white/20 text-white font-semibold"
          : "text-white/60 hover:text-white hover:bg-white/10"
        }`}
    >
      {label}
    </div>
  );

  const SectionHeader = ({ label, section }) => (
    <div
      onClick={() => toggleSec(section)}
      className={`flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150
        ${openSection === section
          ? "bg-white/20 text-white font-semibold"
          : "text-white/70 hover:text-white hover:bg-white/10"
        }`}
    >
      <span className="text-sm">{label}</span>
      <span className={`text-[10px] transition-transform duration-200 ${openSection === section ? "rotate-180" : ""}`}>
        ▼
      </span>
    </div>
  );

  return (
    <>
      {expanded && (
        <div className="fixed inset-0 z-40" onClick={() => { setExpanded(false); setOpenSection(null); }} />
      )}

      <div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => { setExpanded(false); setOpenSection(null); }}
        className={`h-screen bg-[#1e3a1e] text-white fixed z-50 flex flex-col
          overflow-hidden transition-all duration-300 ease-in-out
          ${expanded ? "w-64 shadow-2xl" : "w-16"}`}
      >
        {/* Brand */}
        <div
          onClick={() => navigate("/")}
          className="px-4 py-6 cursor-pointer flex items-center gap-3 border-b border-white/10 flex-shrink-0"
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-serif font-bold text-sm flex-shrink-0">
            C
          </div>
          {expanded && (
            <span className="font-serif text-lg font-semibold whitespace-nowrap overflow-hidden animate-fade-in">
              Charbucks
            </span>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-4 px-2">
          {expanded ? (
            <div className="space-y-1">
              <div
                onClick={() => navigate("/")}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150
                  ${isActive("/") ? "bg-white/20 text-white font-semibold" : "text-white/70 hover:text-white hover:bg-white/10"}`}
              >
                <span>🏠</span>
                <span className="text-sm">Floor Plan</span>
              </div>

              {[
                { label: "Orders",   section: "orders",   items: [{ label: "All Orders", path: "/orders" }, { label: "Kitchen Display", path: "/kitchen" }] },
                { label: "Products", section: "products", items: [{ label: "All Products", path: "/products" }, { label: "Add Product", path: "/products/add" }] },
                { label: "Payments", section: "payments", items: [{ label: "Payment History", path: "/payments" }] },
                { label: "Sessions", section: "sessions", items: [{ label: "All Sessions", path: "/sessions" }, { label: "Open Session", path: "/sessions/open" }] },
                { label: "Reports",  section: "reports",  items: [{ label: "Dashboard", path: "/reports/dashboard" }, { label: "Full Reports", path: "/reports" }] },
                { label: "Account",  section: "account",  items: [{ label: "Login", path: "/login" }, { label: "Signup", path: "/signup" }] },
              ].map(({ label, section, items }) => (
                <div key={section}>
                  <SectionHeader label={label} section={section} />
                  {openSection === section && (
                    <div className="mt-1 space-y-0.5 ml-2 animate-fade-in">
                      {items.map(item => <NavItem key={item.path} {...item} />)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5 mt-2">
              {[
                { icon: "🏠", title: "Floor Plan" },
                { icon: "📋", title: "Orders" },
                { icon: "🍕", title: "Products" },
                { icon: "💳", title: "Payments" },
                { icon: "🕐", title: "Sessions" },
                { icon: "📊", title: "Reports" },
                { icon: "👤", title: "Account" },
              ].map(({ icon, title }) => (
                <span key={title} title={title} className="text-white/60 hover:text-white cursor-pointer text-xl transition-colors">
                  {icon}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}