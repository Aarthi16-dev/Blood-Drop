package com.blooddrop.service;

import com.blooddrop.entity.Role;
import com.blooddrop.entity.User;
import com.blooddrop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DonorService {

    private final UserRepository userRepository;

    public List<User> searchDonors(String bloodGroup, String location) {
        if (bloodGroup != null && !bloodGroup.isEmpty()) {
            return userRepository.findByBloodGroupAndRole(bloodGroup, Role.DONOR);
        } else if (location != null && !location.isEmpty()) {
            return userRepository.findByLocationContainingAndRole(location, Role.DONOR);
        } else {
            return userRepository.findByRole(Role.DONOR);
        }
    }
}
