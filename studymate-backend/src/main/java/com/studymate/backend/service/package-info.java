/**
 * Business logic service layer package.
 *
 * <p>Contains service interfaces and implementations for business operations.</p>
 *
 * <h3>Purpose:</h3>
 * <ul>
 *   <li>Implement core business logic and rules</li>
 *   <li>Coordinate between repositories and controllers</li>
 *   <li>Manage transactions and validations</li>
 * </ul>
 *
 * <h3>Naming Conventions:</h3>
 * <ul>
 *   <li>Service interfaces: {@code [Entity]Service}</li>
 *   <li>Service implementations: {@code [Entity]ServiceImpl}</li>
 *   <li>Use {@code @Service} and {@code @Transactional} annotations</li>
 *   <li>Use constructor injection with {@code @RequiredArgsConstructor}</li>
 * </ul>
 *
 * <h3>Example:</h3>
 * <pre>
 * public interface UserService {
 *     List<User> findAll();
 *     User save(User user);
 * }
 *
 * &#64;Service
 * &#64;Transactional
 * &#64;RequiredArgsConstructor
 * public class UserServiceImpl implements UserService {
 *     private final UserRepository userRepository;
 *
 *     &#64;Override
 *     public List<User> findAll() {
 *         return userRepository.findAll();
 *     }
 * }
 * </pre>
 */
package com.studymate.backend.service;
