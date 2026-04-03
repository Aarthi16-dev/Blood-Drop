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

        var user = User.builder()
                .name(request.getFirstname() + " " + request.getLastname())
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

        var jwtToken = jwtService.generateToken(savedUser);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        var jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    // ✅ THIS METHOD FIXES YOUR CONTROLLER ERROR
    public User findByEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }
}