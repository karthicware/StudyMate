package com.studymate.backend.repository;

import com.studymate.backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

/**
 * Repository for Booking entity.
 * Provides CRUD operations and custom queries for booking management.
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Count active bookings in a hall.
     * Active bookings are those with CONFIRMED status and end time in the future.
     *
     * @param hallId the ID of the study hall
     * @return number of active bookings
     */
    @Query("SELECT COUNT(b) FROM Booking b " +
           "WHERE b.seat.hall.id = :hallId " +
           "AND b.status = 'CONFIRMED' " +
           "AND b.endTime > CURRENT_TIMESTAMP")
    int countActiveBookingsByHallId(@Param("hallId") Long hallId);

    /**
     * Calculate total revenue from all confirmed bookings in a hall.
     *
     * @param hallId the ID of the study hall
     * @return total revenue, or 0 if no bookings exist
     */
    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Booking b " +
           "WHERE b.seat.hall.id = :hallId " +
           "AND b.status = 'CONFIRMED'")
    BigDecimal sumRevenueByHallId(@Param("hallId") Long hallId);
}
