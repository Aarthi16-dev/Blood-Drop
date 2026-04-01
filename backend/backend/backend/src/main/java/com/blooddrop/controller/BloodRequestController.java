package com.blooddrop.controller;

import com.blooddrop.dto.BloodRequestDto;
import com.blooddrop.entity.RequestStatus;
import com.blooddrop.service.BloodRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/requests")
@RequiredArgsConstructor
public class BloodRequestController {

    private final BloodRequestService service;

    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody BloodRequestDto dto) {
        System.out.println("Received Blood Request DTO: " + dto);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null) {
            System.err.println("Authentication is NULL");
            return ResponseEntity.status(401).body("Not authenticated");
        }
        
        String userEmail = authentication.getName();
        System.out.println("Request by user: " + userEmail + " (Authorities: " + authentication.getAuthorities() + ")");
        
        if ("anonymousUser".equals(userEmail)) {
            System.err.println("User is anonymousUser. Token might be missing or invalid.");
            return ResponseEntity.status(401).body("Session expired. Please log in again.");
        }
        
        try {
            BloodRequestDto createdRequest = service.createRequest(dto, userEmail);
            return ResponseEntity.ok(createdRequest);
        } catch (Exception e) {
            System.err.println("Error in createRequest: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal Server Error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<BloodRequestDto>> getAllRequests() {
        System.out.println("Controller: Fetching all requests.");
        List<BloodRequestDto> requests = service.getAllRequests();
        System.out.println("Controller: Found " + requests.size() + " requests.");
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<BloodRequestDto>> getPendingRequests() {
        System.out.println("Controller: Fetching pending requests.");
        List<BloodRequestDto> pendingRequests = service.getPendingRequests();
        System.out.println("Controller: Found " + pendingRequests.size() + " pending requests.");
        return ResponseEntity.ok(pendingRequests);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BloodRequestDto> getRequestById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.getRequestById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<BloodRequestDto> updateStatus(@PathVariable("id") Long id, @RequestParam("status") RequestStatus status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }
}
