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
        List<User> donors;
        if (bloodGroup != null && !bloodGroup.isEmpty()) {
            donors = userRepository.findByBloodGroupAndRole(bloodGroup, Role.DONOR);
        } else if (location != null && !location.isEmpty()) {
            donors = userRepository.findByLocationContainingAndRole(location, Role.DONOR);
        } else {
            donors = userRepository.findByRole(Role.DONOR);
        }
        return donors.stream().filter(User::isAvailable).collect(java.util.stream.Collectors.toList());
    }

    public User toggleAvailability(Long id, boolean available) {
        User donor = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Donor not found"));
        donor.setAvailable(available);
        return userRepository.save(donor);
    }
}
