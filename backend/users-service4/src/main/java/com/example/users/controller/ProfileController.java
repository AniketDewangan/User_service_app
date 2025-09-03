package com.example.users.controller;


import com.example.users.dto.LoginRequest;
import com.example.users.dto.LoginResponse;
import com.example.users.dto.ProfileRequest;
import com.example.users.dto.ProfileResponse;
import com.example.users.model.Profile;
import com.example.users.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/profiles")
@Tag(name = "Profiles", description = "Endpoints for profile management")
public class ProfileController {
    
    @Autowired
    private ProfileService profileService;

    @GetMapping
    @Operation(summary = "Get all profiles", description = "Retrieves all profiles")
    public ResponseEntity<List<ProfileResponse>> getAllProfiles() {
        List<Profile> profiles = profileService.getAllProfiles();
        List<ProfileResponse> response = profiles.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get profile by ID", description = "Retrieves profile information by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile found"),
        @ApiResponse(responseCode = "404", description = "Profile not found")
    })
    public ResponseEntity<?> getProfileById(@PathVariable Long id) {
        Optional<Profile> profile = profileService.getProfileById(id);
        if (profile.isPresent()) {
            return ResponseEntity.ok(convertToResponse(profile.get()));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found");
        }
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Get profile by email", description = "Retrieves profile information by email")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile found"),
        @ApiResponse(responseCode = "404", description = "Profile not found")
    })
    public ResponseEntity<?> getProfileByEmail(@PathVariable String email) {
        Optional<Profile> profile = profileService.getProfileByEmail(email);
        if (profile.isPresent()) {
            return ResponseEntity.ok(convertToResponse(profile.get()));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found");
        }
    }
    
    
    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticates a user by email and password")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials"),
        @ApiResponse(responseCode = "404", description = "Email not found")
    })
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        Optional<Profile> profileOptional = profileService.getProfileByEmail(loginRequest.getEmail());
        
        if (profileOptional.isEmpty()) {
            // Email not found - ask to register
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new LoginResponse(false, "Email not found. Please register first."));
        }
        
        Profile profile = profileOptional.get();
        boolean passwordMatches = profileService.verifyPassword(loginRequest.getPassword(), profile.getPassword());
        
        if (!passwordMatches) {
            // Password is wrong
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse(false, "Incorrect password. Please try again."));
        }
        
        // Login successful
        return ResponseEntity.ok(new LoginResponse(
            true, 
            "Login successful", 
            profile.getId(), 
            profile.getName(), 
            profile.getEmail()
        ));
    }
    
    

    @PostMapping
    @Operation(summary = "Create a new profile", description = "Creates a new profile")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Profile created successfully"),
        @ApiResponse(responseCode = "400", description = "Email already exists")
    })
    public ResponseEntity<?> createProfile(@Valid @RequestBody ProfileRequest profileRequest) {
        // Check if email already exists
        if (profileService.getProfileByEmail(profileRequest.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Email already exists: " + profileRequest.getEmail());
        }

        Profile profile = convertToEntity(profileRequest);
        // Save with password hashing
        Profile savedProfile = profileService.saveOrUpdateProfileWithPassword(profile, profileRequest.getPassword());
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToResponse(savedProfile));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update profile", description = "Updates an existing profile")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
        @ApiResponse(responseCode = "404", description = "Profile not found")
    })
    public ResponseEntity<?> updateProfile(
            @PathVariable Long id, 
            @Valid @RequestBody ProfileRequest profileRequest) {
        
        Optional<Profile> existingProfile = profileService.getProfileById(id);
        if (existingProfile.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found");
        }

        // Check if email is being changed to one that already exists (excluding current profile)
        Optional<Profile> profileWithEmail = profileService.getProfileByEmail(profileRequest.getEmail());
        if (profileWithEmail.isPresent() && !profileWithEmail.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Email already exists: " + profileRequest.getEmail());
        }

        Profile profile = convertToEntity(profileRequest);
        profile.setId(id); // Set the ID for update
        
        // Save with password hashing
        Profile savedProfile = profileService.saveOrUpdateProfileWithPassword(profile, profileRequest.getPassword());
        return ResponseEntity.ok(convertToResponse(savedProfile));
    }

    @PostMapping("/{id}/verify-password")
    @Operation(summary = "Verify password", description = "Verifies if the provided password matches the stored hash")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Password verification result"),
        @ApiResponse(responseCode = "404", description = "Profile not found")
    })
    public ResponseEntity<?> verifyPassword(
            @PathVariable Long id,
            @RequestBody PasswordVerificationRequest request) {
        
        Optional<Profile> profile = profileService.getProfileById(id);
        if (profile.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found");
        }

        boolean isMatch = profileService.verifyPassword(request.getPassword(), profile.get().getPassword());
        
        return ResponseEntity.ok(new PasswordVerificationResponse(isMatch));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete profile", description = "Deletes a profile")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Profile not found")
    })
    public ResponseEntity<?> deleteProfile(@PathVariable Long id) {
        Optional<Profile> profile = profileService.getProfileById(id);
        if (profile.isPresent()) {
            profileService.deleteProfile(id);
            return ResponseEntity.ok("Profile deleted successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found");
        }
    }

    @GetMapping("/test")
    @Operation(summary = "Test endpoint", description = "Simple test endpoint")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Profile controller is working!");
    }

    private Profile convertToEntity(ProfileRequest request) {
        Profile profile = new Profile();
        profile.setName(request.getName());
        profile.setEmail(request.getEmail());
        profile.setDob(request.getDob());
        
        // Calculate age from date of birth
        if (request.getDob() != null) {
            int age = Period.between(request.getDob(), LocalDate.now()).getYears();
            profile.setAge(age);
        }
        
        profile.setSex(request.getSex());
        // Password will be hashed in the service layer
        profile.setPassword(""); // Set empty string, will be replaced with hash
        profile.setPhones(request.getPhones());
        profile.setAddresses(request.getAddresses());
        return profile;
    }

    private ProfileResponse convertToResponse(Profile profile) {
        ProfileResponse response = new ProfileResponse();
        response.setId(profile.getId());
        response.setName(profile.getName());
        response.setEmail(profile.getEmail());
        response.setDob(profile.getDob());
        response.setAge(profile.getAge());
        response.setSex(profile.getSex());
        response.setPassword("********"); // Mask the password in response
        response.setPhones(profile.getPhones());
        response.setAddresses(profile.getAddresses());
        return response;
    }

    // DTO for password verification request
    public static class PasswordVerificationRequest {
        private String password;

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    // DTO for password verification response
    public static class PasswordVerificationResponse {
        private boolean matches;

        public PasswordVerificationResponse(boolean matches) {
            this.matches = matches;
        }

        public boolean isMatches() {
            return matches;
        }

        public void setMatches(boolean matches) {
            this.matches = matches;
        }
    }
}