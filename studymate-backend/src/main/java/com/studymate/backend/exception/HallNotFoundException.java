package com.studymate.backend.exception;

/**
 * Exception thrown when a study hall is not found.
 * Results in HTTP 404 Not Found response.
 */
public class HallNotFoundException extends RuntimeException {

    public HallNotFoundException(String message) {
        super(message);
    }

    public HallNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
