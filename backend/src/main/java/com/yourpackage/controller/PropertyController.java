package com.yourpackage.controller;

import com.yourpackage.exception.UnauthorizedException;
import com.yourpackage.model.Property;
import com.yourpackage.service.PropertyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    @Autowired
    private PropertyService propertyService;

    private static final Logger logger = LoggerFactory.getLogger(PropertyController.class);

    @GetMapping("/search")
    public ResponseEntity<?> searchProperties(
            @RequestParam(required = false) String sizeSqFt,
            @RequestParam(required = false) String propertyType,
            @RequestParam(required = false) Integer noOfFloors,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String projectName,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Double minPricePerSqft,
            @RequestParam(required = false) Double maxPricePerSqft,
            @RequestParam(required = false) String facilities,
            @RequestParam(required = false) String dateOfValuation) {
        logger.info("Searching properties with filters");

        try {
            List<Property> properties = propertyService.searchProperties(
                    sizeSqFt, propertyType, noOfFloors, address, projectName,
                    minPrice != null ? minPrice : 0,
                    maxPrice != null ? maxPrice : Double.MAX_VALUE,
                    year, minPricePerSqft != null ? minPricePerSqft : 0,
                    maxPricePerSqft != null ? maxPricePerSqft : Double.MAX_VALUE,
                    facilities, dateOfValuation);
            logger.info("Found {} properties matching the filters", properties.size());
            return ResponseEntity.ok(properties);
        } catch (Exception e) {
            logger.error("Error during property search: {}", e.getMessage());
            return ResponseEntity.status(500).body("Error searching properties.");
        }
    }

    @GetMapping("/agent-properties")
    public ResponseEntity<?> getAgentProperties(@RequestHeader("Authorization") String token) {
        logger.info("Fetching properties for the agent");

        try {
            List<Property> properties = propertyService.getPropertiesByAgent(token);
            logger.info("Fetched {} properties for the agent", properties.size());
            return ResponseEntity.ok(properties);
        } catch (Exception e) {
            logger.error("Error fetching agent properties: {}", e.getMessage());
            return ResponseEntity.status(401).body("Unauthorized access or invalid token.");
        }
    }

    @GetMapping("/{propertyId}")
    public ResponseEntity<?> getPropertyById(@PathVariable Long propertyId) {
        logger.info("Fetching property with ID {}", propertyId);

        try {
            Property property = propertyService.getPropertyById(propertyId);
            logger.info("Property with ID {} fetched successfully", propertyId);
            return ResponseEntity.ok(property);
        } catch (Exception e) {
            logger.error("Error fetching property with ID {}: {}", propertyId, e.getMessage());
            return ResponseEntity.status(404).body("Property not found.");
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addProperty(@RequestBody Property property, @RequestHeader("Authorization") String token) {
        logger.info("Adding a new property");

        try {
            validateUserRole(token, "AGENT", "ADMIN");
            Property addedProperty = propertyService.addProperty(property, token);
            logger.info("Property added successfully with ID {}", addedProperty.getId());
            return ResponseEntity.status(201).body(addedProperty);
        } catch (Exception e) {
            logger.error("Error adding property: {}", e.getMessage());
            return ResponseEntity.status(401).body("Unauthorized access or invalid operation.");
        }
    }

    @PutMapping("/update/{propertyId}")
    public ResponseEntity<?> updateProperty(@PathVariable Long propertyId, @RequestBody Property updatedProperty,
                                             @RequestHeader("Authorization") String token) {
        logger.info("Updating property with ID {}", propertyId);

        try {
            validateUserRole(token, "ADMIN", "AGENT");
            Property property = propertyService.updateProperty(propertyId, updatedProperty, token);
            logger.info("Property with ID {} updated successfully", propertyId);
            return ResponseEntity.ok(property);
        } catch (Exception e) {
            logger.error("Error updating property with ID {}: {}", propertyId, e.getMessage());
            return ResponseEntity.status(401).body("Unauthorized access or invalid operation.");
        }
    }

    @DeleteMapping("/delete/{propertyId}")
    public ResponseEntity<?> deleteProperty(@PathVariable Long propertyId, @RequestHeader("Authorization") String token) {
        logger.info("Deleting property with ID {}", propertyId);

        try {
            validateUserRole(token, "ADMIN", "AGENT");
            propertyService.deleteProperty(propertyId, token);
            logger.info("Property with ID {} deleted successfully", propertyId);
            return ResponseEntity.ok("Property deleted successfully.");
        } catch (Exception e) {
            logger.error("Error deleting property with ID {}: {}", propertyId, e.getMessage());
            return ResponseEntity.status(401).body("Unauthorized access or operation failed.");
        }
    }

    private void validateUserRole(String token, String... allowedRoles) {
        String role = propertyService.getRoleFromToken(token);
        for (String allowedRole : allowedRoles) {
            if (allowedRole.equals(role)) {
                return;
            }
        }
        throw new UnauthorizedException("Unauthorized access");
    }
}
