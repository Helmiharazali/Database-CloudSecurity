import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App'; // Import context

function TransactionSearchPage() {
    const navigate = useNavigate();
    const { userRole, setUserRole } = useContext(AuthContext); // Use context to get and set user role
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]); // Store suggestions
    const [sizeSqFt, setSizeSqFt] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [facilities, setFacilities] = useState('');
    const [year, setYear] = useState('');
    const [transactions, setTransactions] = useState([]); // Store all transactions
    const [displayedTransactions, setDisplayedTransactions] = useState([]); // Transactions to display per page
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1); // Track the current page
    const limit = 15; // Limit the number of transactions per page

    useEffect(() => {
        console.log("userRole from context in TransactionSearchPage:", userRole);
    }, [userRole]);

    const handleLogin = () => {
        navigate('/login');
    };

    const handleSignup = () => {
        navigate('/signup');
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear token from localStorage
        setUserRole(null); // Reset user role
        navigate('/'); // Redirect to home page
    };

    const switchToHome = () => {
        navigate('/');
    };

    const fetchSuggestions = async (query) => {
        if (query.length < 2) {
            setSuggestions([]); // Clear suggestions if the query is too short
            return;
        }
        try {
            // Fetch suggestions from the transaction table
            const response = await axios.get('http://localhost:8081/api/transactions/suggest', {
                params: { query },
            });
            setSuggestions(response.data); // Set the suggestions from the transaction table
        } catch (error) {
            console.error("Failed to fetch suggestions", error);
        }
    };

    const handleSearchTermChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        fetchSuggestions(value); // Fetch suggestions from transaction data
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion);
        setSuggestions([]); // Clear suggestions to close the dropdown
    };

    // Function to handle search and retrieve transactions
    const handleSearch = async (e) => {
        e.preventDefault();
        setError(''); // Clear error before search
        try {
            const response = await axios.get('http://localhost:8081/api/transactions/search', {
                params: {
                    projectName: searchTerm.trim() || undefined,
                    minPrice: minPrice || undefined,
                    maxPrice: maxPrice || undefined,
                    sizeSqFt: sizeSqFt || undefined,
                    facilities: facilities.trim() || undefined,
                    year: year || undefined, // Include year of valuation in the search
                },
            });
            const allTransactions = response.data;
            setTransactions(allTransactions); // Set all transactions
            setCurrentPage(1); // Reset to page 1 after new search
            setDisplayedTransactions(allTransactions.slice(0, limit)); // Show the first 15 transactions
        } catch (error) {
            console.error("Search failed: ", error);
            setError('An error occurred while searching. Please try again.');
        }
    };

    const viewTransactionDetails = (id) => {
        navigate(`/transactions/${id}`); // Navigate to a TransactionDetails page
    };

    const handleNextPage = () => {
        const totalTransactions = transactions.length;
        const startIndex = currentPage * limit;
        const endIndex = startIndex + limit;
        if (startIndex < totalTransactions) {
            setDisplayedTransactions(transactions.slice(startIndex, endIndex));
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            const startIndex = (currentPage - 2) * limit;
            const endIndex = startIndex + limit;
            setDisplayedTransactions(transactions.slice(startIndex, endIndex));
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Transaction Search Page</h1>
            {error && <p style={styles.error}>{error}</p>}
            <div style={styles.actionsContainer}>
                {!userRole ? (
                    <div>
                        <button onClick={handleLogin} style={styles.button}>Login</button>
                        <button onClick={handleSignup} style={styles.button}>Signup</button>
                    </div>
                ) : (
                    <div>
                        <button onClick={handleLogout} style={styles.button}>Logout</button>
                    </div>
                )}
            </div>

            <form onSubmit={handleSearch} style={styles.form}>
                <input
                    type="text"
                    placeholder="Project Name"
                    value={searchTerm}
                    onChange={handleSearchTermChange}
                    style={styles.input}
                />
                {suggestions.length > 0 && (
                    <ul style={styles.suggestions}>
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                style={styles.suggestionItem}
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
                <input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    style={styles.input}
                />
                <input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    style={styles.input}
                />
                <input
                    type="text"
                    placeholder="Size SqFt"
                    value={sizeSqFt}
                    onChange={(e) => setSizeSqFt(e.target.value)}
                    style={styles.input}
                />
                <input
                    type="text"
                    placeholder="Facilities (e.g., gym, pool)"
                    value={facilities}
                    onChange={(e) => setFacilities(e.target.value)}
                    style={styles.input}
                />
                <input
                    type="number"
                    placeholder="Year of Valuation"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    style={styles.input}
                />
                <button type="submit" style={styles.searchButton}>Search</button>
            </form>

            <button onClick={switchToHome} style={styles.switchButton}>Back to Home</button>

            <div>
                <h2 style={styles.subTitle}>Search Results:</h2>
                {displayedTransactions.length > 0 ? (
                    <ul style={styles.propertyList}>
                        {displayedTransactions.map((transaction) => (
                            <li key={transaction.id} style={styles.propertyItem}>
                                <strong>{transaction.projectName}</strong> - ${transaction.price}
                                <button onClick={() => viewTransactionDetails(transaction.id)} style={styles.propertyButton}>View Details</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No transactions found</p>
                )}
            </div>

            <div style={styles.pagination}>
                <button onClick={handlePreviousPage} disabled={currentPage === 1} style={styles.paginationButton}>
                    Previous
                </button>
                <span> Page {currentPage} </span>
                <button onClick={handleNextPage} disabled={currentPage * limit >= transactions.length} style={styles.paginationButton}>
                    Next
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Optional
        borderRadius: '8px', // Optional
    },
    title: {
        fontSize: '32px',
        marginBottom: '20px',
        color: '#333',
    },
    error: {
        color: 'red',
    },
    actionsContainer: {
        marginBottom: '20px',
    },
    button: {
        padding: '10px 20px',
        margin: '5px',
        borderRadius: '5px',
        border: 'none',
        backgroundColor: '#007bff',
        color: '#fff',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    form: {
        marginBottom: '20px',
    },
    input: {
        padding: '10px',
        margin: '5px 0',
        width: 'calc(100% - 20px)',
        borderRadius: '5px',
        border: '1px solid #ddd',
        fontSize: '16px',
    },
    searchButton: {
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '5px',
        marginTop: '10px',
    },
    suggestions: {
        listStyle: 'none',
        padding: '0',
        marginTop: '0',
        marginBottom: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        maxHeight: '150px',
        overflowY: 'scroll',
    },
    suggestionItem: {
        padding: '10px',
        cursor: 'pointer',
        borderBottom: '1px solid #ddd',
        backgroundColor: '#fff',
    },
    switchButton: {
        padding: '10px 20px',
        backgroundColor: '#17a2b8',
        color: '#fff',
        borderRadius: '5px',
        border: 'none',
        marginBottom: '20px',
        cursor: 'pointer',
    },
    subTitle: {
        fontSize: '24px',
        marginBottom: '15px',
        color: '#333',
    },
    propertyList: {
        listStyle: 'none',
        padding: '0',
    },
    propertyItem: {
        padding: '15px',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    propertyButton: {
        padding: '8px 15px',
        marginLeft: '10px',
        backgroundColor: '#007bff',
        color: '#fff',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
    },
    pagination: {
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationButton: {
        padding: '10px',
        backgroundColor: '#007bff',
        color: '#fff',
        borderRadius: '5px',
        border: 'none',
        margin: '0 5px',
        cursor: 'pointer',
        disabled: {
            cursor: 'not-allowed',
            backgroundColor: '#ccc',
        },
    },
};

export default TransactionSearchPage;
