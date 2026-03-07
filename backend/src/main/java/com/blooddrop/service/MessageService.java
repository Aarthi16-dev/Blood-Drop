package com.blooddrop.service;

import com.blooddrop.entity.Message;
import com.blooddrop.entity.User;
import com.blooddrop.repository.MessageRepository;
import com.blooddrop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public Message sendMessage(Long donorId, String senderName, String contactNumber, String messageText) {
        User donor = userRepository.findById(donorId)
                .orElseThrow(() -> new RuntimeException("Donor not found"));

        Message message = Message.builder()
                .senderName(senderName)
                .donor(donor)
                .contactNumber(contactNumber)
                .message(messageText)
                .build();

        return messageRepository.save(message);
    }

    public List<Message> getMessagesForDonor(Long donorId) {
        return messageRepository.findByDonorIdOrderBySentDateDesc(donorId);
    }
}
