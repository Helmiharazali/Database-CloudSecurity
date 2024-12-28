package com.yourpackage.repository;

import com.yourpackage.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // Custom query to find messages by recipient only
    @Query("SELECT m FROM Message m WHERE m.recipient = :email")
    List<Message> findMessagesByRecipient(@Param("email") String email);

     // Query to find all messages between two users (sender and recipient)
     @Query("SELECT m FROM Message m WHERE (m.sender = :user1 AND m.recipient = :user2) OR (m.sender = :user2 AND m.recipient = :user1) ORDER BY m.timestamp ASC")
     List<Message> findConversationBetweenUsers(@Param("user1") String user1, @Param("user2") String user2);
}
