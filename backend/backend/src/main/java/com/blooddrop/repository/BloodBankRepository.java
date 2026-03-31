package com.blooddrop.repository;

import com.blooddrop.entity.BloodBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BloodBankRepository extends JpaRepository<BloodBank, Long> {
    Optional<BloodBank> findByBankNameAndCityAndBloodGroup(String bankName, String city, String bloodGroup);
}
