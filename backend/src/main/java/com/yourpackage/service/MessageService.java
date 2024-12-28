package com.yourpackage.service;

import com.yourpackage.model.Message;
import com.yourpackage.repository.MessageRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
public class MessageService {

    @Value("${jwt.secretKey}")
    private String secretKey;

    @Autowired
    private MessageRepository messageRepository;

    private static final Logger logger = LoggerFactory.getLogger(MessageService.class);

    private Claims parseToken(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey.getBytes())
                .parseClaimsJws(token.replace("Bearer ", ""))
                .getBody();
    }

    private String getEmailFromToken(String token) {
        try {
            return parseToken(token).getSubject();
        } catch (Exception e) {
            logger.error("Failed to parse token: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }
    }

    public List<Message> getReceivedMessagesForUser(String token) {
        logger.info("Fetching received messages for user");

        String userEmail = getEmailFromToken(token);

        try {
            return messageRepository.findMessagesByRecipient(userEmail);
        } catch (Exception e) {
            logger.error("Error fetching messages for recipient {}: {}", userEmail, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching messages");
        }
    }

    public Message saveMessage(Message message, String token) {
        logger.info("Saving message");

        String senderEmail = getEmailFromToken(token);
        message.setSender(senderEmail);

        try {
            return messageRepository.save(message);
        } catch (Exception e) {
            logger.error("Error saving message from {}: {}", senderEmail, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error saving message");
        }
    }

    public Message getMessageById(Long id, String token) {
        logger.info("Fetching message with ID {}", id);

        String userEmail = getEmailFromToken(token);
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Message with ID {} not found", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found");
                });

        if (!message.getSender().equals(userEmail) && !message.getRecipient().equals(userEmail)) {
            logger.error("User with email {} is unauthorized to access message ID {}", userEmail, id);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        return message;
    }

    public List<Message> getConversation(String token, String otherUserEmail) {
        logger.info("Fetching conversation between logged-in user and {}");

        String loggedInUserEmail = getEmailFromToken(token);

        try {
            return messageRepository.findConversationBetweenUsers(loggedInUserEmail, otherUserEmail);
        } catch (Exception e) {
            logger.error("Error fetching conversation between {} and {}: {}", loggedInUserEmail, otherUserEmail, e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching conversation");
        }
    }
}
