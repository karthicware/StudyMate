package com.studymate.backend.exception;

/**
 * Exception thrown when a seat is not found.
 * Results in HTTP 404 Not Found response.
 */
public class SeatNotFoundException extends RuntimeException {

    public SeatNotFoundException(String message) {
        super(message);
    }

    public SeatNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
