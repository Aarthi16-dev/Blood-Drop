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
    public ResponseEntity<BloodRequestDto> createRequest(@RequestBody BloodRequestDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return ResponseEntity.ok(service.createRequest(dto, userEmail));
    }

    @GetMapping
    public ResponseEntity<List<BloodRequestDto>> getAllRequests() {
        return ResponseEntity.ok(service.getAllRequests());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<BloodRequestDto>> getPendingRequests() {
        return ResponseEntity.ok(service.getPendingRequests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BloodRequestDto> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getRequestById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<BloodRequestDto> updateStatus(@PathVariable Long id, @RequestParam RequestStatus status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }
}
