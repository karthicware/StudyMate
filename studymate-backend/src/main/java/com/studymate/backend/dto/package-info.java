/**
 * Data Transfer Objects (DTOs) package.
 *
 * <p>Contains classes for transferring data between application layers,
 * particularly for API request and response payloads.</p>
 *
 * <h3>Purpose:</h3>
 * <ul>
 *   <li>Decouple external API contracts from internal entity models</li>
 *   <li>Provide validation for incoming requests</li>
 *   <li>Control what data is exposed in responses</li>
 * </ul>
 *
 * <h3>Naming Conventions:</h3>
 * <ul>
 *   <li>Request DTOs: {@code Create[Entity]Request}, {@code Update[Entity]Request}</li>
 *   <li>Response DTOs: {@code [Entity]Response}, {@code [Entity]DetailResponse}</li>
 *   <li>Generic wrappers: {@code ApiResponse<T>}, {@code PagedResponse<T>}</li>
 * </ul>
 *
 * <h3>Example:</h3>
 * <pre>
 * public class CreateUserRequest {
 *     &#64;NotBlank
 *     private String email;
 *
 *     &#64;NotBlank
 *     private String firstName;
 * }
 *
 * public class UserResponse {
 *     private Long id;
 *     private String email;
 *     private String firstName;
 *     private LocalDateTime createdAt;
 * }
 * </pre>
 */
package com.studymate.backend.dto;
