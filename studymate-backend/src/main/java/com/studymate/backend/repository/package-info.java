/**
 * Data access repositories package.
 *
 * <p>Contains Spring Data JPA repository interfaces for database operations.</p>
 *
 * <h3>Purpose:</h3>
 * <ul>
 *   <li>Provide CRUD operations via Spring Data JPA</li>
 *   <li>Define custom query methods using method naming conventions</li>
 *   <li>Isolate data access logic from business logic</li>
 * </ul>
 *
 * <h3>Naming Conventions:</h3>
 * <ul>
 *   <li>Repository interfaces: {@code [Entity]Repository}</li>
 *   <li>Extend {@code JpaRepository<Entity, ID>}</li>
 *   <li>Use {@code @Repository} annotation (optional but recommended)</li>
 * </ul>
 *
 * <h3>Example:</h3>
 * <pre>
 * &#64;Repository
 * public interface UserRepository extends JpaRepository<User, Long> {
 *     Optional<User> findByEmail(String email);
 *     List<User> findByRole(String role);
 *     boolean existsByEmail(String email);
 * }
 * </pre>
 */
package com.studymate.backend.repository;
