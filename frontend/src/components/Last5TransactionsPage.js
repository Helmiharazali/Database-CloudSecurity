import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Last5TransactionsPage() {
    const { projectName } = useParams(); // Extract project name from the route params
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState('');

    // Fetch the last 5 transactions by project name
    useEffect(() => {
        const fetchLast5Transactions = async () => {
            try {
                const response = await axios.get(`http://localhost:8081/api/transactions/${projectName}/last5`);
                setTransactions(response.data);
            } catch (error) {
                console.error("Failed to fetch last 5 transactions", error);
                setError('An error occurred while fetching transactions. Please try again.');
            }
        };

        fetchLast5Transactions();
    }, [projectName]);

    // Function to navigate to the Transaction Details page
    const viewTransactionDetails = (id) => {
        navigate(`/transaction-details/${id}`);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Last 5 Transactions for {projectName}</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {transactions.length > 0 ? (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {transactions.map((transaction) => (
                        <li key={transaction.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
                            <strong>{transaction.projectName}</strong> - ${transaction.price} - Valued on {new Date(transaction.dateOfValuation).toLocaleDateString()}
                            <button 
                                onClick={() => viewTransactionDetails(transaction.id)} 
                                style={{ marginLeft: '10px' }}>
                                View Details
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No transactions found</p>
            )}
        </div>
    );
}

export default Last5TransactionsPage;
