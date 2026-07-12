import { useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import "../styles/Cart.css";

import { CartContext } from "../context/cartContextValue";
import { useToast } from "../context/ToastContext";
import {
  getCartByUser,
  updateCartItem,
  deleteCartItem,
} from "../services/cartApi";

function Cart() {
  const { cartItems, setCartItems } = useContext(CartContext);
  const toast = useToast();
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    const fetchCart = async () => {
      if (!userId) return;
      try {
        const res = await getCartByUser();
        setCartItems(res.data.data);
      } catch {
        toast.error("Could not load your cart.");
      }
    };
    fetchCart();
  }, [setCartItems, userId]);

  const handleQuantity = async (itemId, quantity) => {
    try {
      const res = await updateCartItem(itemId, { quantity });
      setCartItems(cartItems.map((item) =>
        item.id === itemId ? res.data.data : item
      ));
    } catch {
      toast.error("Could not update quantity.");
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await deleteCartItem(itemId);
      setCartItems(cartItems.filter((item) => item.id !== itemId));
      toast.info("Item removed from cart.");
    } catch {
      toast.error("Could not remove item.");
    }
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0
  );

  return (
    <section className="cart-page page-container fade-up">
      <div className="page-header">
        <span className="eyebrow">🛒 Shopping bag</span>
        <h1>Your Cart</h1>
        <p>Review quantities before placing your SwiftMart order.</p>
      </div>

      {!user ? (
        <div className="empty-state">
          <span style={{ fontSize: "2.5rem" }}>🔒</span>
          <h2>Login required</h2>
          <p>Sign in to view your saved cart and checkout securely.</p>
          <Link to="/login" className="primary-link">Login</Link>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: "2.5rem" }}>🛒</span>
          <h2>Cart is empty</h2>
          <p>Explore products and add your favorites to the cart.</p>
          <Link to="/products" className="primary-link">Shop Products</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {cartItems.map((item) => (
              <article key={item.id} className="cart-card">
                <div className="cart-item-info">
                  <h3>{item.product_name}</h3>
                  <p>AED {Number(item.price).toFixed(2)} each</p>
                </div>

                <div className="cart-actions">
                  <button
                    className="qty-btn"
                    onClick={() => handleQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    aria-label={`Decrease ${item.product_name} quantity`}
                  >
                    −
                  </button>

                  <span className="qty-display">{item.quantity}</span>

                  <button
                    className="qty-btn"
                    onClick={() => handleQuantity(item.id, item.quantity + 1)}
                    aria-label={`Increase ${item.product_name} quantity`}
                  >
                    +
                  </button>

                  <button
                    className="remove-btn"
                    onClick={() => handleDelete(item.id)}
                    aria-label={`Remove ${item.product_name}`}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span className="cart-summary-count">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</span>
            </div>
            <strong className="cart-total">AED {subtotal.toFixed(2)}</strong>
            <Link to="/checkout" className="checkout-btn">
              Proceed to Checkout →
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}

export default Cart;
