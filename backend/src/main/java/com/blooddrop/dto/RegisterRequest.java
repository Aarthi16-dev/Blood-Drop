package com.blooddrop.dto;

import com.blooddrop.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String firstname;
    private String lastname;
    private String email;
    private String password;
    private Role role;
    private String bloodGroup;
    private String location;
    private Double latitude;
    private Double longitude;
}
