package com.example.users.service;

import com.example.users.model.Profile;
import com.example.users.repository.ProfileRepository;
import com.example.users.util.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProfileService {
    
    @Autowired
    private ProfileRepository profileRepository;
    
    @Autowired
    private PasswordUtil passwordUtil;

    public List<Profile> getAllProfiles() {
        return profileRepository.findAll();
    }

    public Optional<Profile> getProfileById(Long id) {
        return profileRepository.findById(id);
    }

    public Optional<Profile> getProfileByEmail(String email) {
        return profileRepository.findByEmail(email);
    }

    public Profile saveOrUpdateProfile(Profile profile) {
        return profileRepository.save(profile);
    }
    
    public Profile saveOrUpdateProfileWithPassword(Profile profile, String plainPassword) {
        // Hash the password before saving
        String hashedPassword = passwordUtil.hashPassword(plainPassword);
        profile.setPassword(hashedPassword);
        return profileRepository.save(profile);
    }

    public boolean verifyPassword(String plainPassword, String hashedPassword) {
        return passwordUtil.matches(plainPassword, hashedPassword);
    }

    public void deleteProfile(Long id) {
        profileRepository.deleteById(id);
    }
}