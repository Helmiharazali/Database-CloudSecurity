package com.yourpackage.controller;

import com.yourpackage.model.User;
import com.yourpackage.exception.UnauthorizedException;
import com.yourpackage.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        logger.info("Attempting to register a new user");

        try {
            User registeredUser = userService.registerUser(user);
            logger.info("User registered successfully with ID {}", registeredUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "User registered successfully",
                    "id", registeredUser.getId().toString()
            ));
        } catch (RuntimeException e) {
            logger.error("Error registering user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> credentials) {
        logger.info("Attempting to log in user");

        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            String token = userService.loginUser(email, password);
            User user = userService.getUserByEmail(email);

            logger.info("User logged in successfully with ID {}", user.getId());
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "id", user.getId().toString(),
                    "message", "Login successful"
            ));
        } catch (RuntimeException e) {
            logger.error("Error logging in user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        logger.info("Fetching user profile with ID {}", id);

        try {
            validateUserRole(token, id, "ADMIN", "BUYER", "AGENT");
            User user = userService.getUserById(id);
            logger.info("User profile with ID {} fetched successfully", id);
            return ResponseEntity.ok(user);
        } catch (UnauthorizedException e) {
            logger.error("Unauthorized access to user profile with ID {}", id);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access"));
        } catch (RuntimeException e) {
            logger.error("Error fetching user profile with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam("phoneNumber") String phoneNumber,
            @RequestParam("address") String address,
            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture,
            @RequestParam(value = "password", required = false) String password,
            @RequestHeader("Authorization") String token) {
        logger.info("Updating user profile with ID {}", id);

        try {
            validateUserRole(token, id, "ADMIN", "BUYER", "AGENT");

            User user = userService.getUserById(id);
            user.setName(name);
            user.setEmail(email);
            user.setPhoneNumber(phoneNumber);
            user.setAddress(address);

            if (password != null && !password.isEmpty()) {
                user.setPassword(userService.encodePassword(password));
            }

            if (profilePicture != null && !profilePicture.isEmpty()) {
                user.setProfilePicture(profilePicture.getBytes());
            }

            User updatedUser = userService.updateUser(id, user);
            logger.info("User profile with ID {} updated successfully", id);
            return ResponseEntity.ok(updatedUser);
        } catch (UnauthorizedException e) {
            logger.error("Unauthorized access to update user profile with ID {}", id);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access"));
        } catch (RuntimeException | IOException e) {
            logger.error("Error updating user profile with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Error updating profile"));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String token) {
        logger.info("Fetching all users");

        try {
            validateUserRole(token, null, "ADMIN");
            List<User> users = userService.getAllUsers();
            logger.info("Fetched {} users", users.size());
            return ResponseEntity.ok(users);
        } catch (UnauthorizedException e) {
            logger.error("Unauthorized access to fetch all users");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access"));
        }
    }

    private void validateUserRole(String token, Long id, String... allowedRoles) {
        String role = userService.getRoleFromToken(token);
        Long tokenUserId = userService.getUserIdFromToken(token);

        if (id != null && !role.equals("ADMIN") && !id.equals(tokenUserId)) {
            throw new UnauthorizedException("Unauthorized access to another user's profile");
        }

        for (String allowedRole : allowedRoles) {
            if (allowedRole.equals(role)) {
                return;
            }
        }

        throw new UnauthorizedException("Unauthorized access");
    }
}
