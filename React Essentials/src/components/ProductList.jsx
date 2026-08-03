import { useCart } from "../context/useCart";

function ProductList() {
  const { addToCart } = useCart();

  const products = [
    { id: 1, name: "Laptop" },
    { id: 2, name: "Mouse" },
    { id: 3, name: "Keyboard" },
  ];

  return (
    <div>
      <h2>Products</h2>

      {products.map((product) => (
        <div key={product.id}>
          <p>{product.name}</p>

          <button onClick={() => addToCart(product)}>
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}

export default ProductList;