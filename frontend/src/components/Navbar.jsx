import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/authContextValue";
import { CartContext } from "../context/cartContextValue";
import "../styles/Navbar.css";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/cart", label: "Cart" },
    { to: "/orders", label: "Orders" },
    { to: "/notifications", label: "Alerts" },
  ];

  const cartCount = cartItems?.length || 0;

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <span className="logo-mark">S</span>
        <span className="logo-name">SwiftMart</span>
      </Link>

      <div className="nav-links">
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`nav-link${location.pathname === to ? " active" : ""}${label === "Cart" ? " nav-cart-link" : ""}`}
          >
            {label === "Cart" ? (
              <>
                Cart
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </>
            ) : (
              label
            )}
          </Link>
        ))}

        {user ? (
          <>
            <span className="nav-user">
              <span className="nav-user-avatar">
                {user.name?.charAt(0).toUpperCase()}
              </span>
              {user.name}
            </span>
            <button className="nav-button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-auth-link nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-cta">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
