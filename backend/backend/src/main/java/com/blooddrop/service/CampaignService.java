package com.blooddrop.service;

import com.blooddrop.entity.Campaign;
import com.blooddrop.repository.CampaignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository repository;

    public List<Campaign> getAllUpcomingCampaigns() {
        return repository.findByStartDateGreaterThanEqual(LocalDate.now());
    }

    public Campaign createCampaign(Campaign campaign) {
        return repository.save(campaign);
    }
}
