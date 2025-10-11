/**
 * Utility classes and helper methods package.
 *
 * <p>Contains reusable utility classes and helper methods used across the application.</p>
 *
 * <h3>Purpose:</h3>
 * <ul>
 *   <li>Provide common utility functions</li>
 *   <li>Centralize helper methods to avoid code duplication</li>
 *   <li>Offer static utility methods for common operations</li>
 * </ul>
 *
 * <h3>Naming Conventions:</h3>
 * <ul>
 *   <li>Utility classes: {@code [Purpose]Utils} or {@code [Purpose]Helper}</li>
 *   <li>Make classes final with private constructor (prevent instantiation)</li>
 *   <li>Use static methods only</li>
 * </ul>
 *
 * <h3>Example:</h3>
 * <pre>
 * public final class DateUtils {
 *     private DateUtils() {
 *         throw new UnsupportedOperationException("Utility class");
 *     }
 *
 *     public static LocalDateTime now() {
 *         return LocalDateTime.now(ZoneOffset.UTC);
 *     }
 *
 *     public static String formatIso(LocalDateTime dateTime) {
 *         return dateTime.format(DateTimeFormatter.ISO_DATE_TIME);
 *     }
 * }
 * </pre>
 */
package com.studymate.backend.util;
