
CREATE TABLE users(
id SERIAL PRIMARY KEY,
name VARCHAR(100),
email VARCHAR(150),
role VARCHAR(50)
);


CREATE TABLE expenses(
id SERIAL PRIMARY KEY,
title VARCHAR(200),
amount DECIMAL(10,2),
category VARCHAR(100),
status VARCHAR(50) DEFAULT 'Pending',
created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE invoices(
id SERIAL PRIMARY KEY,
invoice_number VARCHAR(100),
amount DECIMAL(10,2),
status VARCHAR(50)
);


CREATE TABLE budgets(
id SERIAL PRIMARY KEY,
department VARCHAR(100),
limit_amount DECIMAL(10,2)
);


CREATE TABLE transaction_logs(
id SERIAL PRIMARY KEY,
action TEXT,
created_at TIMESTAMP DEFAULT NOW()
);
