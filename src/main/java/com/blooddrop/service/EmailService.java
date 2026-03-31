package com.blooddrop.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("annaduraiaarthi8@gmail.com");
        message.setTo(toEmail);
        message.setSubject("Blood Drop Registration - Your OTP");
        message.setText("Welcome to Blood Drop!\n\nYour 6-digit registration OTP is: " + otp
                + "\n\nThis OTP will expire in 5 minutes.\nDo not share this code with anyone.");
        javaMailSender.send(message);
    }
}
