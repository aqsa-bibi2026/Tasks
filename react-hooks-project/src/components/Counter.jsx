import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <section className="counter">
      <h2>Counter App</h2>

      <h1>{count}</h1>

      <div className="buttons">
        <button onClick={() => setCount(count + 1)}>Increment</button>

        <button onClick={() => setCount(count - 1)}>Decrement</button>

        <button onClick={() => setCount(0)}>Reset</button>
      </div>
    </section>
  );
}

export default Counter;