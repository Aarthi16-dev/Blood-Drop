package com.blooddrop.dto;

import com.blooddrop.entity.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    @JsonProperty("firstName")
    private String firstname;
    @JsonProperty("lastName")
    private String lastname;
    private String email;
    @JsonProperty("phoneNumber")
    private String phoneNumber;
    private String password;
    private Role role;
    @JsonProperty("bloodGroup")
    private String bloodGroup;
    private String location;
    @JsonProperty("city")
    private String city;
    private Double latitude;
    private Double longitude;

    private Integer age;
    private String gender;
    private Double weight;
    private java.time.LocalDate lastDonationDate;
    private String healthIssues;
    @JsonProperty("pinCode")
    private String pincode;
}
