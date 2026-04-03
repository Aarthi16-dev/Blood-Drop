package com.blooddrop.controller;

import com.blooddrop.entity.BloodBank;
import com.blooddrop.service.BloodBankService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bloodbank")
@RequiredArgsConstructor
public class BloodBankController {

    private final BloodBankService bloodBankService;

    @PostMapping("/add")
    public ResponseEntity<BloodBank> addBloodBank(@RequestBody BloodBank bloodBank) {
        return ResponseEntity.ok(bloodBankService.addBloodBank(bloodBank));
    }

    @GetMapping("/all")
    public ResponseEntity<List<BloodBank>> getAllBloodBanks() {
        return ResponseEntity.ok(bloodBankService.getAllBloodBanks());
    }
}
