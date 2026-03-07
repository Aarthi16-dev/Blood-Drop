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
@Table(name = "blood_banks")
public class BloodBank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String bankName;
    private String city;
    private String bloodGroup;
    private Integer availableUnits;
    private LocalDateTime lastUpdatedDate;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdatedDate = LocalDateTime.now();
    }
}
