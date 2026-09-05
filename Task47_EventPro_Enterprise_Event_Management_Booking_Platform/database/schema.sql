
CREATE TABLE users(
id SERIAL PRIMARY KEY,
name VARCHAR(100),
email VARCHAR(150)
);

CREATE TABLE events(
id SERIAL PRIMARY KEY,
name VARCHAR(100),
category VARCHAR(100),
event_date DATE
);

CREATE TABLE tickets(
id SERIAL PRIMARY KEY,
event_id INT,
price DECIMAL(10,2)
);

CREATE TABLE bookings(
id SERIAL PRIMARY KEY,
user_id INT,
event_id INT,
status VARCHAR(50)
);

CREATE TABLE payments(
id SERIAL PRIMARY KEY,
booking_id INT,
amount DECIMAL(10,2)
);

CREATE TABLE reviews(
id SERIAL PRIMARY KEY,
event_id INT,
rating INT,
comment TEXT
);

CREATE TABLE notifications(
id SERIAL PRIMARY KEY,
message TEXT
);
