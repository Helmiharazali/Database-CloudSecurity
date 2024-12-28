package com.yourpackage.service;

import com.yourpackage.model.Transaction;
import com.yourpackage.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    private static final Logger logger = LoggerFactory.getLogger(TransactionService.class);

    public List<Transaction> searchTransactions(String sizeSqFt, String propertyType, Integer noOfFloors,
                                                 String address, String projectName, double minPrice, double maxPrice,
                                                 Integer year, double minPricePerSqft, double maxPricePerSqft,
                                                 String facilities, String dateOfValuation) {
        logger.info("Searching transactions with provided filters");

        try {
            List<Transaction> transactions = transactionRepository.findAll();

            return transactions.stream()
                    .filter(transaction -> (sizeSqFt == null || transaction.getSizeSqFt().equalsIgnoreCase(sizeSqFt)))
                    .filter(transaction -> (propertyType == null || transaction.getPropertyType().equalsIgnoreCase(propertyType)))
                    .filter(transaction -> (noOfFloors == null || transaction.getNoOfFloors() == noOfFloors))
                    .filter(transaction -> (address == null || transaction.getAddress().equalsIgnoreCase(address)))
                    .filter(transaction -> (projectName == null || transaction.getProjectName().toLowerCase().contains(projectName.toLowerCase())))
                    .filter(transaction -> (minPrice == 0 || transaction.getPrice() >= minPrice))
                    .filter(transaction -> (maxPrice == Double.MAX_VALUE || transaction.getPrice() <= maxPrice))
                    .filter(transaction -> (year == null || transaction.getYear() == year))
                    .filter(transaction -> (minPricePerSqft == 0 || transaction.getPricePerSqft() >= minPricePerSqft))
                    .filter(transaction -> (maxPricePerSqft == Double.MAX_VALUE || transaction.getPricePerSqft() <= maxPricePerSqft))
                    .filter(transaction -> (facilities == null || transaction.getFacilities().toLowerCase().contains(facilities.toLowerCase())))
                    .filter(transaction -> (dateOfValuation == null || transaction.getDateOfValuation().toString().startsWith(dateOfValuation)))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            logger.error("Error occurred while filtering transactions: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred while filtering transactions");
        }
    }

    public Transaction getTransactionById(Long id) {
        logger.info("Fetching transaction with ID {}", id);

        return transactionRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Transaction with ID {} not found", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found");
                });
    }

    public List<String> getProjectNameSuggestions(String query) {
        logger.info("Fetching project name suggestions for query: {}", query);

        try {
            return transactionRepository.findProjectNamesContaining(query);
        } catch (Exception e) {
            logger.error("Error fetching project name suggestions: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching project name suggestions");
        }
    }

    public List<Transaction> getLast5TransactionsByProjectName(String projectName) {
        logger.info("Fetching last 5 transactions for project name: {}", projectName);

        try {
            PageRequest pageRequest = PageRequest.of(0, 5);
            return transactionRepository.findTop5ByProjectNameOrderByDateOfValuationDesc(projectName, pageRequest);
        } catch (Exception e) {
            logger.error("Error fetching last 5 transactions: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching last 5 transactions");
        }
    }

    public Transaction addTransaction(Transaction transaction) {
        logger.info("Adding a new transaction");

        try {
            return transactionRepository.save(transaction);
        } catch (Exception e) {
            logger.error("Error saving transaction: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error saving transaction");
        }
    }

    public Transaction updateTransaction(Long id, Transaction updatedTransaction) {
        logger.info("Updating transaction with ID {}", id);

        Transaction existingTransaction = transactionRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Transaction with ID {} not found", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found");
                });

        try {
            existingTransaction.setSizeSqFt(updatedTransaction.getSizeSqFt());
            existingTransaction.setPropertyType(updatedTransaction.getPropertyType());
            existingTransaction.setNoOfFloors(updatedTransaction.getNoOfFloors());
            existingTransaction.setAddress(updatedTransaction.getAddress());
            existingTransaction.setProjectName(updatedTransaction.getProjectName());
            existingTransaction.setPrice(updatedTransaction.getPrice());
            existingTransaction.setYear(updatedTransaction.getYear());
            existingTransaction.setPricePerSqft(updatedTransaction.getPricePerSqft());
            existingTransaction.setFacilities(updatedTransaction.getFacilities());
            existingTransaction.setDateOfValuation(updatedTransaction.getDateOfValuation());

            return transactionRepository.save(existingTransaction);
        } catch (Exception e) {
            logger.error("Error updating transaction: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error updating transaction");
        }
    }

    public void deleteTransaction(Long id) {
        logger.info("Attempting to delete transaction with ID {}", id);

        try {
            transactionRepository.deleteById(id);
            logger.info("Transaction with ID {} deleted successfully", id);
        } catch (Exception e) {
            logger.error("Error deleting transaction: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting transaction");
        }
    }

    public String getRoleFromToken(String token) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getRoleFromToken'");
    }
}
