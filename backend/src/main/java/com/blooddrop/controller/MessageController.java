package com.blooddrop.controller;

import com.blooddrop.entity.Message;
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
    public ResponseEntity<Message> sendMessage(@RequestBody SendMessageRequest request) {
        Message message = messageService.sendMessage(
                request.getDonorId(), 
                request.getSenderName(), 
                request.getContactNumber(), 
                request.getMessage()
        );
        return ResponseEntity.ok(message);
    }

    @GetMapping("/donor/{donorId}")
    public ResponseEntity<List<Message>> getMessagesForDonor(@PathVariable Long donorId) {
        return ResponseEntity.ok(messageService.getMessagesForDonor(donorId));
    }

    @Data
    public static class SendMessageRequest {
        private Long donorId;
        private String senderName;
        private String contactNumber;
        private String message;
    }
}
