package com.blooddrop.service;

import com.blooddrop.dto.MessageDTO;
import com.blooddrop.entity.Message;
import com.blooddrop.entity.User;
import com.blooddrop.repository.MessageRepository;
import com.blooddrop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public MessageDTO sendMessage(Long donorId, Long senderId, String senderName, String contactNumber, String messageText) {

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        User donor = userRepository.findById(donorId)
                .orElseThrow(() -> new RuntimeException("Donor not found"));

        Message message = Message.builder()
                .sender(sender)
                .donor(donor)
                .senderName(senderName)
                .contactNumber(contactNumber)
                .message(messageText)
                .build();

        Message saved = messageRepository.save(message);

        return mapToDTO(saved);
    }

    public List<MessageDTO> getMessagesForDonor(Long donorId) {
        return messageRepository.findByDonorId(donorId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<MessageDTO> getSentMessages(Long senderId) {
        return messageRepository.findBySenderId(senderId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<MessageDTO> getAllMessages(Long userId) {
        return messageRepository.findAll()
                .stream()
                .filter(msg -> 
                        (msg.getSender() != null && msg.getSender().getId().equals(userId)) ||
                        (msg.getDonor() != null && msg.getDonor().getId().equals(userId))
                )
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private MessageDTO mapToDTO(Message message) {
        return MessageDTO.builder()
                .id(message.getId())
                .senderId(message.getSender() != null ? message.getSender().getId() : null)
                .donorId(message.getDonor() != null ? message.getDonor().getId() : null)
                .senderName(message.getSenderName())
                .donorName(message.getDonor() != null ? message.getDonor().getName() : null)
                .contactNumber(message.getContactNumber())
                .message(message.getMessage())
                .sentDate(message.getSentDate())
                .build();
    }
}