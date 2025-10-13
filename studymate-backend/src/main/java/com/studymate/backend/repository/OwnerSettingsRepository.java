package com.studymate.backend.repository;

import com.studymate.backend.model.OwnerSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for OwnerSettings entity.
 * Story 1.21: Owner Settings API Implementation
 */
@Repository
public interface OwnerSettingsRepository extends JpaRepository<OwnerSettings, Long> {
    /**
     * Find owner settings by owner ID.
     *
     * @param ownerId the owner's user ID
     * @return Optional containing settings if found
     */
    Optional<OwnerSettings> findByOwnerId(Long ownerId);
}
