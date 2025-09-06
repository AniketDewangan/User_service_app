package com.example.users.model;

import lombok.Data;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

@Data
@Entity
@Table(name = "profiles")
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @Email
    @NotBlank
    @Column(unique = true)
    private String email;

    @NotNull
    private String dob;

    private int age;

    @NotBlank
    private String sex;

    @NotBlank
    @Column(length = 100)
    private String password;

    @Column(name = "update_count", nullable = false)
    private int updateCount = 0; // Track number of updates

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProfileHistory> history; // History of updates

    @ElementCollection
    @CollectionTable(name = "profile_phones", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "phone")
    private List<String> phones;

    @ElementCollection
    @CollectionTable(name = "profile_addresses", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "address")
    private List<String> addresses;

    // Method to increment update count
    public void incrementUpdateCount() {
        this.updateCount++;
    }

    public String getCurrentValuesAsJson() {
        return String.format("{\"name\":\"%s\",\"email\":\"%s\",\"sex\":\"%s\",\"age\":%d,\"dob\":\"%s\",\"phones\":%s,\"addresses\":%s}",
                name, email, sex, age, dob, phones.toString(), addresses.toString());
    }
}