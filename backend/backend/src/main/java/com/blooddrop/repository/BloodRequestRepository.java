package com.blooddrop.repository;

import com.blooddrop.entity.BloodRequest;
import com.blooddrop.entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {
    List<BloodRequest> findByStatus(RequestStatus status);

    List<BloodRequest> findByRequesterId(Long requesterId);

    List<BloodRequest> findByBloodGroup(String bloodGroup);
}
