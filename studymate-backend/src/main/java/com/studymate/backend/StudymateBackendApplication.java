package com.studymate.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication(exclude = {
	org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class,
	org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration.class
})
public class StudymateBackendApplication {

	private static final Logger logger = LoggerFactory.getLogger(StudymateBackendApplication.class);

	public static void main(String[] args) {
		logger.info("Starting StudyMate Backend Application...");
		SpringApplication.run(StudymateBackendApplication.class, args);
		logger.info("StudyMate Backend Application started successfully");
	}

}
