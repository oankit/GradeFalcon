-- ////////// Drop tables if they already exist: /////////////////

DROP TABLE IF EXISTS instructor CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS student CASCADE;
DROP TABLE IF EXISTS exam CASCADE;
DROP TABLE IF EXISTS solution CASCADE;
DROP TABLE IF EXISTS enrollment CASCADE;
DROP TABLE IF EXISTS studentResults CASCADE;
DROP TABLE IF EXISTS scannedExam CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TYPE IF EXISTS feedback_status CASCADE;

-- ////////// Create tables: /////////////////

CREATE TABLE instructor (
    auth0_id text primary key,
    email text not null,
    name text not null
);

CREATE TABLE classes (
    class_id serial primary key,
    instructor_id text,
    course_id text,
    course_name text,
    unique (instructor_id, course_id)
);

CREATE TABLE student (
    student_id text primary key,
    auth0_id text NOT NULL unique,
    email text unique,
    name text
);

CREATE TABLE exam (
    exam_id serial primary key,
    class_id int not null,
    exam_title text, 
    total_questions int,
    total_marks int,
    mean double precision,
    high double precision,
    low double precision,
    upper_quartile double precision,
    lower_quartile double precision,
    page_count int,
    file_size int,
    foreign key (class_id) references classes(class_id)
);

CREATE TABLE solution (
    solution_id serial primary key,
    exam_id int not null,
    answers text[],
    filepath text,
    marking_schemes JSONB,
    foreign key (exam_id) references exam(exam_id)
);
CREATE TABLE enrollment(
    enrollment_id serial primary key,
    class_id int,
    student_id text,
    foreign key (class_id) references classes(class_id),
    foreign key (student_id) references student(student_id)
);

CREATE TABLE studentResults(
    sheet_int serial primary key,
    student_id text not null,
    exam_id int not null,
    chosen_answers text[],
    grade int,
    filepath text,
    foreign key (exam_id) references exam(exam_id),
    foreign key (student_id) references student(student_id)
);

CREATE TABLE scannedExam(
    scan_id serial primary key,
    exam_id int not null,
    page_count int,
    filepath text,
    foreign key (exam_id) references exam(exam_id)
);

CREATE TYPE feedback_status as enum ('Not Done', 'Done', 'In Progress');

CREATE TABLE feedback(
    feedback_id serial primary key,
    sheet_id int not null,
    student_id text not null,
    feedback_text text not null,
    feedback_time timestamp not null,
    status feedback_status not null,
    foreign key (student_id) references student(student_id)
);

CREATE TABLE admins(
    auth0_id text primary key,
    email text not null,
    name text not null
);

CREATE TABLE "session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");

CREATE INDEX "IDX_session_expire" ON "session" ("expire");

-- ////////// Test value insertion: /////////////////

INSERT INTO instructor (auth0_id, email, name) VALUES (
    'auth0|6696d634bec6c6d1cc3e2274', 'edu.instructor1@gmail.com', 'Instructor'
);

INSERT INTO student (student_id, auth0_id, email, name) VALUES 
    ('1', 'auth0|669eca4940b5ccd84d81caa2', 'stu.example0@gmail.com', 'Student'),
    ('2', 'auth0|669ecaa440b5ccd84d81caa3', 'stu.example1@gmail.com', 'Student II');

INSERT INTO classes (instructor_id, course_id, course_name) VALUES
    ('auth0|6696d634bec6c6d1cc3e2274', 'TEST100', 'Database Test'),
    ('auth0|6696d634bec6c6d1cc3e2274', 'TEST200', 'Database Test 2');

INSERT INTO exam (class_id, exam_title, total_questions, total_marks) VALUES
    (1,'Midterm', 50, 50),
    (1, 'Final', 5, 100),
    (2, 'Midterm - 200', 50, 50),  -- Exams for TEST200
    (2, 'Final - 200', 100, 100);  -- Exams for TEST200

INSERT INTO solution (exam_id) VALUES
    (1),
    (2);

INSERT INTO enrollment (class_id, student_id) VALUES 
    (1, 1),
    (1, 2),
    (2, 1),  -- Enrollments for TEST200
    (2, 2);  -- Enrollments for TEST200

INSERT INTO studentResults (student_id, exam_id, grade) VALUES
    (1, 1, 50),
    (2, 1, 11),
    (1, 2, 69),
    (1, 3, 85),  -- Results for TEST200 Midterm
    (2, 3, 90),  -- Results for TEST200 Midterm
    (1, 4, 78),  -- Results for TEST200 Final
    (2, 4, 88);  -- Results for TEST200 Final

INSERT INTO scannedExam (exam_id) VALUES (
    1
);

INSERT INTO feedback (sheet_id, student_id, feedback_text, feedback_time, status) VALUES (
    1, '1', 'Q5 is incorrectly marked', CURRENT_TIMESTAMP, 'Not Done'
);

INSERT INTO admins (auth0_id, email, name) VALUES (
    'auth0|6697fe650e143a8cede3ec08', 'sys.controller0@gmail.com', 'Admin'
);
