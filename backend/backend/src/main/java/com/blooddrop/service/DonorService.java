package com.blooddrop.service;

import com.blooddrop.entity.Role;
import com.blooddrop.entity.User;
import com.blooddrop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DonorService {

    private final UserRepository userRepository;

    public List<User> searchDonors(String bloodGroup, String location, String pincode, Double userLat, Double userLon,
            String currentEmail) {
        log.info("Searching donors: bloodGroup={}, location={}, pincode={}, userLat={}, userLon={}, currentEmail={}",
                bloodGroup,
                location, pincode, userLat, userLon, currentEmail);
        List<User> donors = userRepository.findByRole(Role.DONOR);
        log.info("Found {} total donors with role DONOR", donors.size());

        List<User> finalDonors = donors.stream()
                .filter(d -> currentEmail == null || !d.getEmail().equalsIgnoreCase(currentEmail))
                // .filter(User::isAvailable) // Relaxed to show existing donors for now
                .filter(d -> bloodGroup == null || bloodGroup.isEmpty()
                        || d.getBloodGroup().equalsIgnoreCase(bloodGroup))
                .filter(d -> location == null || location.isEmpty() ||
                        (d.getLocation() != null && d.getLocation().toLowerCase().contains(location.toLowerCase())) ||
                        (d.getCity() != null && d.getCity().toLowerCase().contains(location.toLowerCase())))
                .filter(d -> pincode == null || pincode.trim().isEmpty() ||
                        (d.getPincode() != null && d.getPincode().equals(pincode.trim())) ||
                        (d.getLocation() != null && d.getLocation().contains(pincode.trim())))
                .sorted((d1, d2) -> {
                    if (userLat != null && userLon != null) {
                        boolean d1HasLoc = d1.getLatitude() != null && d1.getLongitude() != null;
                        boolean d2HasLoc = d2.getLatitude() != null && d2.getLongitude() != null;

                        if (d1HasLoc && d2HasLoc) {
                            double dist1 = calculateDistance(userLat, userLon, d1.getLatitude(), d1.getLongitude());
                            double dist2 = calculateDistance(userLat, userLon, d2.getLatitude(), d2.getLongitude());
                            return Double.compare(dist1, dist2);
                        } else if (d1HasLoc) {
                            return -1;
                        } else if (d2HasLoc) {
                            return 1;
                        }
                    }
                    return 0;
                })
                .collect(java.util.stream.Collectors.toList());

        log.info("Returning {} donors after filtering and sorting", finalDonors.size());
        return finalDonors;
    }

    public User toggleAvailability(Long id, boolean available) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setAvailable(available);
        return userRepository.save(user);
    }

    public User incrementDonationCount(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setTotalDonations(user.getTotalDonations() + 1);
        return userRepository.save(user);
    }

    public User updateDonationCount(Long id, Integer count) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setTotalDonations(count);
        return userRepository.save(user);
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double theta = lon1 - lon2;
        double dist = Math.sin(deg2rad(lat1)) * Math.sin(deg2rad(lat2))
                + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.cos(deg2rad(theta));
        dist = Math.acos(dist);
        dist = rad2deg(dist);
        dist = dist * 60 * 1.1515 * 1.609344; // Kilometers
        return (dist);
    }

    private double deg2rad(double deg) {
        return (deg * Math.PI / 180.0);
    }

    private double rad2deg(double rad) {
        return (rad * 180.0 / Math.PI);
    }
}
