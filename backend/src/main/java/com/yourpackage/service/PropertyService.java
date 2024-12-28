package com.yourpackage.service;

import com.yourpackage.model.User;
import com.yourpackage.repository.UserRepository;
import com.yourpackage.exception.UnauthorizedException;
import com.yourpackage.model.Property;
import com.yourpackage.repository.PropertyRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PropertyService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Value("${jwt.secretKey}")
    private String secretKey;

    private static final Logger logger = LoggerFactory.getLogger(PropertyService.class);

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

    public List<Property> searchProperties(String sizeSqFt, String propertyType, Integer noOfFloors, String address,
                                           String projectName, double minPrice, double maxPrice, Integer year,
                                           double minPricePerSqft, double maxPricePerSqft, String facilities,
                                           String dateOfValuation) {
        logger.info("Searching properties with provided filters");

        try {
            List<Property> properties = propertyRepository.findAll();

            return properties.stream()
                    .filter(property -> (sizeSqFt == null || property.getSizeSqFt().equalsIgnoreCase(sizeSqFt)))
                    .filter(property -> (propertyType == null || property.getPropertyType().equalsIgnoreCase(propertyType)))
                    .filter(property -> (noOfFloors == null || property.getNoOfFloors() == noOfFloors))
                    .filter(property -> (address == null || property.getAddress().equalsIgnoreCase(address)))
                    .filter(property -> (projectName == null || property.getProjectName().toLowerCase().contains(projectName.toLowerCase())))
                    .filter(property -> (minPrice == 0 || property.getPrice() >= minPrice))
                    .filter(property -> (maxPrice == Double.MAX_VALUE || property.getPrice() <= maxPrice))
                    .filter(property -> (year == null || property.getYear() == year))
                    .filter(property -> (minPricePerSqft == 0 || property.getPricePerSqft() >= minPricePerSqft))
                    .filter(property -> (maxPricePerSqft == Double.MAX_VALUE || property.getPricePerSqft() <= maxPricePerSqft))
                    .filter(property -> (facilities == null || property.getFacilities().toLowerCase().contains(facilities.toLowerCase())))
                    .filter(property -> (dateOfValuation == null || property.getDateOfValuation().toString().startsWith(dateOfValuation)))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            logger.error("Error occurred while filtering properties: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred while filtering properties");
        }
    }

    public Property getPropertyById(Long id) {
        logger.info("Fetching property with ID {}", id);

        return propertyRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Property with ID {} not found", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found");
                });
    }

    public Property addProperty(Property property, String token) {
        logger.info("Adding a new property");

        String email = parseToken(token).getSubject();
        User agent = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("Agent with email {} not found", email);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found");
                });

        property.setAgent(agent);

        try {
            return propertyRepository.save(property);
        } catch (Exception e) {
            logger.error("Error saving property: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error saving property");
        }
    }

    public List<Property> getPropertiesByAgent(String token) {
        logger.info("Fetching properties for the agent");

        String email = parseToken(token).getSubject();
        User agent = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("Agent with email {} not found", email);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found");
                });

        try {
            return propertyRepository.findByAgent(agent);
        } catch (Exception e) {
            logger.error("Error fetching properties for agent: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching properties");
        }
    }

    public Property updateProperty(Long id, Property updatedProperty, String token) {
        logger.info("Updating property with ID {}", id);

        Property existingProperty = propertyRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Property with ID {} not found", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found");
                });

        try {
            existingProperty.setSizeSqFt(updatedProperty.getSizeSqFt());
            existingProperty.setPropertyType(updatedProperty.getPropertyType());
            existingProperty.setNoOfFloors(updatedProperty.getNoOfFloors());
            existingProperty.setAddress(updatedProperty.getAddress());
            existingProperty.setProjectName(updatedProperty.getProjectName());
            existingProperty.setPrice(updatedProperty.getPrice());
            existingProperty.setYear(updatedProperty.getYear());
            existingProperty.setPricePerSqft(updatedProperty.getPricePerSqft());
            existingProperty.setFacilities(updatedProperty.getFacilities());
            existingProperty.setDateOfValuation(updatedProperty.getDateOfValuation());

            return propertyRepository.save(existingProperty);
        } catch (Exception e) {
            logger.error("Error updating property: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error updating property");
        }
    }

    public void deleteProperty(Long id, String token) {
        logger.info("Attempting to delete property with ID {}", id);

        String role = getRoleFromToken(token);

        if (!"ADMIN".equals(role)) {
            throw new UnauthorizedException("Only ADMIN users can delete properties");
        }

        try {
            propertyRepository.deleteById(id);
            logger.info("Property with ID {} deleted successfully", id);
        } catch (Exception e) {
            logger.error("Error deleting property: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting property");
        }
    }
}
