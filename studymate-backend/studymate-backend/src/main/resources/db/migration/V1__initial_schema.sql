-- V1__initial_schema.sql
-- Initial database schema for StudyMate application
-- Creates core tables: users, study_halls, seats, bookings
-- Created: 2025-10-11

-- ==============================================
-- Users Table
-- ==============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL CHECK (role IN ('OWNER', 'STUDENT')),
    hall_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- Study Halls Table
-- ==============================================
CREATE TABLE study_halls (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hall_name VARCHAR(255) NOT NULL,
    seat_count INTEGER NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- Seats Table
-- ==============================================
CREATE TABLE seats (
    id SERIAL PRIMARY KEY,
    hall_id INTEGER NOT NULL REFERENCES study_halls(id) ON DELETE CASCADE,
    seat_number VARCHAR(50) NOT NULL,
    x_coord INTEGER,
    y_coord INTEGER,
    status VARCHAR(50) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BOOKED', 'LOCKED', 'MAINTENANCE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hall_id, seat_number)
);

-- ==============================================
-- Bookings Table
-- ==============================================
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seat_id INTEGER NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    payment_id INTEGER,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    qr_code_hash VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- Add foreign key for users.hall_id (after study_halls exists)
-- ==============================================
ALTER TABLE users
ADD CONSTRAINT fk_users_hall_id
FOREIGN KEY (hall_id) REFERENCES study_halls(id) ON DELETE SET NULL;

-- ==============================================
-- Performance Indexes
-- ==============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_study_halls_owner_id ON study_halls(owner_id);
CREATE INDEX idx_seats_hall_id ON seats(hall_id);
CREATE INDEX idx_seats_status ON seats(status);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_seat_id ON bookings(seat_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_time_range ON bookings(start_time, end_time);
