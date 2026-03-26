package com.blooddrop.service;

import com.blooddrop.dto.BloodRequestDto;
import com.blooddrop.entity.BloodRequest;
import com.blooddrop.entity.RequestStatus;
import com.blooddrop.entity.User;
import com.blooddrop.repository.BloodRequestRepository;
import com.blooddrop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import com.blooddrop.service.NotificationService;

@Service
@RequiredArgsConstructor
public class BloodRequestService {

    private final BloodRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public BloodRequestDto createRequest(BloodRequestDto dto, String userEmail) {
        System.out.println("Service: Creating request for " + userEmail);
        User requester = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        BloodRequest request = BloodRequest.builder()
                .requester(requester)
                .patientName(dto.getPatientName())
                .bloodGroup(dto.getBloodGroup())
                .unitsRequired(dto.getUnitsRequired())
                .location(dto.getLocation())
                .city(dto.getCity())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .contactNumber(dto.getContactNumber())
                .hospitalName(dto.getHospitalName())
                .urgency(dto.getUrgency())
                .isUrgent(dto.isUrgent() || "HIGH".equalsIgnoreCase(dto.getUrgency()))
                .status(RequestStatus.PENDING)
                .build();

        System.out.println("Service: Saving request entity: " + request);
        BloodRequest saved = requestRepository.save(request);
        
        // Notify all matching donors immediately
        try {
            notificationService.notifyAllDonors(saved);
        } catch (Exception e) {
            System.err.println("Notification failed: " + e.getMessage());
        }
        
        return mapToDto(saved);
    }

    public List<BloodRequestDto> getAllRequests() {
        return requestRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<BloodRequestDto> getPendingRequests() {
        return requestRepository.findByStatus(RequestStatus.PENDING).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public BloodRequestDto getRequestById(Long id) {
        BloodRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        return mapToDto(request);
    }

    public BloodRequestDto updateStatus(Long id, RequestStatus status) {
        BloodRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus(status);
        return mapToDto(requestRepository.save(request));
    }

    private BloodRequestDto mapToDto(BloodRequest request) {
        return BloodRequestDto.builder()
                .id(request.getId())
                .requesterId(request.getRequester().getId())
                .requesterName(request.getRequester().getName())
                .patientName(request.getPatientName())
                .bloodGroup(request.getBloodGroup())
                .unitsRequired(request.getUnitsRequired())
                .location(request.getLocation())
                .city(request.getCity())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .contactNumber(request.getContactNumber())
                .hospitalName(request.getHospitalName())
                .urgency(request.getUrgency())
                .isUrgent(request.isUrgent())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
