package com.yourpackage.repository;

import com.yourpackage.model.Transaction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Find transactions by propertyId
    List<Transaction> findByPropertyId(Long propertyId);

    @Query("SELECT DISTINCT t.projectName FROM Transaction t WHERE LOWER(t.projectName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<String> findProjectNamesContaining(@Param("query") String query);    

    // Find top 5 transactions by projectName, sorted by dateOfValuation, with pagination
    @Query("SELECT t FROM Transaction t WHERE t.projectName = :projectName ORDER BY t.dateOfValuation DESC")
    List<Transaction> findTop5ByProjectNameOrderByDateOfValuationDesc(@Param("projectName") String projectName, Pageable pageable);
}
