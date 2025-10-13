package com.studymate.backend.repository;

import com.studymate.backend.model.User;
import com.studymate.backend.model.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    /**
     * Find all non-deleted users by hall ID with pagination and optional filters.
     */
    @Query("SELECT u FROM User u " +
           "WHERE u.deletedAt IS NULL " +
           "AND (:hallId IS NULL OR u.studyHall.id = :hallId) " +
           "AND (:role IS NULL OR u.role = :role) " +
           "AND (:search IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> findActiveUsersByHallAndFilters(
            @Param("hallId") Long hallId,
            @Param("role") UserRole role,
            @Param("search") String search,
            Pageable pageable);

    /**
     * Find a non-deleted user by ID.
     */
    @Query("SELECT u FROM User u WHERE u.id = :id AND u.deletedAt IS NULL")
    Optional<User> findActiveById(@Param("id") Long id);

    /**
     * Find a non-deleted user by ID that belongs to a specific hall.
     */
    @Query("SELECT u FROM User u WHERE u.id = :userId AND u.deletedAt IS NULL " +
           "AND u.studyHall.id = :hallId")
    Optional<User> findActiveByIdAndHallId(@Param("userId") Long userId, @Param("hallId") Long hallId);
}
