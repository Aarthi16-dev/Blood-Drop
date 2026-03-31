package com.blooddrop.controller;

import com.blooddrop.dto.MessageDTO;
import com.blooddrop.service.MessageService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/message")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping("/send")
    public ResponseEntity<MessageDTO> sendMessage(@RequestBody SendMessageRequest request) {
        MessageDTO message = messageService.sendMessage(
                request.getDonorId(), 
                request.getSenderId(),
                request.getSenderName(), 
                request.getContactNumber(), 
                request.getMessage()
        );
        return ResponseEntity.ok(message);
    }

    @GetMapping("/donor/{donorId}")
    public ResponseEntity<List<MessageDTO>> getMessagesForDonor(@PathVariable("donorId") Long donorId) {
        return ResponseEntity.ok(messageService.getMessagesForDonor(donorId));
    }

    @GetMapping("/sent/{senderId}")
    public ResponseEntity<List<MessageDTO>> getSentMessages(@PathVariable("senderId") Long senderId) {
        return ResponseEntity.ok(messageService.getSentMessages(senderId));
    }

    @GetMapping("/all/{userId}")
    public ResponseEntity<List<MessageDTO>> getAllMessages(@PathVariable("userId") Long userId) {
        System.out.println("Fetching all messages for user ID: " + userId);
        return ResponseEntity.ok(messageService.getAllMessages(userId));
    }

    @Data
    public static class SendMessageRequest {
        private Long donorId;
        private Long senderId;
        private String senderName;
        private String contactNumber;
        private String message;
    }
}
