import { useCart } from "../context/useCart";

function CartItems() {
  const { cart, removeFromCart } = useCart();

  return (
    <div>
      <h2>Shopping Cart</h2>

      {cart.length === 0 ? (
        <p>Cart is Empty</p>
      ) : (
        cart.map((item) => (
          <div key={item.id}>
            <p>{item.name}</p>

            <button onClick={() => removeFromCart(item.id)}>
              Remove
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default CartItems;