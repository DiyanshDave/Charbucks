import { BrowserRouter, Routes, Route } from "react-router-dom";
import Tables from "./pages/Tables";
import Order from "./pages/Order";
import Payment from "./pages/Payment";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Tables />} />
        <Route path="/order/:tableId" element={<Order />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;