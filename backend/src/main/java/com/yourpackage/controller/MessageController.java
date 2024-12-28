package com.yourpackage.controller;

import com.yourpackage.model.Message;
import com.yourpackage.service.MessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);

    @GetMapping
    public ResponseEntity<?> getReceivedMessagesForUser(@RequestHeader("Authorization") String token) {
        logger.info("Fetching received messages for the user");

        try {
            List<Message> messages = messageService.getReceivedMessagesForUser(token);
            logger.info("Fetched {} received messages", messages.size());
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            logger.error("Error fetching received messages: {}", e.getMessage());
            return ResponseEntity.status(401).body("Unauthorized access or token is invalid.");
        }
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody Message message, @RequestHeader("Authorization") String token) {
        logger.info("Sending a message");

        try {
            Message sentMessage = messageService.saveMessage(message, token);
            logger.info("Message sent successfully with ID {}", sentMessage.getId());
            return ResponseEntity.ok(sentMessage);
        } catch (Exception e) {
            logger.error("Error sending message: {}", e.getMessage());
            return ResponseEntity.status(401).body("Unauthorized access or invalid operation.");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMessageById(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        logger.info("Fetching message with ID {}", id);

        try {
            Message message = messageService.getMessageById(id, token);
            logger.info("Message with ID {} fetched successfully", id);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            logger.error("Error fetching message with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(403).body("Access denied or message not found.");
        }
    }

    @GetMapping("/conversation/{otherUserEmail}")
    public ResponseEntity<?> getConversation(@RequestHeader("Authorization") String token, @PathVariable String otherUserEmail) {
        logger.info("Fetching conversation with user {}");

        try {
            List<Message> messages = messageService.getConversation(token, otherUserEmail);
            logger.info("Fetched {} messages in the conversation", messages.size());
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            logger.error("Error fetching conversation: {}", e.getMessage());
            return ResponseEntity.status(403).body("Access denied or operation failed.");
        }
    }
}
