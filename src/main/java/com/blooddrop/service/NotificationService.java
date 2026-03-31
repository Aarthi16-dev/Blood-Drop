package com.blooddrop.service;

import com.blooddrop.entity.BloodRequest;
import com.blooddrop.entity.Message;
import com.blooddrop.entity.User;
import com.blooddrop.repository.MessageRepository;
import com.blooddrop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;


@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    public void notifyAllDonors(BloodRequest request) {
        log.info("Notifying all registered users about new request at {}", request.getHospitalName());
        List<User> recipients = userRepository.findAll();
        log.info("Targeting {} total recipients", recipients.size());

        for (User recipient : recipients) {
            String alertMessage = String.format("BLOOD REQUEST: %s needed at %s. Contact: %s. Patient: %s.",
                    request.getBloodGroup(), request.getHospitalName(), request.getContactNumber(),
                    request.getPatientName());
            try {
                log.info("Broadcasting message to: {}", recipient.getEmail());
                Message message = Message.builder()
                        .sender(null) // System broadcast
                        .senderName("Blood Drop System")
                        .donor(recipient)
                        .contactNumber(request.getContactNumber())
                        .message(alertMessage)
                        .sentDate(LocalDateTime.now())
                        .build();
                Message saved = messageRepository.save(message);
                log.info("System alert saved ID: {} for user: {}", saved.getId(), recipient.getEmail());
            } catch (Exception e) {
                log.error("Broadcast failed for user {}: {}", recipient.getEmail(), e.getMessage());
            }
        }
    }
}
