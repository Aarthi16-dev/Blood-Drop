package com.blooddrop.dto;

import com.blooddrop.entity.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BloodRequestDto {
    private Long id;
    private Long requesterId;
    private String requesterName;
    private String patientName;
    private String bloodGroup;
    private Integer unitsRequired;
    private String location;
    private String city;
    private Double latitude;
    private Double longitude;
    private String contactNumber;
    private String hospitalName;
    private String urgency;
    private boolean isUrgent;
    private RequestStatus status;
    private LocalDateTime createdAt;
}
