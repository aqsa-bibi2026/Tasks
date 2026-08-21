import React from "react";

function ProductItem({ product, onSelect }) {
  console.log("Rendering:", product.name);

  return (
    <div className="product-card">
      <div>
        <h3>{product.name}</h3>
        <p>{product.category}</p>
        <strong>${product.price}</strong>
      </div>

      <button onClick={() => onSelect(product)}>
        View
      </button>
    </div>
  );
}

export default React.memo(ProductItem);