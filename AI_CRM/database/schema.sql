CREATE TABLE customers(
id BIGSERIAL PRIMARY KEY,
name TEXT,
email TEXT UNIQUE,
phone TEXT,
company TEXT,
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tickets(
id BIGSERIAL PRIMARY KEY,
customer_id BIGINT REFERENCES customers(id),
title TEXT,
description TEXT,
status TEXT DEFAULT 'Open',
priority TEXT,
created_at TIMESTAMP DEFAULT NOW()
);
