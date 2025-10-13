package com.studymate.backend.repository;

import com.studymate.backend.model.OwnerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for OwnerProfile entity.
 * Provides database access methods for owner profile operations.
 */
@Repository
public interface OwnerProfileRepository extends JpaRepository<OwnerProfile, Long> {

    /**
     * Find owner profile by user ID
     * @param userId the user ID
     * @return Optional containing OwnerProfile if found
     */
    Optional<OwnerProfile> findByUserId(Long userId);

    /**
     * Check if owner profile exists for a user
     * @param userId the user ID
     * @return true if profile exists, false otherwise
     */
    boolean existsByUserId(Long userId);
}
