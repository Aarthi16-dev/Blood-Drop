package com.blooddrop.service;

import com.blooddrop.config.JwtService;
import com.blooddrop.dto.AuthenticationRequest;
import com.blooddrop.dto.AuthenticationResponse;
import com.blooddrop.dto.RegisterRequest;
import com.blooddrop.entity.Role;
import com.blooddrop.entity.User;
import com.blooddrop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        log.info("Register request received for email: {}", request.getEmail());

        try {
            User user = User.builder()
                    .name(buildFullName(request.getFirstname(), request.getLastname()))
                    .email(request.getEmail())
                    .phoneNumber(request.getPhoneNumber())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(request.getRole() != null ? request.getRole() : Role.DONOR)
                    .bloodGroup(request.getBloodGroup())
                    .location(request.getLocation() != null ? request.getLocation() : request.getCity())
                    .city(request.getCity())
                    .pincode(request.getPincode())
                    .latitude(request.getLatitude())
                    .longitude(request.getLongitude())
                    .age(request.getAge())
                    .gender(request.getGender())
                    .weight(request.getWeight())
                    .lastDonationDate(request.getLastDonationDate())
                    .healthIssues(request.getHealthIssues())
                    .available(true)
                    .isVerified(true)
                    .build();

            User savedUser = repository.save(user);
            log.info("User registered successfully with ID: {}", savedUser.getId());

            String jwtToken = jwtService.generateToken(savedUser);

            return AuthenticationResponse.builder()
                    .token(jwtToken)
                    .build();
        } catch (Exception e) {
            log.error("Registration failed for email {}: {}", request.getEmail(), e.getMessage());
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        log.info("Authenticate request received for email: {}", request.getEmail());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

        String jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    // Helper to handle null first/last names
    private String buildFullName(String firstName, String lastName) {
        if (firstName == null) firstName = "";
        if (lastName == null) lastName = "";
        return (firstName + " " + lastName).trim();
    }
}
