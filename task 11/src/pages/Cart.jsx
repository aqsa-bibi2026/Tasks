import ProductList from "../components/ProductList";
import CartItems from "../components/CartItems";

function Cart() {
  return (
    <div className="page">
      <h1>Shopping Cart</h1>

      <ProductList />

      <hr />

      <CartItems />
    </div>
  );
}

export default Cart;