package com.blooddrop.controller;

import com.blooddrop.entity.User;
import com.blooddrop.service.DonorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/donors")
@RequiredArgsConstructor
public class DonorController {

    private final DonorService donorService;

    @GetMapping("/search")
    public ResponseEntity<List<User>> searchDonors(
            @RequestParam(required = false) String bloodGroup,
            @RequestParam(required = false) String location) {
        return ResponseEntity.ok(donorService.searchDonors(bloodGroup, location));
    }

    @PutMapping("/{id}/availability")
    public ResponseEntity<User> toggleAvailability(
            @PathVariable Long id, 
            @RequestParam boolean available) {
        return ResponseEntity.ok(donorService.toggleAvailability(id, available));
    }
}
