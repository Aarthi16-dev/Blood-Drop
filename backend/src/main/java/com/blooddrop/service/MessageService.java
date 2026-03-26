package com.blooddrop.service;

import com.blooddrop.dto.MessageDTO;
import com.blooddrop.entity.Message;
import com.blooddrop.entity.User;
import com.blooddrop.repository.MessageRepository;
import com.blooddrop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional
    public MessageDTO sendMessage(Long donorId, Long senderId, String senderName, String contactNumber, String messageText) {
        System.out.println("Processing sendMessage request: senderId=" + senderId + ", donorId=" + donorId);
        User donor = userRepository.findById(donorId)
                .orElseThrow(() -> new RuntimeException("Donor not found with ID: " + donorId));

        User sender = null;
        if (senderId != null) {
            sender = userRepository.findById(senderId).orElse(null);
            if (sender == null) {
                 System.out.println("Warning: Sender with ID " + senderId + " not found, message will be anonymous.");
            }
        }

        Message message = Message.builder()
                .sender(sender)
                .senderName(senderName)
                .donor(donor)
                .contactNumber(contactNumber)
                .message(messageText)
                .build();

        Message savedMessage = messageRepository.save(message);
        
        Long actualSenderId = savedMessage.getSender() != null ? savedMessage.getSender().getId() : null;
        Long actualDonorId = savedMessage.getDonor() != null ? savedMessage.getDonor().getId() : null;
        
        System.out.println("Message saved! ID: " + savedMessage.getId() + 
                           ", Sender: " + actualSenderId + 
                           ", Donor: " + actualDonorId + 
                           ", Text: " + savedMessage.getMessage());
        
        return mapToDTO(savedMessage);
    }

    public List<MessageDTO> getMessagesForDonor(Long donorId) {
        return messageRepository.findByDonorIdOrderBySentDateDesc(donorId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<MessageDTO> getSentMessages(Long senderId) {
        return messageRepository.findBySenderIdOrderBySentDateDesc(senderId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<MessageDTO> getAllMessages(Long userId) {
        System.out.println("Processing getAllMessages for user ID: " + userId);
        try {
            List<Message> messages = messageRepository.findAllBySenderIdOrDonorId(userId);
            System.out.println("Repository returned " + messages.size() + " messages for user " + userId);
            return messages.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching messages for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private MessageDTO mapToDTO(Message message) {
        try {
            return MessageDTO.builder()
                    .id(message.getId())
                    .senderId(message.getSender() != null ? message.getSender().getId() : null)
                    .senderName(message.getSenderName())
                    .donorId(message.getDonor() != null ? message.getDonor().getId() : null)
                    .donorName(message.getDonor() != null ? message.getDonor().getName() : null)
                    .message(message.getMessage())
                    .sentDate(message.getSentDate())
                    .contactNumber(message.getContactNumber())
                    .build();
        } catch (Exception e) {
            System.err.println("Error mapping message ID " + message.getId() + " to DTO: " + e.getMessage());
            return MessageDTO.builder()
                    .id(message.getId())
                    .message("Error loading message content")
                    .build();
        }
    }
}
