package com.example.users.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.boot.availability.ApplicationAvailability;
import org.springframework.boot.availability.AvailabilityState;
import org.springframework.boot.availability.LivenessState;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health", description = "Health check endpoint")
public class HealthController {
    
    private final ApplicationAvailability availability;

    public HealthController(ApplicationAvailability availability) {
        this.availability = availability;
    }

    @GetMapping
    @Operation(summary = "Check service health", description = "Returns the health status of the service")
    public Map<String, Object> health() {
        Map<String, Object> healthDetails = new HashMap<>();
        healthDetails.put("status", "UP");
        healthDetails.put("livenessState", getState(availability.getLivenessState()));
        healthDetails.put("readinessState", getState(availability.getReadinessState()));
        return healthDetails;
    }

    private String getState(AvailabilityState state) {
        if (state instanceof LivenessState) {
            return ((LivenessState) state).toString();
        } else if (state instanceof ReadinessState) {
            return ((ReadinessState) state).toString();
        }
        return "UNKNOWN";
    }
}