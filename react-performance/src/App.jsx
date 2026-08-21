import { useCallback, useMemo, useState } from "react";
import ProductList from "./components/ProductList";
import products from "./data/products";
import "./App.css";

function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = useMemo(() => {
    return ["All", ...new Set(products.map((product) => product.category))];
  }, []);

  const filteredProducts = useMemo(() => {
    console.log("Filtering products...");

    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  const handleSelect = useCallback((product) => {
    setSelectedProduct(product);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="badge">REACT PERFORMANCE</p>

          <h1>1000+ Product Performance Demo</h1>

          <p className="subtitle">
            Optimized with useMemo, useCallback and React.memo
          </p>
        </div>
      </header>

      <main className="container">
        <section className="controls">
          <div className="control">
            <label>Search Products</label>

            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="control">
            <label>Category</label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <span>Total Products</span>
            <strong>{products.length}</strong>
          </div>

          <div className="stat-card">
            <span>Filtered Products</span>
            <strong>{filteredProducts.length}</strong>
          </div>

          <div className="stat-card">
            <span>Optimization</span>
            <strong>Enabled</strong>
          </div>
        </section>

        {selectedProduct && (
          <div className="selected-product">
            <div>
              <span>Selected Product</span>
              <h2>{selectedProduct.name}</h2>
              <p>
                {selectedProduct.category} · ${selectedProduct.price}
              </p>
            </div>

            <button onClick={() => setSelectedProduct(null)}>
              Close
            </button>
          </div>
        )}

        <div className="list-header">
          <h2>Products</h2>

          <span>
            Showing {filteredProducts.length} of {products.length}
          </span>
        </div>

        <ProductList
          products={filteredProducts}
          onSelect={handleSelect}
        />
      </main>
    </div>
  );
}

export default App;