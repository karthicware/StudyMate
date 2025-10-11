package com.studymate.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthController {

	@GetMapping
	public ResponseEntity<Map<String, String>> health() {
		Map<String, String> response = new HashMap<>();
		response.put("status", "OK");
		response.put("service", "studymate-backend");
		response.put("version", "0.0.1-SNAPSHOT");
		return ResponseEntity.ok(response);
	}
}
