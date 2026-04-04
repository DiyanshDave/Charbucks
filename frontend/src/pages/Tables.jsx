import { tables } from "../data/mockData";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Tables() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface min-h-screen flex">
      <Sidebar />

      <div className="ml-64 p-10 w-full">
        <h1 className="text-4xl font-serif text-primary mb-10">
          Floor Overview
        </h1>

        <div className="grid grid-cols-3 gap-8">
          {tables.map((table) => (
            <div
              key={table.id}
              onClick={() => navigate(`/order/${table.id}`)}
              className="bg-surface-low p-8 rounded-xl cursor-pointer hover:scale-105 transition"
            >
              <div className="text-primary font-bold text-lg">
                {table.name}
              </div>

              <div className="mt-6 w-full h-40 bg-white rounded-full flex items-center justify-center">
                🍽️
              </div>

              <div className="mt-4 text-secondary text-sm">
                Available
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}