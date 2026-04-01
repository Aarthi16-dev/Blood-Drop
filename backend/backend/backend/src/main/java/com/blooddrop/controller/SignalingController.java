package com.blooddrop.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class SignalingController {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * User initiates a call.
     * Payload: { targetUserId, callerName, callType (voice/video) }
     */
    @MessageMapping("/call-request")
    public void handleCallRequest(@Payload Map<String, Object> payload, Principal principal) {
        String targetUserId = String.valueOf(payload.get("targetUserId"));
        log.info("Call request from {} to user {}", principal.getName(), targetUserId);

        payload.put("callerPrincipal", principal.getName());
        messagingTemplate.convertAndSendToUser(targetUserId, "/queue/incoming-call", payload);
    }

    /**
     * Target user accepts the call.
     * Payload: { callerUserId }
     */
    @MessageMapping("/call-accept")
    public void handleCallAccept(@Payload Map<String, Object> payload, Principal principal) {
        String callerUserId = String.valueOf(payload.get("callerUserId"));
        log.info("Call accepted by {} for caller {}", principal.getName(), callerUserId);

        payload.put("acceptedBy", principal.getName());
        messagingTemplate.convertAndSendToUser(callerUserId, "/queue/call-accepted", payload);
    }

    /**
     * Target user declines the call.
     * Payload: { callerUserId }
     */
    @MessageMapping("/call-decline")
    public void handleCallDecline(@Payload Map<String, Object> payload, Principal principal) {
        String callerUserId = String.valueOf(payload.get("callerUserId"));
        log.info("Call declined by {} for caller {}", principal.getName(), callerUserId);

        payload.put("declinedBy", principal.getName());
        messagingTemplate.convertAndSendToUser(callerUserId, "/queue/call-declined", payload);
    }

    /**
     * WebRTC SDP Offer.
     * Payload: { targetUserId, sdp }
     */
    @MessageMapping("/webrtc-offer")
    public void handleOffer(@Payload Map<String, Object> payload, Principal principal) {
        String targetUserId = String.valueOf(payload.get("targetUserId"));
        log.info("WebRTC offer from {} to {}", principal.getName(), targetUserId);

        payload.put("fromUser", principal.getName());
        messagingTemplate.convertAndSendToUser(targetUserId, "/queue/webrtc-offer", payload);
    }

    /**
     * WebRTC SDP Answer.
     * Payload: { targetUserId, sdp }
     */
    @MessageMapping("/webrtc-answer")
    public void handleAnswer(@Payload Map<String, Object> payload, Principal principal) {
        String targetUserId = String.valueOf(payload.get("targetUserId"));
        log.info("WebRTC answer from {} to {}", principal.getName(), targetUserId);

        payload.put("fromUser", principal.getName());
        messagingTemplate.convertAndSendToUser(targetUserId, "/queue/webrtc-answer", payload);
    }

    /**
     * WebRTC ICE Candidate.
     * Payload: { targetUserId, candidate }
     */
    @MessageMapping("/ice-candidate")
    public void handleIceCandidate(@Payload Map<String, Object> payload, Principal principal) {
        String targetUserId = String.valueOf(payload.get("targetUserId"));

        payload.put("fromUser", principal.getName());
        messagingTemplate.convertAndSendToUser(targetUserId, "/queue/ice-candidate", payload);
    }

    /**
     * End call signal.
     * Payload: { targetUserId }
     */
    @MessageMapping("/call-end")
    public void handleCallEnd(@Payload Map<String, Object> payload, Principal principal) {
        String targetUserId = String.valueOf(payload.get("targetUserId"));
        log.info("Call ended by {} with {}", principal.getName(), targetUserId);

        payload.put("endedBy", principal.getName());
        messagingTemplate.convertAndSendToUser(targetUserId, "/queue/call-ended", payload);
    }
}
