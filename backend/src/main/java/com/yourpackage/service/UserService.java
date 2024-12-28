package com.yourpackage.service;

import com.yourpackage.model.User;
import com.yourpackage.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Value("${jwt.secretKey}")
    private String secretKey;

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private static final long TOKEN_EXPIRATION = 3600000; // 1 hour in milliseconds

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    private Claims parseToken(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey.getBytes())
                .parseClaimsJws(token.replace("Bearer ", ""))
                .getBody();
    }
    

    public String getRoleFromToken(String token) {
        return parseToken(token).get("role", String.class);
    }

    public Long getUserIdFromToken(String token) {
        return Long.parseLong(parseToken(token).get("id", String.class));
    }

    public String getEmailFromToken(String token) {
        return parseToken(token).getSubject();
    }

    public User registerUser(User user) {
        logger.info("Attempting to register user with email: {}", user.getEmail());

        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            logger.error("User with email {} already exists", user.getEmail());
            throw new RuntimeException("User already exists with this email.");
        }

        user.setPassword(BCrypt.hashpw(user.getPassword(), BCrypt.gensalt()));
        user.setDateOfRegistration(LocalDateTime.now());

        logger.info("User with email {} successfully registered", user.getEmail());
        return userRepository.save(user);
    }

    public String loginUser(String email, String password) {
        logger.info("Attempting to log in user with email: {}", email);
    
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password."));
    
        if (!BCrypt.checkpw(password, user.getPassword())) {
            logger.error("Invalid password for user with email: {}", email);
            throw new RuntimeException("Invalid email or password.");
        }
    
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
    
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("role", user.getRole())
                .claim("id", user.getId().toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + TOKEN_EXPIRATION))
                .signWith(SignatureAlgorithm.HS256, secretKey.getBytes(StandardCharsets.UTF_8)) // Explicitly use byte array
                .compact();
    }

    public User updateUser(Long userId, User updatedUser) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    
        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
        existingUser.setAddress(updatedUser.getAddress());
    

    
        if (updatedUser.getProfilePicture() != null) {
            existingUser.setProfilePicture(updatedUser.getProfilePicture());
        }
    
        return userRepository.save(existingUser);
    }
    
    
    public boolean isAdmin(String token) {
        String role = getRoleFromToken(token);
        return "ADMIN".equals(role);
    }

    public void deleteUser(Long userId) {
        logger.info("Attempting to delete user with ID: {}", userId);
        userRepository.deleteById(userId);
        logger.info("User with ID: {} successfully deleted", userId);
    }

    public User getUserByEmail(String email) {
        logger.info("Fetching user with email: {}", email);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public String encodePassword(String rawPassword) {
        return BCrypt.hashpw(rawPassword, BCrypt.gensalt());
    }

    public User getUserById(Long userId) {
        logger.info("Fetching user with ID: {}", userId);
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> getAllUsers() {
        logger.info("Fetching all users");
        return userRepository.findAll();
    }
}
