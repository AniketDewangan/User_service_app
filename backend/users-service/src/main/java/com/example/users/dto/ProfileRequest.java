package com.example.users.dto;

import lombok.Data;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

@Data
public class ProfileRequest {
    @NotBlank
    private String name;
    
    @Email
    @NotBlank
    private String email; // Added email field

    @NotNull
    private String dob;

    @NotBlank
    private String sex;
    
    @NotBlank
    private String password;

    private List<String> phones;
    private List<String> addresses;
}