
CREATE TABLE students(
id SERIAL PRIMARY KEY,
name VARCHAR(100),
email VARCHAR(150)
);

CREATE TABLE instructors(
id SERIAL PRIMARY KEY,
name VARCHAR(100),
specialization VARCHAR(100)
);

CREATE TABLE courses(
id SERIAL PRIMARY KEY,
name VARCHAR(100),
category VARCHAR(100),
instructor_id INT
);

CREATE TABLE enrollments(
id SERIAL PRIMARY KEY,
student_id INT,
course_id INT
);

CREATE TABLE assignments(
id SERIAL PRIMARY KEY,
course_id INT,
title TEXT
);

CREATE TABLE certificates(
id SERIAL PRIMARY KEY,
student_id INT,
course_id INT
);

CREATE TABLE activity_logs(
id SERIAL PRIMARY KEY,
action TEXT
);
