import {
  Link
}
from "react-router-dom";

import { getProductImage } from "../utils/productImages";

function ProductCard({
  product
}) {

  return (

    <article className="product-card">

      <div className="product-visual">
        <img
          src={getProductImage(product)}
          alt={product.name}
        />
      </div>

      <div className="product-card-body">

        <div className="product-card-meta">
          <span>{product.category}</span>
          <span>{product.stock_quantity > 0 ? "In stock" : "Out of stock"}</span>
        </div>

        <h3>
          {product.name}
        </h3>

        <p>
          {product.description}
        </p>

        <div className="product-card-footer">
          <strong>
            AED {Number(product.price).toFixed(2)}
          </strong>

          <Link
            to={`/products/${product.id}`}
          >
            View
          </Link>
        </div>

      </div>

    </article>

  );

}

export default ProductCard;
