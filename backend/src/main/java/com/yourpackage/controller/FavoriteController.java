package com.yourpackage.controller;

import com.yourpackage.model.Property;
import com.yourpackage.service.FavoriteService;
import com.yourpackage.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @Autowired
    private UserService userService;

    private static final Logger logger = LoggerFactory.getLogger(FavoriteController.class);

    @GetMapping
    public ResponseEntity<?> getFavoriteProperties(@RequestHeader("Authorization") String token) {
        logger.info("Fetching favorite properties for the user");

        try {
            token = token.startsWith("Bearer ") ? token.substring(7) : token;
            Long userId = userService.getUserIdFromToken(token);
            List<Property> favoriteProperties = favoriteService.getFavoritesForUser(userId);
            logger.info("Fetched {} favorite properties for user ID {}", favoriteProperties.size(), userId);
            return ResponseEntity.ok(favoriteProperties);
        } catch (Exception e) {
            logger.error("Error fetching favorite properties: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Failed to fetch favorite properties.");
        }
    }

    @PostMapping("/add/{id}")
    public ResponseEntity<?> addFavorite(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        logger.info("Adding property with ID {} to favorites", id);

        try {
            token = token.startsWith("Bearer ") ? token.substring(7) : token;
            Long userId = userService.getUserIdFromToken(token);
            favoriteService.addFavorite(userId, id);
            logger.info("Property with ID {} added to favorites for user ID {}", id, userId);
            return ResponseEntity.ok("Property added to favorites.");
        } catch (Exception e) {
            logger.error("Error adding favorite property: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Failed to add property to favorites.");
        }
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<?> removeFavorite(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        logger.info("Removing property with ID {} from favorites", id);

        try {
            token = token.startsWith("Bearer ") ? token.substring(7) : token;
            Long userId = userService.getUserIdFromToken(token);
            favoriteService.removeFavorite(userId, id);
            logger.info("Property with ID {} removed from favorites for user ID {}", id, userId);
            return ResponseEntity.ok("Property removed from favorites.");
        } catch (Exception e) {
            logger.error("Error removing favorite property: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Failed to remove property from favorites.");
        }
    }
}
