import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../styles/Checkout.css";

import { CartContext }  from "../context/cartContextValue";
import { useToast }     from "../context/ToastContext";
import { createOrder }  from "../services/orderApi";
import { clearCart }    from "../services/cartApi";

function Checkout() {
  const { cartItems, setCartItems } = useContext(CartContext);
  const toast    = useToast();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const totalAmount = cartItems.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0
  );

  const handlePlaceOrder = async () => {
    if (!user?.id) {
      toast.warning("Please login to place an order.");
      navigate("/login");
      return;
    }
    try {
      await createOrder({ items: cartItems });
      await clearCart();
      setCartItems([]);
      toast.success("🎉 Order placed successfully!");
      navigate("/orders");
    } catch (error) {
      console.log(error);
      toast.error("Could not place order. Please try again.");
    }
  };

  return (
    <section className="checkout-page page-container fade-up">
      <div className="page-header">
        <span className="eyebrow">🔐 Secure checkout</span>
        <h1>Checkout</h1>
        <p>Confirm your SwiftMart order details before placing the order.</p>
      </div>

      {!user?.id ? (
        <div className="empty-state">
          <span style={{ fontSize: "2.5rem" }}>🔒</span>
          <h2>Login required</h2>
          <p>Sign in to place orders from your saved cart.</p>
          <Link to="/login" className="primary-link">Login</Link>
        </div>
      ) : (
        <div className="checkout-layout">
          <div className="checkout-list">
            {cartItems.length === 0 ? (
              <div className="empty-state">
                <span style={{ fontSize: "2rem" }}>🛒</span>
                <h2>Cart is empty</h2>
                <p>Add products to your cart before checking out.</p>
                <Link to="/products" className="primary-link">Browse Products</Link>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="checkout-card">
                  <div>
                    <h4>{item.product_name}</h4>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <strong>AED {Number(item.price).toFixed(2)}</strong>
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <aside className="checkout-summary">
              <span>Order total</span>
              <h3 className="checkout-total">
                AED {totalAmount.toFixed(2)}
              </h3>
              <div className="checkout-meta">
                {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={cartItems.length === 0}
              >
                Place Order →
              </button>
            </aside>
          )}
        </div>
      )}
    </section>
  );
}

export default Checkout;
