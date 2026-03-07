package com.blooddrop.service;

import com.blooddrop.entity.BloodBank;
import com.blooddrop.repository.BloodBankRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BloodBankService {

    private final BloodBankRepository bloodBankRepository;

    public BloodBank addBloodBank(BloodBank bloodBank) {
        return bloodBankRepository.save(bloodBank);
    }

    public List<BloodBank> getAllBloodBanks() {
        return bloodBankRepository.findAll();
    }
}
