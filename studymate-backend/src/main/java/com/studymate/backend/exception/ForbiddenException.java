package com.studymate.backend.exception;

/**
 * Exception thrown when a user attempts to access a resource they don't have permission to access.
 * Results in HTTP 403 Forbidden response.
 */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }

    public ForbiddenException(String message, Throwable cause) {
        super(message, cause);
    }
}
