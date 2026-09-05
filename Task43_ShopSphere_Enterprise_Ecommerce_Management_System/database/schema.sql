
CREATE TABLE products(
id SERIAL PRIMARY KEY,
name VARCHAR(100),
category VARCHAR(100),
price DECIMAL(10,2),
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders(
id SERIAL PRIMARY KEY,
customer_name VARCHAR(100),
amount DECIMAL(10,2),
status VARCHAR(50)
);

CREATE TABLE customers(
id SERIAL PRIMARY KEY,
name VARCHAR(100),
email VARCHAR(150)
);

CREATE TABLE payments(
id SERIAL PRIMARY KEY,
order_id INT,
amount DECIMAL(10,2)
);

CREATE TABLE activity_logs(
id SERIAL PRIMARY KEY,
action TEXT,
created_at TIMESTAMP DEFAULT NOW()
);
