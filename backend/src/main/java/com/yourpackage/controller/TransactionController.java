package com.yourpackage.controller;

import com.yourpackage.exception.UnauthorizedException;
import com.yourpackage.model.Transaction;
import com.yourpackage.service.TransactionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    private static final Logger logger = LoggerFactory.getLogger(TransactionController.class);

    @GetMapping("/search")
    public ResponseEntity<?> searchTransactions(
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
        logger.info("Searching transactions with filters");

        try {
            List<Transaction> transactions = transactionService.searchTransactions(
                    sizeSqFt, propertyType, noOfFloors, address, projectName,
                    minPrice != null ? minPrice : 0,
                    maxPrice != null ? maxPrice : Double.MAX_VALUE,
                    year, minPricePerSqft != null ? minPricePerSqft : 0,
                    maxPricePerSqft != null ? maxPricePerSqft : Double.MAX_VALUE,
                    facilities, dateOfValuation);
            logger.info("Found {} transactions matching the filters", transactions.size());
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            logger.error("Error during transaction search: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error searching transactions.");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable Long id) {
        logger.info("Fetching transaction with ID {}", id);

        try {
            Transaction transaction = transactionService.getTransactionById(id);
            logger.info("Transaction with ID {} fetched successfully", id);
            return ResponseEntity.ok(transaction);
        } catch (Exception e) {
            logger.error("Error fetching transaction with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Transaction not found.");
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addTransaction(@RequestBody Transaction transaction, @RequestHeader("Authorization") String token) {
        logger.info("Adding a new transaction");

        try {
            validateUserRole(token, "ADMIN", "AGENT");
            Transaction addedTransaction = transactionService.addTransaction(transaction);
            logger.info("Transaction added successfully with ID {}", addedTransaction.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(addedTransaction);
        } catch (Exception e) {
            logger.error("Error adding transaction: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access or invalid operation.");
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateTransaction(@PathVariable Long id, @RequestBody Transaction updatedTransaction,
                                                @RequestHeader("Authorization") String token) {
        logger.info("Updating transaction with ID {}", id);

        try {
            validateUserRole(token, "ADMIN", "AGENT");
            Transaction transaction = transactionService.updateTransaction(id, updatedTransaction);
            logger.info("Transaction with ID {} updated successfully", id);
            return ResponseEntity.ok(transaction);
        } catch (Exception e) {
            logger.error("Error updating transaction with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access or invalid operation.");
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id, @RequestHeader("Authorization") String token) {
        logger.info("Deleting transaction with ID {}", id);

        try {
            validateUserRole(token, "ADMIN", "AGENT");
            transactionService.deleteTransaction(id);
            logger.info("Transaction with ID {} deleted successfully", id);
            return ResponseEntity.ok("Transaction deleted successfully.");
        } catch (Exception e) {
            logger.error("Error deleting transaction with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access or operation failed.");
        }
    }

    private void validateUserRole(String token, String... allowedRoles) {
        String role = transactionService.getRoleFromToken(token);
        for (String allowedRole : allowedRoles) {
            if (allowedRole.equals(role)) {
                return;
            }
        }
        throw new UnauthorizedException("Unauthorized access");
    }
}
