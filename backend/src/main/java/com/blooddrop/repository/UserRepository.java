package com.blooddrop.repository;

import com.blooddrop.entity.Role;
import com.blooddrop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByBloodGroupAndRole(String bloodGroup, Role role);

    List<User> findByLocationContainingAndRole(String location, Role role);
}
