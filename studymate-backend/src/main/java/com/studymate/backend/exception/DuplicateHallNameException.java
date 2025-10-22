package com.studymate.backend.exception;

/**
 * Exception thrown when attempting to create a study hall with a name that already exists for the owner.
 */
public class DuplicateHallNameException extends RuntimeException {

    public DuplicateHallNameException(String hallName) {
        super(String.format("A hall with the name '%s' already exists", hallName));
    }

    public DuplicateHallNameException(String hallName, Throwable cause) {
        super(String.format("A hall with the name '%s' already exists", hallName), cause);
    }
}
