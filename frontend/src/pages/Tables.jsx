import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import BASE_URL from "../config/api";

export default function Tables() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/tables`);
        const data = await res.json();
        setTables(data);
      } catch (err) {
        console.error("Failed to fetch tables:", err);
        setError("Failed to load tables");
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const getStatusColor = (status) => {
    if (status === "available") return "text-green-500";
    if (status === "occupied") return "text-red-500";
    return "text-secondary";
  };

  const getStatusEmoji = (status) => {
    if (status === "available") return "🍽️";
    if (status === "occupied") return "🔴";
    return "🍽️";
  };

  return (
    <div className="bg-surface min-h-screen flex">
      <Sidebar />

      <div className="ml-16 p-10 w-full">
        <h1 className="text-4xl font-serif text-primary mb-10">
          Floor Overview
        </h1>

        {loading && <p className="text-secondary">Loading tables...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-3 gap-8">
            {tables.map((table) => (
              <div
                key={table.id}
                onClick={() => {
                  if (table.status === "available") {
                    navigate(`/order/${table.id}`);
                  } else {
                    alert(`${table.name} is currently occupied`);
                  }
                }}
                className={`bg-surface-low p-8 rounded-xl transition
                  ${table.status === "available"
                    ? "cursor-pointer hover:scale-105"
                    : "cursor-not-allowed opacity-60"
                  }`}
              >
                <div className="text-primary font-bold text-lg">
                  {table.name}
                </div>
                <div className="text-secondary text-sm mt-1">
                  {table.seats} seats
                </div>
                <div className="mt-6 w-full h-40 bg-white rounded-full flex items-center justify-center text-4xl">
                  {getStatusEmoji(table.status)}
                </div>
                <div className={`mt-4 text-sm font-semibold ${getStatusColor(table.status)}`}>
                  {table.status === "available" ? "Available" : "Occupied"}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && tables.length === 0 && (
          <p className="text-secondary">No tables found.</p>
        )}
      </div>
    </div>
  );
}