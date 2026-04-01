public BloodRequestDto createRequest(BloodRequestDto dto) {

    User requester = userRepository.findById(dto.getRequesterId())
            .orElseThrow(() -> new RuntimeException("User not found"));

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
            .build();

    BloodRequest saved = bloodRequestRepository.save(request);

    return mapToDto(saved);
}