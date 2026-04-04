import { tables } from "../data/mockData";
import { useNavigate } from "react-router-dom";

export default function Tables() {
  const navigate = useNavigate();

  return (
    <div className="p-6 grid grid-cols-2 gap-4">
      {tables.map((table) => (
        <div
          key={table.id}
          onClick={() => navigate(`/order/${table.id}`)}
          className="bg-blue-500 text-white p-6 rounded-xl text-center cursor-pointer"
        >
          {table.name}
        </div>
      ))}
    </div>
  );
}