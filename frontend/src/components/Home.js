import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App'; // Import context
import '../home.css';

function Home() {
    const navigate = useNavigate();
    const { userRole, setUserRole } = useContext(AuthContext); // Use userRole from context
    const [searchTerm, setSearchTerm] = useState('');
    const [projectSuggestions, setProjectSuggestions] = useState([]); // Store project suggestions
    const [propertyType, setPropertyType] = useState(''); // Property type search field
    const [propertyTypeSuggestions, setPropertyTypeSuggestions] = useState([]); // Store property type suggestions
    const [sizeSqFt, setSizeSqFt] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [facilities, setFacilities] = useState('');
    const [year, setYear] = useState('');
    const [properties, setProperties] = useState([]); // Store all properties
    const [displayedProperties, setDisplayedProperties] = useState([]); // Properties to display per page
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1); // Track the current page
    const limit = 15; // Limit to 15 properties per page

    useEffect(() => {
        console.log("userRole from context in Home:", userRole);
    }, [userRole]);

    const switchToTransactionSearch = () => {
        navigate('/transaction-search');
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const handleSignup = () => {
        navigate('/signup');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUserRole(null);
        navigate('/');
    };

    const handleProfileNavigation = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const id = user ? user.id : null;
        if (!id) {
            console.log("User ID is undefined. Redirecting to login.");
            navigate('/login');
        } else {
            navigate(`/profile/${id}`);
        }
    };

    const navigateToInbox = () => {
        navigate('/inbox'); // Navigates to the Inbox page
    };

    const navigateToFavoriteList = () => {
        navigate('/favorites'); // Navigates to the Favorite List page
    };

    // Fetch project name suggestions
    const fetchProjectSuggestions = async (query) => {
        if (query.length < 2) {
            setProjectSuggestions([]);
            return;
        }
        try {
            const response = await axios.get('http://localhost:8081/api/properties/suggest', {
                params: { query },
            });
            setProjectSuggestions(response.data);
        } catch (error) {
            console.error("Failed to fetch suggestions", error);
        }
    };

    // Fetch property type suggestions
    const fetchPropertyTypeSuggestions = async (query) => {
        if (query.length < 2) {
            setPropertyTypeSuggestions([]);
            return;
        }
        try {
            const response = await axios.get('http://localhost:8081/api/properties/suggestPropertyType', {
                params: { query },
            });
            setPropertyTypeSuggestions(response.data);
        } catch (error) {
            console.error("Failed to fetch property type suggestions", error);
        }
    };

    const handleSearchTermChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        fetchProjectSuggestions(value);
    };

    const handleProjectSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion);
        setProjectSuggestions([]);
    };

    const handlePropertyTypeChange = (e) => {
        const value = e.target.value;
        setPropertyType(value);
        fetchPropertyTypeSuggestions(value);
    };

    const handlePropertyTypeSuggestionClick = (suggestion) => {
        setPropertyType(suggestion);
        setPropertyTypeSuggestions([]);
    };

    // Function to handle search and retrieve properties
    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.get('http://localhost:8081/api/properties/search', {
                params: {
                    projectName: searchTerm.trim() || undefined,
                    propertyType: propertyType.trim() || undefined, // Include property type in search
                    minPrice: minPrice || undefined,
                    maxPrice: maxPrice || undefined,
                    sizeSqFt: sizeSqFt || undefined,
                    facilities: facilities.trim() || undefined,
                    year: year || undefined,
                },
            });
            const allProperties = response.data;
            setProperties(allProperties);
            setCurrentPage(1); // Reset to page 1 when a new search is made
            setDisplayedProperties(allProperties.slice(0, limit)); // Show the first 15 properties
        } catch (error) {
            console.error("Search failed: ", error);
            setError('An error occurred while searching. Please try again.');
        }
    };

    // Function to view property details
    const viewPropertyDetails = (propertyId) => {
        navigate(`/properties/${propertyId}`);
    };

    // Function to add a property to favorites
    const addToFavorites = async (propertyId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("You need to log in to add to favorites.");
            navigate('/login');
            return;
        }

        try {
            await axios.post(`http://localhost:8081/api/favorites/add/${propertyId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Property added to favorites!");
        } catch (error) {
            if (error.response && error.response.status === 409) {
                alert("This property is already in your favorites.");
            } else {
                console.error("Failed to add to favorites:", error);
                alert("An error occurred while adding to favorites. Please try again.");
            }
        }
    };

    // Function to handle pagination and move to the next page
    const handleNextPage = () => {
        const totalProperties = properties.length;
        const startIndex = currentPage * limit;
        const endIndex = startIndex + limit;
        if (startIndex < totalProperties) {
            setDisplayedProperties(properties.slice(startIndex, endIndex));
            setCurrentPage(currentPage + 1);
        }
    };

    // Function to handle pagination and move to the previous page
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            const startIndex = (currentPage - 2) * limit;
            const endIndex = startIndex + limit;
            setDisplayedProperties(properties.slice(startIndex, endIndex));
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Welcome to the Housing Property Website</h1>
            {error && <p style={styles.error}>{error}</p>}
            <div style={styles.actionsContainer}>
                {!userRole ? (
                    <div>
                        <button onClick={handleLogin} style={styles.button}>Login</button>
                        <button onClick={handleSignup} style={styles.button}>Signup</button>
                    </div>
                ) : (
                    <div>
                        <button onClick={handleProfileNavigation} style={styles.button}>User Profile</button>
                        {(userRole === 'ADMIN' || userRole === 'AGENT') && (
                            <button onClick={() => navigate('/manage-properties', { state: { userRole } })} style={styles.button}>
                                Manage Properties
                            </button>
                        )}
                        {userRole === 'ADMIN' && (
                            <button onClick={() => navigate('/admin/users')} style={styles.button}>
                                Manage Users
                            </button>
                        )}
                        <button onClick={handleLogout} style={styles.button}>Logout</button>
                        <button onClick={navigateToInbox} style={styles.button}>Inbox</button>
                        <button onClick={navigateToFavoriteList} style={styles.button}>View Favorite List</button>
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
                {projectSuggestions.length > 0 && (
                    <ul style={styles.suggestions}>
                        {projectSuggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                onClick={() => handleProjectSuggestionClick(suggestion)}
                                style={styles.suggestionItem}
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
                <input
                    type="text"
                    placeholder="Property Type"
                    value={propertyType}
                    onChange={handlePropertyTypeChange}
                    style={styles.input}
                />
                {propertyTypeSuggestions.length > 0 && (
                    <ul style={styles.suggestions}>
                        {propertyTypeSuggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                onClick={() => handlePropertyTypeSuggestionClick(suggestion)}
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
            <button onClick={switchToTransactionSearch} style={styles.switchButton}>Switch to Transaction Search</button>

            <div>
                <h2 style={styles.subTitle}>Search Results:</h2>
                {displayedProperties.length > 0 ? (
                    <ul style={styles.propertyList}>
                        {displayedProperties.map((property) => (
                            <li key={property.id} style={styles.propertyItem}>
                                <strong>{property.projectName}</strong> - {property.propertyType} - ${property.price}
                                <button onClick={() => viewPropertyDetails(property.id)} style={styles.propertyButton}>View Details</button>
                                <button onClick={() => addToFavorites(property.id)} style={styles.propertyButton}>Add to Favorites</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No properties found</p>
                )}
            </div>

            <div style={styles.pagination}>
                <button onClick={handlePreviousPage} disabled={currentPage === 1} style={styles.paginationButton}>
                    Previous
                </button>
                <span> Page {currentPage} </span>
                <button onClick={handleNextPage} disabled={currentPage * limit >= properties.length} style={styles.paginationButton}>
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

export default Home;
