package com.blooddrop.controller;

import com.blooddrop.entity.Campaign;
import com.blooddrop.service.CampaignService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService service;

    @GetMapping
    public ResponseEntity<List<Campaign>> getUpcomingCampaigns() {
        return ResponseEntity.ok(service.getAllUpcomingCampaigns());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Campaign> createCampaign(@RequestBody Campaign campaign) {
        return ResponseEntity.ok(service.createCampaign(campaign));
    }
}
