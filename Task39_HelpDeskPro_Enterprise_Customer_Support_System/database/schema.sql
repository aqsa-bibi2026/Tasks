
CREATE TABLE users(
id SERIAL PRIMARY KEY,
name VARCHAR(100),
email VARCHAR(150),
role VARCHAR(50)
);


CREATE TABLE tickets(
id SERIAL PRIMARY KEY,
title VARCHAR(200),
customer VARCHAR(100),
priority VARCHAR(30),
status VARCHAR(30) DEFAULT 'Open',
created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE ticket_comments(
id SERIAL PRIMARY KEY,
ticket_id INT,
comment TEXT
);


CREATE TABLE activity_logs(
id SERIAL PRIMARY KEY,
action TEXT,
created_at TIMESTAMP DEFAULT NOW()
);
