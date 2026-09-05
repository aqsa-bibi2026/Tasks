
CREATE TABLE vehicles(
id SERIAL PRIMARY KEY,
model VARCHAR(100),
vehicle_number VARCHAR(50),
status VARCHAR(50),
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE drivers(
id SERIAL PRIMARY KEY,
name VARCHAR(100),
phone VARCHAR(50)
);

CREATE TABLE trips(
id SERIAL PRIMARY KEY,
vehicle_id INT,
destination VARCHAR(100),
status VARCHAR(50)
);

CREATE TABLE fuel_records(
id SERIAL PRIMARY KEY,
vehicle_id INT,
amount DECIMAL(10,2)
);

CREATE TABLE maintenance(
id SERIAL PRIMARY KEY,
vehicle_id INT,
description TEXT,
status VARCHAR(50)
);

CREATE TABLE activity_logs(
id SERIAL PRIMARY KEY,
action TEXT,
created_at TIMESTAMP DEFAULT NOW()
);
