package com.blooddrop.config;

import com.blooddrop.entity.User;
import com.blooddrop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.List;

@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthInterceptor implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    List<String> tokenHeaders = accessor.getNativeHeader("Authorization");
                    if (tokenHeaders != null && !tokenHeaders.isEmpty()) {
                        String token = tokenHeaders.get(0);
                        if (token.startsWith("Bearer ")) {
                            token = token.substring(7);
                        }
                        try {
                            String email = jwtService.extractUsername(token);
                            if (email != null) {
                                User user = userRepository.findByEmail(email).orElse(null);
                                if (user != null && jwtService.isTokenValid(token, user)) {
                                    UsernamePasswordAuthenticationToken auth =
                                            new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                                    accessor.setUser(auth);
                                    log.info("WebSocket authenticated user: {} (ID: {})", email, user.getId());
                                }
                            }
                        } catch (Exception e) {
                            log.error("WebSocket auth failed: {}", e.getMessage());
                        }
                    }
                }
                return message;
            }
        });
    }
}
