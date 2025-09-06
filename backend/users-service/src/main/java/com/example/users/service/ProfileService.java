package com.example.users.service;

import com.example.users.model.Profile;
import com.example.users.model.ProfileHistory;
import com.example.users.repository.ProfileHistoryRepository;
import com.example.users.repository.ProfileRepository;
import com.example.users.util.PasswordUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProfileService {
    
    @Autowired
    private ProfileRepository profileRepository;
    
    @Autowired
    private ProfileHistoryRepository profileHistoryRepository;
    
    @Autowired
    private PasswordUtil passwordUtil;
    
    @Autowired
    private ObjectMapper objectMapper;

    public List<Profile> getAllProfiles() {
        return profileRepository.findAll();
    }

    public Optional<Profile> getProfileById(Long id) {
        return profileRepository.findById(id);
    }

    public Optional<Profile> getProfileByEmail(String email) {
        return profileRepository.findByEmail(email);
    }

    @Transactional
    public Profile saveOrUpdateProfile(Profile profile) {
        return profileRepository.save(profile);
    }
    
    @Transactional
    public Profile saveOrUpdateProfileWithPassword(Profile profile, String plainPassword) {
        String hashedPassword = passwordUtil.hashPassword(plainPassword);
        profile.setPassword(hashedPassword);
        return profileRepository.save(profile);
    }

    @Transactional
    public Profile updateProfileWithHistory(Profile existingProfile, Profile updatedProfile, String previousValuesJson) {
        // Increment update count
        existingProfile.incrementUpdateCount();
        
        // Update profile fields
        existingProfile.setName(updatedProfile.getName());
        existingProfile.setEmail(updatedProfile.getEmail());
        existingProfile.setDob(updatedProfile.getDob());
        existingProfile.setAge(updatedProfile.getAge());
        existingProfile.setSex(updatedProfile.getSex());
        existingProfile.setPhones(updatedProfile.getPhones());
        existingProfile.setAddresses(updatedProfile.getAddresses());
        
        // Save the updated profile
        Profile savedProfile = profileRepository.save(existingProfile);
        
        // Create history entry
        ProfileHistory history = new ProfileHistory(
            savedProfile, 
            previousValuesJson, 
            savedProfile.getUpdateCount()
        );
        profileHistoryRepository.save(history);
        
        return savedProfile;
    }

    public boolean verifyPassword(String plainPassword, String hashedPassword) {
        return passwordUtil.matches(plainPassword, hashedPassword);
    }

    @Transactional
    public void deleteProfile(Long id) {
        // First delete history to avoid foreign key constraints
        List<ProfileHistory> history = profileHistoryRepository.findByProfileId(id);
        profileHistoryRepository.deleteAll(history);
        
        // Then delete the profile
        profileRepository.deleteById(id);
    }

    public List<ProfileHistory> getProfileHistory(Long profileId) {
        return profileHistoryRepository.findByProfileIdOrderByUpdatedAtDesc(profileId);
    }

    public String convertToJson(Profile profile) throws JsonProcessingException {
        return objectMapper.writeValueAsString(profile);
    }
}