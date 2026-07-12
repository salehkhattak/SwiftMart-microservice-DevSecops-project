import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getProductById } from "../services/productApi";
import { addToCart } from "../services/cartApi";

import { CartContext } from "../context/cartContextValue";
import { getProductImage } from "../utils/productImages";
import { useToast } from "../context/ToastContext";

import "../styles/Products.css";

function ProductDetails() {
  const { id }                              = useParams();
  const [product, setProduct]               = useState(null);
  const [loading, setLoading]               = useState(true);
  const [addingToCart, setAddingToCart]     = useState(false);
  const { cartItems, setCartItems }         = useContext(CartContext);
  const toast                               = useToast();
  const navigate                            = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getProductById(id);
        setProduct(response.data.data);
      } catch {
        toast.error("Could not load product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      toast.warning("Please login to add items to cart.");
      navigate("/login");
      return;
    }
    setAddingToCart(true);
    try {
      const response = await addToCart({ product_id: product.id, quantity: 1 });
      setCartItems([...cartItems, response.data.data]);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add to cart.");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="spinner-wrap">
          <div className="spinner" />
          <p>Loading product…</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <span style={{ fontSize: "2.5rem" }}>🔍</span>
          <h2>Product not found</h2>
          <p>This product may have been removed or the link is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="product-detail page-container fade-up">
      <div className="product-detail-visual">
        <img src={getProductImage(product)} alt={product.name} />
      </div>

      <div className="product-detail-info">
        <span className="eyebrow">{product.category}</span>
        <h1>{product.name}</h1>
        <p>{product.description}</p>

        <div className="product-facts">
          <span>AED {Number(product.price).toFixed(2)}</span>
          <span className={product.stock_quantity > 0 ? "in-stock" : "out-stock"}>
            {product.stock_quantity > 0 ? `✓ In stock (${product.stock_quantity})` : "✕ Out of stock"}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={addingToCart || product.stock_quantity === 0}
        >
          {addingToCart ? "Adding…" : "Add to Cart"}
        </button>
      </div>
    </section>
  );
}

export default ProductDetails;
