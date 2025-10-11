/**
 * Spring configuration classes package.
 *
 * <p>Contains Spring configuration beans and custom configurations.</p>
 *
 * <h3>Purpose:</h3>
 * <ul>
 *   <li>Define Spring beans and component configurations</li>
 *   <li>Configure security, CORS, and other cross-cutting concerns</li>
 *   <li>Customize Spring Boot auto-configuration</li>
 * </ul>
 *
 * <h3>Naming Conventions:</h3>
 * <ul>
 *   <li>Configuration classes: {@code [Feature]Config} (e.g., {@code SecurityConfig})</li>
 *   <li>Use {@code @Configuration} annotation</li>
 *   <li>Use {@code @Bean} for explicit bean definitions</li>
 * </ul>
 *
 * <h3>Example:</h3>
 * <pre>
 * &#64;Configuration
 * &#64;EnableWebSecurity
 * public class SecurityConfig {
 *     &#64;Bean
 *     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
 *         http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
 *         return http.build();
 *     }
 * }
 * </pre>
 */
package com.studymate.backend.config;
