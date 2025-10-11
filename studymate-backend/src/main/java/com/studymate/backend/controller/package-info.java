/**
 * REST API controllers package.
 *
 * <p>Contains REST endpoint controllers that handle HTTP requests and responses.</p>
 *
 * <h3>Purpose:</h3>
 * <ul>
 *   <li>Define REST API endpoints and routes</li>
 *   <li>Handle HTTP request/response mapping</li>
 *   <li>Validate input and return appropriate HTTP status codes</li>
 * </ul>
 *
 * <h3>Naming Conventions:</h3>
 * <ul>
 *   <li>Controller classes: {@code [Entity]Controller} or {@code [Entity]sController} (plural for collections)</li>
 *   <li>Use {@code @RestController} and {@code @RequestMapping}</li>
 *   <li>Use constructor injection with {@code @RequiredArgsConstructor}</li>
 *   <li>Return {@code ResponseEntity<T>} for explicit HTTP status control</li>
 * </ul>
 *
 * <h3>Example:</h3>
 * <pre>
 * &#64;RestController
 * &#64;RequestMapping("/api/users")
 * &#64;RequiredArgsConstructor
 * public class UsersController {
 *     private final UserService userService;
 *
 *     &#64;GetMapping
 *     public ResponseEntity<List<User>> getAllUsers() {
 *         return ResponseEntity.ok(userService.findAll());
 *     }
 *
 *     &#64;PostMapping
 *     public ResponseEntity<User> createUser(&#64;Valid &#64;RequestBody User user) {
 *         return ResponseEntity.status(HttpStatus.CREATED)
 *             .body(userService.save(user));
 *     }
 * }
 * </pre>
 */
package com.studymate.backend.controller;
