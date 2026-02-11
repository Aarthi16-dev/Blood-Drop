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

@Service
@RequiredArgsConstructor
public class BloodRequestService {

    private final BloodRequestRepository requestRepository;
    private final UserRepository userRepository;

    public BloodRequestDto createRequest(BloodRequestDto dto, String userEmail) {
        User requester = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BloodRequest request = BloodRequest.builder()
                .requester(requester)
                .patientName(dto.getPatientName())
                .bloodGroup(dto.getBloodGroup())
                .location(dto.getLocation())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .contactNumber(dto.getContactNumber())
                .hospitalName(dto.getHospitalName())
                .isUrgent(dto.isUrgent())
                .status(RequestStatus.PENDING)
                .build();

        BloodRequest saved = requestRepository.save(request);
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
                .location(request.getLocation())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .contactNumber(request.getContactNumber())
                .hospitalName(request.getHospitalName())
                .isUrgent(request.isUrgent())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
