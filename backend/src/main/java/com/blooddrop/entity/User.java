package com.blooddrop.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Getter(AccessLevel.NONE)
    private Long id;

    /** Explicit getter so IDEs resolve it without Lombok processing; Lombok @Data skips this field. */
    public Long getId() {
        return id;
    }

    private String name;

    @Column(unique = true)
    private String email;

    private String phoneNumber;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String bloodGroup; // A+, B+, etc.
    private String location; // Could be lat,long or address string
    private String city;
    private Double latitude;
    private Double longitude;
    private String pincode;

    private Integer age;
    private String gender;
    private Double weight;
    private java.time.LocalDate lastDonationDate;
    private String healthIssues;

    private boolean available; // Only for donors

    @Builder.Default
    private Integer totalDonations = 0;

    private String otp;
    @Builder.Default
    private boolean isVerified = true;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
