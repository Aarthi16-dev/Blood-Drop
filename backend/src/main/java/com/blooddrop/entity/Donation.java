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
@Table(name = "donations")
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "donor_id")
    private User donor;

    @ManyToOne
    @JoinColumn(name = "request_id")
    private BloodRequest request;

    private LocalDateTime donationDate;

    private String notes;

    @PrePersist
    protected void onCreate() {
        donationDate = LocalDateTime.now();
    }
}
