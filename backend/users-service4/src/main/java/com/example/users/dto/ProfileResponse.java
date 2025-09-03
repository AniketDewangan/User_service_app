package com.example.users.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ProfileResponse {
    private Long id;
    private String name;
    private String email;
    private LocalDate dob;
    private int age;
    private String sex;
    private String password;
    private List<String> phones;
    private List<String> addresses;
}
