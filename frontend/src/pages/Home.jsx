import { Link } from "react-router-dom";
import heroImage from "../assets/hero.png";
import "../styles/Home.css";

function Home() {
  const categories = [
    { name: "Laptops",     icon: "💻" },
    { name: "Accessories", icon: "🖱️" },
    { name: "Storage",     icon: "💾" },
    { name: "Networking",  icon: "🌐" },
    { name: "Audio",       icon: "🎧" },
  ];

  const features = [
    {
      num: "01",
      title: "Curated Catalog",
      desc: "Hand-picked, high-quality tech products organized for easy discovery.",
    },
    {
      num: "02",
      title: "Fast Checkout",
      desc: "Smooth cart-to-order flow powered by reliable microservices.",
    },
    {
      num: "03",
      title: "Live Order Tracking",
      desc: "Real-time status updates and notifications on every order.",
    },
  ];

  return (
    <section className="home-page fade-up">
      {/* ── Hero ─────────────────────────────────── */}
      <div className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">✦ Curated electronics store</span>
          <h1>SwiftMart</h1>
          <p>
            Discover laptops, accessories, storage, networking gear, and premium
            audio — all in one beautifully simple shopping experience.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="primary-link">
              Shop Now
            </Link>
            <Link to="/cart" className="secondary-link">
              View Cart
            </Link>
          </div>
        </div>

        <div className="hero-device" aria-hidden="true">
          <div className="hero-glow" />
          <img src={heroImage} alt="" />
        </div>
      </div>

      {/* ── Category strip ───────────────────────── */}
      <div className="section-label">Browse Categories</div>
      <div className="category-strip">
        {categories.map(({ name, icon }) => (
          <Link key={name} to="/products" className="category-chip">
            <span className="category-icon">{icon}</span>
            <span>{name}</span>
          </Link>
        ))}
      </div>

      {/* ── Feature grid ─────────────────────────── */}
      <div className="value-grid">
        {features.map(({ num, title, desc }) => (
          <article key={num} className="value-card">
            <span className="value-num">{num}</span>
            <h3>{title}</h3>
            <p>{desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Home;
