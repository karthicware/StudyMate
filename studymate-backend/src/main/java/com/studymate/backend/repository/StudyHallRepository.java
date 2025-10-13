package com.studymate.backend.repository;

import com.studymate.backend.model.StudyHall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for StudyHall entity.
 * Provides CRUD operations for study halls.
 */
@Repository
public interface StudyHallRepository extends JpaRepository<StudyHall, Long> {

    /**
     * Find a study hall by owner ID.
     *
     * @param ownerId the owner's user ID
     * @return Optional containing the study hall if found
     */
    Optional<StudyHall> findByOwnerId(Long ownerId);

    /**
     * Update the seat count for a study hall.
     *
     * @param hallId the hall ID
     * @param seatCount the new seat count
     */
    @Modifying
    @Query("UPDATE StudyHall h SET h.seatCount = :seatCount, h.updatedAt = CURRENT_TIMESTAMP WHERE h.id = :hallId")
    void updateSeatCount(@Param("hallId") Long hallId, @Param("seatCount") Integer seatCount);
}
