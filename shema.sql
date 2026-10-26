CREATE TYPE user_role AS ENUM ('Student', 'Employer', 'Admin');
CREATE TYPE user_status AS ENUM ('Active', 'Pending', 'Rejected');
CREATE TYPE year_level_enum AS ENUM ('1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year');
CREATE TYPE job_type_enum AS ENUM ('Internship', 'OJT');
CREATE TYPE job_status AS ENUM ('Pending', 'Published', 'Rejected');
CREATE TYPE application_status AS ENUM ('Submitted', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected');

CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    status user_status NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE companies (
    company_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    company_name VARCHAR(150) NOT NULL,
    contact_email VARCHAR(150) NOT NULL,
    website VARCHAR(200),
    location VARCHAR(120),
    about TEXT,
    reviewed_by INT,
    CONSTRAINT fk_companies_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_companies_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE student_profiles (
    student_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    course_id INT NOT NULL,
    year_level year_level_enum NOT NULL,
    skills TEXT,
    bio TEXT,
    resume_file VARCHAR(255),
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_student_course FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE RESTRICT
);

CREATE TABLE job_postings (
    job_id SERIAL PRIMARY KEY,
    company_id INT NOT NULL,
    course_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    location VARCHAR(120),
    job_type job_type_enum NOT NULL,
    slots INT DEFAULT 1,
    deadline DATE,
    status job_status NOT NULL DEFAULT 'Pending',
    description TEXT,
    requirements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_jobs_company FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    CONSTRAINT fk_jobs_course FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE RESTRICT
);

CREATE TABLE applications (
    application_id SERIAL PRIMARY KEY,
    job_id INT NOT NULL,
    student_id INT NOT NULL,
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status application_status NOT NULL DEFAULT 'Submitted',
    note TEXT,
    CONSTRAINT uk_job_student UNIQUE (job_id, student_id),
    CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES job_postings(job_id) ON DELETE CASCADE,
    CONSTRAINT fk_applications_student FOREIGN KEY (student_id) REFERENCES student_profiles(student_id) ON DELETE CASCADE
);

CREATE TABLE saved_opportunities (
    student_id INT NOT NULL,
    job_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, job_id),
    CONSTRAINT fk_saved_student FOREIGN KEY (student_id) REFERENCES student_profiles(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_job FOREIGN KEY (job_id) REFERENCES job_postings(job_id) ON DELETE CASCADE
);

CREATE TABLE announcements (
    announcement_id SERIAL PRIMARY KEY,
    posted_by INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    date_posted DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT fk_announcements_admin FOREIGN KEY (posted_by) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(250) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
