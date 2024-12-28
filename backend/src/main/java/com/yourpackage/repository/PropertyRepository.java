package com.yourpackage.repository;

import com.yourpackage.model.Property;
import com.yourpackage.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    // Search properties based on project name and property type (both are optional)
    @Query("SELECT p FROM Property p WHERE " +
            "(:projectName IS NULL OR LOWER(p.projectName) LIKE LOWER(CONCAT('%', :projectName, '%'))) " +
            "AND (:propertyType IS NULL OR LOWER(p.propertyType) LIKE LOWER(CONCAT('%', :propertyType, '%'))) " +
            "ORDER BY p.dateOfValuation DESC")
    List<Property> searchProperties(@Param("projectName") String projectName,
                                    @Param("propertyType") String propertyType);

    // Find project names containing the search query
    @Query("SELECT DISTINCT p.projectName FROM Property p WHERE LOWER(p.projectName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<String> findProjectNamesContaining(@Param("query") String query);

    // Find property types containing the search query
    @Query("SELECT DISTINCT p.propertyType FROM Property p WHERE LOWER(p.propertyType) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<String> findPropertyTypesContaining(@Param("query") String query);

    // Sort by dateOfValuation and limit to 5 records
    @Query("SELECT p FROM Property p WHERE p.projectName = :projectName ORDER BY p.dateOfValuation DESC")
    List<Property> findTop5ByProjectNameOrderByDateOfValuationDesc(@Param("projectName") String projectName, Pageable pageable);

    @Query("SELECT p FROM Property p WHERE p.dateOfValuation = :dateOfValuation")
    List<Property> findByDateOfValuation(@Param("dateOfValuation") String dateOfValuation);

    @Query("SELECT p FROM Property p WHERE p.agent = :agent")
    List<Property> findByAgent(@Param("agent") User agent);
}
