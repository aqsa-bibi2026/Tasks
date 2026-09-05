
CREATE TABLE customers(
id SERIAL PRIMARY KEY,
name VARCHAR(100),
email VARCHAR(150)
);

CREATE TABLE accounts(
id SERIAL PRIMARY KEY,
customer_id INT,
account_type VARCHAR(50),
balance DECIMAL(12,2)
);

CREATE TABLE transactions(
id SERIAL PRIMARY KEY,
account_id INT,
amount DECIMAL(12,2),
type VARCHAR(50)
);

CREATE TABLE payments(
id SERIAL PRIMARY KEY,
transaction_id INT,
status VARCHAR(50)
);

CREATE TABLE loans(
id SERIAL PRIMARY KEY,
customer_id INT,
amount DECIMAL(12,2),
status VARCHAR(50)
);

CREATE TABLE activity_logs(
id SERIAL PRIMARY KEY,
action TEXT,
created_at TIMESTAMP DEFAULT NOW()
);
