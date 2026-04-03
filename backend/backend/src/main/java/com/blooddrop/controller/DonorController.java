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
            @RequestParam(name = "bloodGroup", required = false) String bloodGroup,
            @RequestParam(name = "location", required = false) String location,
            @RequestParam(name = "pincode", required = false) String pincode,
            @RequestParam(name = "latitude", required = false) Double latitude,
            @RequestParam(name = "longitude", required = false) Double longitude,
            java.security.Principal principal) {
        String currentEmail = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(donorService.searchDonors(bloodGroup, location, pincode, latitude, longitude, currentEmail));
    }

    @PutMapping("/{id}/availability")
    public ResponseEntity<User> toggleAvailability(
            @PathVariable(name = "id") Long id,
            @RequestParam(name = "available") boolean available) {
        return ResponseEntity.ok(donorService.toggleAvailability(id, available));
    }

    @PostMapping("/{id}/donated")
    public ResponseEntity<User> incrementDonationCount(@PathVariable(name = "id") Long id) {
        return ResponseEntity.ok(donorService.incrementDonationCount(id));
    }

    @PutMapping("/{id}/donations")
    public ResponseEntity<User> updateDonationCount(
            @PathVariable(name = "id") Long id,
            @RequestParam(name = "count") Integer count) {
        return ResponseEntity.ok(donorService.updateDonationCount(id, count));
    }
}
