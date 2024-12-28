import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Import Link
import axios from 'axios';

function TransactionDetailsPage() {
    const { id } = useParams(); // Extract id from the route params
    const [transaction, setTransaction] = useState(null); // Store the main transaction details
    const [lastTransactions, setLastTransactions] = useState([]); // Store the last 5 transactions
    const [error] = useState('');
    const [userRole, setUserRole] = useState(null); // To store user role
    const [isEditing, setIsEditing] = useState(false); // Track edit mode
    const navigate = useNavigate();

    // Fetch transaction details and last 5 transactions when the component loads
    useEffect(() => {
        const fetchTransactionDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT token
                    setUserRole(payload.role); // Get user role from the token
                }

                const transactionResponse = await axios.get(`http://localhost:8081/api/transactions/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTransaction(transactionResponse.data); // Set the main transaction details

                // Fetch the last 5 transactions using the project name
                const lastTransactionsResponse = await axios.get(`http://localhost:8081/api/transactions/${transactionResponse.data.projectName}/last5`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLastTransactions(lastTransactionsResponse.data); // Set the last 5 transactions
            } catch (error) {
                console.error("Failed to fetch transaction details", error);
            }
        };

        fetchTransactionDetails();
    }, [id]);

    // Navigate back to the previous page
    const goBack = () => {
        navigate(-1); // This will navigate back to the previous page
    };

    // Handle input changes for editing
    const handleChange = (e) => {
        setTransaction({ ...transaction, [e.target.name]: e.target.value });
    };

    // Handle transaction update (Admin only)
    const handleSaveTransaction = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert("You need to be logged in as Admin to update transactions.");
            return;
        }

        try {
            console.log("Updating transaction:", transaction); // Log the transaction object
            await axios.put(`http://localhost:8081/api/transactions/update/${id}`, transaction, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Transaction updated successfully!');
            setIsEditing(false); // Exit edit mode
        } catch (error) {
            console.error("Failed to update transaction", error.response || error); // Log the error response
            alert('Failed to update transaction.');
        }
    };

    // Handle transaction deletion (Admin only)
    const handleDeleteTransaction = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("No token found. Please login again.");
            return;
        }
    
        try {
            await axios.delete(`http://localhost:8081/api/transactions/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Transaction deleted successfully');
            navigate('/'); // Navigate back after deletion
        } catch (error) {
            console.error("Failed to delete transaction", error.response || error);
            alert('Failed to delete transaction.');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <h1>Transaction Details</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {transaction ? (
                <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px', marginBottom: '20px' ,backgroundColor: 'rgba(255, 255, 255, 0.8)'}}>
                    <div>
                        <strong>Project Name:</strong>
                        {isEditing ? (
                            <input
                                type="text"
                                name="projectName"
                                value={transaction.projectName}
                                onChange={handleChange}
                                style={{ padding: '5px', marginTop: '10px', width: '100%' }}
                            />
                        ) : (
                            <p>{transaction.projectName}</p>
                        )}
                    </div>
                    <div>
                        <strong>Price:</strong>
                        {isEditing ? (
                            <input
                                type="number"
                                name="price"
                                value={transaction.price}
                                onChange={handleChange}
                                style={{ padding: '5px', marginTop: '10px', width: '100%' }}
                            />
                        ) : (
                            <p>${transaction.price.toLocaleString()}</p>
                        )}
                    </div>
                    <div>
                        <strong>Size (SqFt):</strong>
                        {isEditing ? (
                            <input
                                type="text"
                                name="sizeSqFt"
                                value={transaction.sizeSqFt}
                                onChange={handleChange}
                                style={{ padding: '5px', marginTop: '10px', width: '100%' }}
                            />
                        ) : (
                            <p>{transaction.sizeSqFt}</p>
                        )}
                    </div>
                    <div>
                        <strong>Property Type:</strong>
                        {isEditing ? (
                            <input
                                type="text"
                                name="propertyType"
                                value={transaction.propertyType}
                                onChange={handleChange}
                                style={{ padding: '5px', marginTop: '10px', width: '100%' }}
                            />
                        ) : (
                            <p>{transaction.propertyType}</p>
                        )}
                    </div>
                    <div>
                        <strong>No of Floors:</strong>
                        {isEditing ? (
                            <input
                                type="number"
                                name="noOfFloors"
                                value={transaction.noOfFloors}
                                onChange={handleChange}
                                style={{ padding: '5px', marginTop: '10px', width: '100%' }}
                            />
                        ) : (
                            <p>{transaction.noOfFloors}</p>
                        )}
                    </div>
                    <div>
                        <strong>Address:</strong>
                        {isEditing ? (
                            <input
                                type="text"
                                name="address"
                                value={transaction.address}
                                onChange={handleChange}
                                style={{ padding: '5px', marginTop: '10px', width: '100%' }}
                            />
                        ) : (
                            <p>{transaction.address}</p>
                        )}
                    </div>
                    <div>
                        <strong>Year of Valuation:</strong>
                        {isEditing ? (
                            <input
                                type="number"
                                name="year"
                                value={transaction.year}
                                onChange={handleChange}
                                style={{ padding: '5px', marginTop: '10px', width: '100%' }}
                            />
                        ) : (
                            <p>{transaction.year}</p>
                        )}
                    </div>
                    <div>
                        <strong>Facilities:</strong>
                        {isEditing ? (
                            <input
                                type="text"
                                name="facilities"
                                value={transaction.facilities}
                                onChange={handleChange}
                                style={{ padding: '5px', marginTop: '10px', width: '100%' }}
                            />
                        ) : (
                            <p>{transaction.facilities}</p>
                        )}
                    </div>
                    <div>
                        <strong>Date of Valuation:</strong>
                        <p>{new Date(transaction.dateOfValuation).toLocaleDateString()}</p>
                    </div>

                    {/* Edit/Delete buttons for Admin */}
                    {userRole === 'ADMIN' && (
                        <>
                            {isEditing ? (
                                <button
                                    onClick={handleSaveTransaction}
                                    style={{ padding: '10px', backgroundColor: 'green', color: 'white', border: 'none', cursor: 'pointer', marginTop: '20px' }}
                                >
                                    Save Transaction
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        style={{ padding: '10px', backgroundColor: 'orange', color: 'white', border: 'none', cursor: 'pointer', marginTop: '20px' }}
                                    >
                                        Edit Transaction
                                    </button>
                                    <button
                                        onClick={handleDeleteTransaction}
                                        style={{ padding: '10px', backgroundColor: 'red', color: 'white', border: 'none', cursor: 'pointer', marginTop: '20px', marginLeft: '10px' }}
                                    >
                                        Delete Transaction
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            ) : (
                <p>Loading transaction details...</p>
            )}

            <h2>Last 5 Transactions</h2>
            {lastTransactions.length > 0 ? (
                <ul style={{ listStyleType: 'none', padding: 20 ,backgroundColor: 'rgba(255, 255, 255, 0.8)',borderRadius:'8px'}}>
                    {lastTransactions.map((lastTransaction) => (
                        <li key={lastTransaction.id} style={{ padding: '10px 0', borderBottom: '1px solid #ccc' }}>
                            <Link to={`/transactions/${lastTransaction.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <p><strong>Project Name:</strong> {lastTransaction.projectName}</p>
                                <p><strong>Price:</strong> ${lastTransaction.price.toLocaleString()}</p>
                                <p><strong>Date of Valuation:</strong> {new Date(lastTransaction.dateOfValuation).toLocaleDateString()}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No recent transactions found.</p>
            )}

            <button onClick={goBack} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }}>
                Go Back
            </button>
        </div>
    );
}

export default TransactionDetailsPage;
