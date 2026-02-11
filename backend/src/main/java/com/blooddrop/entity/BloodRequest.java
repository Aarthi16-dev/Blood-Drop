package com.blooddrop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "blood_requests")
public class BloodRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "requester_id")
    private User requester;

    private String patientName;
    private String bloodGroup;
    private String location;
    private Double latitude;
    private Double longitude;
    private String contactNumber;
    private String hospitalName;
    private boolean isUrgent;

    @Enumerated(EnumType.STRING)
    private RequestStatus status; // pending, fulfilled, cancelled

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = RequestStatus.PENDING;
        }
    }
}
