import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import "./styles/Global.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(

  <AuthProvider>

    <BrowserRouter>

      <CartProvider>

        <ToastProvider>
          <App />
        </ToastProvider>

      </CartProvider>

    </BrowserRouter>

  </AuthProvider>

);
