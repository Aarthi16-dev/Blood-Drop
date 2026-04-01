package com.blooddrop.repository;

import com.blooddrop.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByDonorIdOrderBySentDateDesc(Long donorId);
    List<Message> findBySenderIdOrderBySentDateDesc(Long senderId);

    @Query("SELECT m FROM Message m LEFT JOIN FETCH m.sender s LEFT JOIN FETCH m.donor d WHERE (s.id = :userId OR d.id = :userId) ORDER BY m.sentDate DESC")
    List<Message> findAllBySenderIdOrDonorId(@Param("userId") Long userId);
}
