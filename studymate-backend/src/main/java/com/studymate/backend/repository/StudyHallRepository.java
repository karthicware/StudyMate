package com.studymate.backend.repository;

import com.studymate.backend.model.StudyHall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for StudyHall entity.
 * Provides CRUD operations for study halls.
 */
@Repository
public interface StudyHallRepository extends JpaRepository<StudyHall, Long> {
}
