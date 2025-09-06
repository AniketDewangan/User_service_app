package com.example.users.dto;

import lombok.Data;

@Data
public class LoginResponse {
    private boolean success;
    private String message;
    private Long profileId;
    private String name;
    private String email;

    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public LoginResponse(boolean success, String message, Long profileId, String name, String email) {
        this.success = success;
        this.message = message;
        this.profileId = profileId;
        this.name = name;
        this.email = email;
    }
}
