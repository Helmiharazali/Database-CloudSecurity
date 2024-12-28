package com.yourpackage.controller;

import com.yourpackage.model.User;
import com.yourpackage.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String token) {
        logger.info("Fetching all users");

        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        if (!userService.isAdmin(token)) {
            logger.warn("Unauthorized access attempt detected.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied"));
        }

        try {
            List<User> users = userService.getAllUsers();
            logger.info("Fetched {} users", users.size());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Error fetching users: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Could not retrieve users."));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        logger.info("Fetching user with ID {}", id);

        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        if (!userService.isAdmin(token)) {
            logger.warn("Unauthorized access attempt detected for user ID {}", id);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied"));
        }

        try {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            logger.error("User with ID {} not found: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }
    }

    @PostMapping
    public ResponseEntity<?> addUser(@RequestBody Map<String, String> userDTO, @RequestHeader("Authorization") String token) {
        logger.info("Attempting to add a new user");

        if (!userService.isAdmin(token)) {
            logger.warn("Unauthorized attempt to add a user.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied"));
        }

        try {
            User user = new User();
            user.setName(userDTO.get("name"));
            user.setEmail(userDTO.get("email"));
            user.setRole(userDTO.get("role"));
            user.setPassword(userService.encodePassword(userDTO.get("password")));
            User newUser = userService.registerUser(user);
            logger.info("New user added with ID {}", newUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
        } catch (RuntimeException e) {
            logger.error("Error adding user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> userDTO,
                                        @RequestHeader("Authorization") String token) {
        logger.info("Updating user with ID {}", id);

        if (!userService.isAdmin(token)) {
            logger.warn("Unauthorized attempt to update user with ID {}", id);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied"));
        }

        try {
            User updatedUser = userService.getUserById(id);
            updatedUser.setName(userDTO.get("name"));
            updatedUser.setEmail(userDTO.get("email"));
            updatedUser.setRole(userDTO.get("role"));
            if (userDTO.get("password") != null && !userDTO.get("password").isEmpty()) {
                updatedUser.setPassword(userService.encodePassword(userDTO.get("password")));
            }
            User user = userService.updateUser(id, updatedUser);
            logger.info("User with ID {} successfully updated", id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            logger.error("Error updating user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        logger.info("Deleting user with ID {}", id);

        if (!userService.isAdmin(token)) {
            logger.warn("Unauthorized attempt to delete user with ID {}", id);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied"));
        }

        try {
            userService.deleteUser(id);
            logger.info("User with ID {} deleted successfully", id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (RuntimeException e) {
            logger.error("Error deleting user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }
    }
}
