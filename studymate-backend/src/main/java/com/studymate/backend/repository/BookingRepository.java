package com.studymate.backend.repository;

import com.studymate.backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

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

    /**
     * Calculate total revenue from confirmed bookings in a hall within a date range.
     *
     * @param hallId the ID of the study hall
     * @param startDate the start date (inclusive)
     * @param endDate the end date (inclusive)
     * @return total revenue, or 0 if no bookings exist
     */
    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Booking b " +
           "WHERE b.seat.hall.id = :hallId " +
           "AND b.status = 'CONFIRMED' " +
           "AND CAST(b.startTime AS LocalDate) >= :startDate " +
           "AND CAST(b.startTime AS LocalDate) <= :endDate")
    BigDecimal sumRevenueByHallAndDateRange(
            @Param("hallId") Long hallId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Find busiest hours by booking count for a hall within a date range.
     *
     * @param hallId the ID of the study hall
     * @param startDate the start date (inclusive)
     * @param endDate the end date (inclusive)
     * @return list of objects containing hour and count
     */
    @Query("SELECT HOUR(b.startTime) as hour, COUNT(b) as count " +
           "FROM Booking b " +
           "WHERE b.seat.hall.id = :hallId " +
           "AND b.status = 'CONFIRMED' " +
           "AND CAST(b.startTime AS LocalDate) >= :startDate " +
           "AND CAST(b.startTime AS LocalDate) <= :endDate " +
           "GROUP BY HOUR(b.startTime) " +
           "ORDER BY count DESC")
    List<Object[]> findBusiestHoursByHall(
            @Param("hallId") Long hallId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Find all confirmed bookings for a hall within a date range.
     *
     * @param hallId the ID of the study hall
     * @param startDate the start date (inclusive)
     * @param endDate the end date (inclusive)
     * @return list of bookings
     */
    @Query("SELECT b FROM Booking b " +
           "WHERE b.seat.hall.id = :hallId " +
           "AND b.status = 'CONFIRMED' " +
           "AND CAST(b.startTime AS LocalDate) >= :startDate " +
           "AND CAST(b.startTime AS LocalDate) <= :endDate " +
           "ORDER BY b.startTime")
    List<Booking> findByHallAndDateRange(
            @Param("hallId") Long hallId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Find recent bookings for a user, ordered by start time descending.
     *
     * @param userId the ID of the user
     * @return list of recent bookings (limited by query)
     */
    @Query("SELECT b FROM Booking b " +
           "WHERE b.user.id = :userId " +
           "ORDER BY b.startTime DESC " +
           "LIMIT 10")
    List<Booking> findRecentBookingsByUserId(@Param("userId") Long userId);
}
