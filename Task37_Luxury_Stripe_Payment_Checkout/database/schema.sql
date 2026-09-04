
CREATE TABLE payment_transactions(
id BIGSERIAL PRIMARY KEY,
customer_name VARCHAR(100),
email VARCHAR(150),
amount DECIMAL(10,2),
payment_status VARCHAR(30) DEFAULT 'pending',
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payment_logs(
id BIGSERIAL PRIMARY KEY,
transaction_id BIGINT REFERENCES payment_transactions(id),
event TEXT,
created_at TIMESTAMP DEFAULT NOW()
);

SELECT payment_status, COUNT(*)
FROM payment_transactions
GROUP BY payment_status;
