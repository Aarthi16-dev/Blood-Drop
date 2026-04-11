package com.blooddrop.controller;

import com.blooddrop.dto.UserResponse;
import com.blooddrop.dto.AuthenticationRequest;
import com.blooddrop.dto.AuthenticationResponse;
import com.blooddrop.dto.RegisterRequest;
import com.blooddrop.entity.User;
import com.blooddrop.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(service.register(request));
        } catch (Exception e) {
            e.printStackTrace();
            String errorMessage = "Registration failed: " + e.getMessage();
            if (e.getCause() != null) {
                errorMessage += " | Cause: " + e.getCause().getMessage();
            }
            System.err.println(errorMessage);
            return ResponseEntity.badRequest().body(java.util.Map.of("message", errorMessage));
        }
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String email = principal.getUsername();

        User user = service.findByEmail(email);

        UserResponse response = new UserResponse(
                user.getId(),
                user.getName(),
                user.getBloodGroup(),
                user.getEmail()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/health-check")
    public ResponseEntity<java.util.Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(java.util.Map.of(
            "status", "UP",
            "server", "Blood-Drop-Production",
            "totalUsers", service.getUserCount(),
            "timestamp", java.time.LocalDateTime.now().toString()
        ));
    }
}