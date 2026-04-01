package com.blooddrop.controller;

import com.blooddrop.dto.AuthenticationRequest;
import com.blooddrop.dto.AuthenticationResponse;
import com.blooddrop.dto.RegisterRequest;
import com.blooddrop.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;
    @GetMapping("/test")
    public String test() {
        return "working";
    }

   @PostMapping("/register")
public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
    System.out.println("Controller: Register request for " + request.getEmail());
    try {
        return ResponseEntity.ok(service.register(request));
    } catch (IllegalArgumentException e) {
        e.printStackTrace();
        return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
        e.printStackTrace(); // 👈 ADD THIS
        return ResponseEntity.badRequest().body(e.getMessage()); // 👈 CHANGE THIS
    }
}

    @PostMapping("/authenticate")
public ResponseEntity<?> authenticate(@RequestBody AuthenticationRequest request) {
    System.out.println("Controller: Authenticate request for " + request.getEmail());

    try {
        return ResponseEntity.ok(service.authenticate(request));
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(403).body(e.getMessage());
    }
}

    @GetMapping("/me")
    public ResponseEntity<com.blooddrop.entity.User> getCurrentUser(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.blooddrop.entity.User user) {
        return ResponseEntity.ok(user);
    }
}
