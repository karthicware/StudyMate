package com.studymate.backend.repository;

import com.studymate.backend.dto.SeatStatusDTO;
import com.studymate.backend.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Seat entity.
 * Provides CRUD operations and custom queries for seat management.
 */
@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    /**
     * Count total seats in a hall.
     *
     * @param hallId the ID of the study hall
     * @return total number of seats
     */
    @Query("SELECT COUNT(s) FROM Seat s WHERE s.hall.id = :hallId")
    int countByHallId(@Param("hallId") Long hallId);

    /**
     * Fetch seat map with current status including occupancy from active bookings.
     * A seat is marked as OCCUPIED if there's an active confirmed booking.
     *
     * @param hallId the ID of the study hall
     * @return list of seats with their current status
     */
    @Query("SELECT new com.studymate.backend.dto.SeatStatusDTO(" +
           "s.id, s.seatNumber, s.xCoord, s.yCoord, " +
           "CASE WHEN b.id IS NOT NULL THEN 'OCCUPIED' ELSE s.status END) " +
           "FROM Seat s LEFT JOIN Booking b ON s.id = b.seat.id " +
           "AND b.status = 'CONFIRMED' AND b.endTime > CURRENT_TIMESTAMP " +
           "WHERE s.hall.id = :hallId " +
           "ORDER BY s.seatNumber")
    List<SeatStatusDTO> findSeatMapByHallId(@Param("hallId") Long hallId);

    /**
     * Find all seats for a specific hall.
     *
     * @param hallId the ID of the study hall
     * @return list of seats in the hall
     */
    List<Seat> findByHallId(Long hallId);

    /**
     * Delete a seat by ID and hall ID.
     * This ensures that only seats belonging to the specified hall are deleted.
     *
     * @param id the seat ID
     * @param hallId the hall ID
     */
    void deleteByIdAndHallId(Long id, Long hallId);

    /**
     * Delete all seats for a specific hall.
     * Used when replacing entire seat configuration.
     *
     * @param hallId the hall ID
     */
    void deleteByHallId(Long hallId);
}
