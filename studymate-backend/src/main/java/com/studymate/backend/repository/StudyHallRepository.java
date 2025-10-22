package com.studymate.backend.repository;

import com.studymate.backend.model.StudyHall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for StudyHall entity.
 * Provides CRUD operations for study halls.
 */
@Repository
public interface StudyHallRepository extends JpaRepository<StudyHall, Long> {

    /**
     * Find a study hall by owner ID (backward compatibility - returns first hall).
     * @deprecated Use findAllByOwnerId(Long) for multiple halls support
     * @param ownerId the owner's user ID
     * @return Optional containing the first study hall if found
     */
    @Deprecated
    Optional<StudyHall> findByOwnerId(Long ownerId);

    /**
     * Find all study halls owned by a specific owner.
     *
     * @param ownerId the owner's user ID
     * @return List of study halls owned by the owner, ordered by createdAt DESC
     */
    @Query("SELECT h FROM StudyHall h WHERE h.owner.id = :ownerId ORDER BY h.createdAt DESC")
    List<StudyHall> findAllByOwnerId(@Param("ownerId") Long ownerId);

    /**
     * Find a specific study hall by owner ID and hall name.
     *
     * @param ownerId the owner's user ID
     * @param hallName the hall name
     * @return Optional containing the study hall if found
     */
    @Query("SELECT h FROM StudyHall h WHERE h.owner.id = :ownerId AND h.hallName = :hallName")
    Optional<StudyHall> findByOwnerIdAndHallName(@Param("ownerId") Long ownerId, @Param("hallName") String hallName);

    /**
     * Check if a study hall with the given owner ID and hall name exists.
     *
     * @param ownerId the owner's user ID
     * @param hallName the hall name
     * @return true if a hall with this name exists for this owner, false otherwise
     */
    @Query("SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END FROM StudyHall h WHERE h.owner.id = :ownerId AND h.hallName = :hallName")
    boolean existsByOwnerIdAndHallName(@Param("ownerId") Long ownerId, @Param("hallName") String hallName);

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
