/**
 * Domain model entities package.
 *
 * <p>Contains JPA entity classes that represent database tables.</p>
 *
 * <h3>Purpose:</h3>
 * <ul>
 *   <li>Define database schema through JPA annotations</li>
 *   <li>Represent core business domain objects</li>
 *   <li>Map to database tables with proper relationships</li>
 * </ul>
 *
 * <h3>Naming Conventions:</h3>
 * <ul>
 *   <li>Entity classes: Singular noun (e.g., {@code User}, {@code Course})</li>
 *   <li>Table names: Plural snake_case (e.g., {@code users}, {@code courses})</li>
 *   <li>Use {@code @Table(name = "...")} for explicit table naming</li>
 * </ul>
 *
 * <h3>Example:</h3>
 * <pre>
 * &#64;Entity
 * &#64;Table(name = "users")
 * &#64;Data
 * public class User {
 *     &#64;Id
 *     &#64;GeneratedValue(strategy = GenerationType.IDENTITY)
 *     private Long id;
 *
 *     &#64;Column(nullable = false, unique = true)
 *     private String email;
 * }
 * </pre>
 */
package com.studymate.backend.model;
