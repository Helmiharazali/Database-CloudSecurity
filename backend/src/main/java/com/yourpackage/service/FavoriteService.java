package com.yourpackage.service;

import com.yourpackage.model.Favorite;
import com.yourpackage.model.Property;
import com.yourpackage.model.User;
import com.yourpackage.repository.FavoriteRepository;
import com.yourpackage.repository.PropertyRepository;
import com.yourpackage.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private UserRepository userRepository;

    private static final Logger logger = LoggerFactory.getLogger(FavoriteService.class);

    public void addFavorite(Long userId, Long propertyId) {
        logger.info("Attempting to add property with ID {} to favorites for user ID {}", propertyId, userId);

        if (favoriteRepository.existsByUserIdAndPropertyId(userId, propertyId)) {
            logger.warn("Property with ID {} is already favorited by user ID {}", propertyId, userId);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Property already favorited");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User with ID {} not found", userId);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
                });

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> {
                    logger.error("Property with ID {} not found", propertyId);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found");
                });

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setProperty(property);

        favoriteRepository.save(favorite);
        logger.info("Property with ID {} added to favorites for user ID {}", propertyId, userId);
    }

    public List<Property> getFavoritesForUser(Long userId) {
        logger.info("Fetching favorite properties for user ID {}", userId);

        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        if (favorites.isEmpty()) {
            logger.warn("No favorite properties found for user ID {}", userId);
        }

        return favorites.stream()
                .map(Favorite::getProperty)
                .collect(Collectors.toList());
    }

    public void removeFavorite(Long userId, Long propertyId) {
        logger.info("Attempting to remove property with ID {} from favorites for user ID {}", propertyId, userId);

        Favorite favorite = favoriteRepository.findByUserIdAndPropertyId(userId, propertyId);
        if (favorite == null) {
            logger.error("Favorite with property ID {} and user ID {} not found", propertyId, userId);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Favorite not found");
        }

        favoriteRepository.delete(favorite);
        logger.info("Property with ID {} removed from favorites for user ID {}", propertyId, userId);
    }
}
