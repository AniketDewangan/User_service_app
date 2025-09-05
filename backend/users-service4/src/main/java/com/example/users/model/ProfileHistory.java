package com.example.users.model;

import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "profile_history")
public class ProfileHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    private String name;
    private String email;
    private String sex;
    private String passwordHash; // Store hashed password for history

    @Column(columnDefinition = "TEXT") // Store JSON representation of previous values
    private String previousValues;

    private LocalDate updatedAt;
    private int updateCount;

    // Default constructor
    public ProfileHistory() {}

    // Constructor for creating history entry
    public ProfileHistory(Profile profile, String previousValuesJson, int updateCount) {
        this.profile = profile;
        this.name = profile.getName();
        this.email = profile.getEmail();
        this.sex = profile.getSex();
        this.passwordHash = profile.getPassword();
        this.previousValues = previousValuesJson;
        this.updatedAt = LocalDate.now();
        this.updateCount = updateCount;
    }
}
