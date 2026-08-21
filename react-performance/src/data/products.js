const categories = [
  "Electronics",
  "Clothing",
  "Books",
  "Home",
  "Sports",
];

const products = Array.from({ length: 1200 }, (_, index) => ({
  id: index + 1,
  name: `Product ${index + 1}`,
  category: categories[index % categories.length],
  price: Math.floor(Math.random() * 900) + 100,
}));

export default products;