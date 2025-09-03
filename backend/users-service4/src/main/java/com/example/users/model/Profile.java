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
    private LocalDate dob;

    private int age;

    @NotBlank
    private String sex;

    @NotBlank
    @Column(length = 100) // Increased length for BCrypt hash
    private String password;

    @ElementCollection
    @CollectionTable(name = "profile_phones", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "phone")
    private List<String> phones;

    @ElementCollection
    @CollectionTable(name = "profile_addresses", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "address")
    private List<String> addresses;
}