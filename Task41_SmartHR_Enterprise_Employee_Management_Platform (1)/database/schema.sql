
CREATE TABLE employees(
id SERIAL PRIMARY KEY,
name VARCHAR(100),
department VARCHAR(100),
role VARCHAR(100),
created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE attendance(
id SERIAL PRIMARY KEY,
employee_id INT,
status VARCHAR(50),
date DATE
);


CREATE TABLE leave_requests(
id SERIAL PRIMARY KEY,
employee_id INT,
reason TEXT,
status VARCHAR(50)
);


CREATE TABLE payroll(
id SERIAL PRIMARY KEY,
employee_id INT,
salary DECIMAL(10,2),
month VARCHAR(30)
);


CREATE TABLE activity_logs(
id SERIAL PRIMARY KEY,
action TEXT,
created_at TIMESTAMP DEFAULT NOW()
);
