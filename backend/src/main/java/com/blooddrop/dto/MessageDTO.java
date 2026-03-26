package com.blooddrop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long id;
    private Long senderId;
    private String senderName;
    private Long donorId;
    private String donorName;
    private String message;
    private LocalDateTime sentDate;
    private String contactNumber;
}
