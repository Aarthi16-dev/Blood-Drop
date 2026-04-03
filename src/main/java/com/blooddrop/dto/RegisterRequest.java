package com.blooddrop.dto;

import com.blooddrop.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String password;

    private Role role;
    private String bloodGroup;

    private String city;
    private String pinCode;

    private Integer age;
    private String gender;
    private Double weight;
    private String healthIssues;

    // Optional (can be ignored from frontend)
    private String location;
    private Double latitude;
    private Double longitude;
    private LocalDate lastDonationDate;
}