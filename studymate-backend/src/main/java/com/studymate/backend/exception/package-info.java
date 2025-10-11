/**
 * Custom exceptions and exception handlers package.
 *
 * <p>Contains custom exception classes and global exception handling logic.</p>
 *
 * <h3>Purpose:</h3>
 * <ul>
 *   <li>Define business-specific exception types</li>
 *   <li>Handle exceptions globally with {@code @ControllerAdvice}</li>
 *   <li>Return consistent error responses</li>
 * </ul>
 *
 * <h3>Naming Conventions:</h3>
 * <ul>
 *   <li>Exception classes: {@code [Context]Exception} (e.g., {@code ResourceNotFoundException})</li>
 *   <li>Handler classes: {@code GlobalExceptionHandler}, {@code [Feature]ExceptionHandler}</li>
 *   <li>Use {@code @ControllerAdvice} and {@code @ExceptionHandler}</li>
 * </ul>
 *
 * <h3>Example:</h3>
 * <pre>
 * public class ResourceNotFoundException extends RuntimeException {
 *     public ResourceNotFoundException(String message) {
 *         super(message);
 *     }
 * }
 *
 * &#64;ControllerAdvice
 * public class GlobalExceptionHandler {
 *     &#64;ExceptionHandler(ResourceNotFoundException.class)
 *     public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
 *         return ResponseEntity.status(HttpStatus.NOT_FOUND)
 *             .body(new ErrorResponse(ex.getMessage()));
 *     }
 * }
 * </pre>
 */
package com.studymate.backend.exception;
