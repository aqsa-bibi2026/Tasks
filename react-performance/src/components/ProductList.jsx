import ProductItem from "./ProductItem";

function ProductList({ products, onSelect }) {
  return (
    <div className="product-list">
      {products.map((product) => (
        <ProductItem
          key={product.id}
          product={product}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export default ProductList;