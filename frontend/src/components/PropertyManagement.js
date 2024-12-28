import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App'; // Import AuthContext to get userRole
import { useNavigate } from 'react-router-dom'; // For navigation to home page

function PropertyManagement() {
    const { userRole } = useContext(AuthContext); // Get userRole from the AuthContext
    const [properties, setProperties] = useState([]);
    const [newProperty, setNewProperty] = useState({
        id: null,
        sizeSqFt: '',
        propertyType: '',
        noOfFloors: '',
        address: '',
        projectName: '',
        price: '',
        year: '',
        pricePerSqft: '',
        facilities: '',
        dateOfValuation: ''
    });
    const [loading, setLoading] = useState(false); // Loading state
    const [feedbackMessage, setFeedbackMessage] = useState(''); // Feedback message
    const navigate = useNavigate(); // For navigating back to home page

    // Debug: Check userRole
    useEffect(() => {
        console.log("userRole from context in PropertyManagement:", userRole);
    }, [userRole]);

    // Automatically calculate price per square feet
    useEffect(() => {
        const { price, sizeSqFt } = newProperty;
        if (price && sizeSqFt && !isNaN(price) && !isNaN(sizeSqFt) && sizeSqFt > 0) {
            const pricePerSqft = (price / sizeSqFt).toFixed(2);
            setNewProperty((prevProperty) => ({
                ...prevProperty,
                pricePerSqft,
            }));
        } else {
            setNewProperty((prevProperty) => ({
                ...prevProperty,
                pricePerSqft: '',
            }));
        }
    }, [newProperty]); // Add the entire newProperty object to the dependency array
    
    

    // Fetch properties on component mount
    useEffect(() => {
        const fetchAgentProperties = async () => {
            try {
                setLoading(true); // Show loading indicator
                const token = localStorage.getItem('token'); // Get the token from local storage
                const response = await axios.get('http://localhost:8081/api/properties/agent-properties', {
                    headers: { Authorization: `Bearer ${token}` } // Attach the token in the request header
                });
                setProperties(response.data); // Set the properties in state
            } catch (error) {
                console.error("Error fetching agent properties:", error);
                setFeedbackMessage('Failed to fetch properties. Please try again.');
            } finally {
                setLoading(false); // Hide loading indicator
            }
        };

        fetchAgentProperties();
    }, []);

    // Form validation to ensure required fields are filled
    const validateForm = () => {
        if (!newProperty.projectName || !newProperty.price || !newProperty.sizeSqFt) {
            setFeedbackMessage('Please fill in all required fields: Project Name, Price, and Size SqFt.');
            return false;
        }
        return true;
    };

    // Add or update property
    const handleAddProperty = async () => {
        if (!validateForm()) return;

        try {
            const token = localStorage.getItem('token'); // Get the token
            let response;
            if (newProperty.id) {
                // If the property has an ID, update it
                response = await axios.put(`http://localhost:8081/api/properties/update/${newProperty.id}`, newProperty, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProperties(properties.map(property => property.id === newProperty.id ? response.data : property));
                setFeedbackMessage('Property updated successfully!');
            } else {
                // Otherwise, create a new property
                response = await axios.post('http://localhost:8081/api/properties/add', newProperty, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProperties([...properties, response.data]); // Add the new property to the list
                setFeedbackMessage('Property added successfully!');
            }
            // Reset the fields after adding
            setNewProperty({
                id: null,
                sizeSqFt: '',
                propertyType: '',
                noOfFloors: '',
                address: '',
                projectName: '',
                price: '',
                year: '',
                pricePerSqft: '',
                facilities: '',
                dateOfValuation: ''
            });
        } catch (error) {
            console.error("Error adding property:", error);
            setFeedbackMessage('Error adding property. Please try again.');
        }
    };

    // Delete property with confirmation
    const handleDeleteProperty = async (propertyId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this property?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem('token'); // Get the token
            await axios.delete(`http://localhost:8081/api/properties/delete/${propertyId}`, {
                headers: { Authorization: `Bearer ${token}` } // Attach the token
            });
            setProperties(properties.filter((property) => property.id !== propertyId)); // Remove the deleted property from the list
            setFeedbackMessage('Property deleted successfully!');
        } catch (error) {
            console.error("Error deleting property:", error);
            setFeedbackMessage('Error deleting property. Please try again.');
        }
    };

    // Edit property
    const handleEditProperty = (property) => {
        setNewProperty({ ...property }); // Populate the form with property data
    };

    // Go back to home page
    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Property Management</h2>

            {/* Feedback Message */}
            {feedbackMessage && (
                <p style={{ color: feedbackMessage.includes('Error') ? 'red' : 'green' }}>
                    {feedbackMessage}
                </p>
            )}

            {/* Loading Indicator */}
            {loading && <p>Loading properties...</p>}

            {/* Two-column layout */}
            <div style={styles.columnsContainer}>
                {/* Add or Edit Property Form (Left Side) */}
                <div style={styles.leftColumn}>
                    <h3>{newProperty.id ? 'Edit Property' : 'Add New Property'}</h3>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Size SqFt:</label>
                        <input
                            type="text"
                            value={newProperty.sizeSqFt}
                            onChange={(e) => setNewProperty({ ...newProperty, sizeSqFt: e.target.value })}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Property Type:</label>
                        <input
                            type="text"
                            value={newProperty.propertyType}
                            onChange={(e) => setNewProperty({ ...newProperty, propertyType: e.target.value })}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Number of Floors:</label>
                        <input
                            type="number"
                            value={newProperty.noOfFloors}
                            onChange={(e) => setNewProperty({ ...newProperty, noOfFloors: e.target.value })}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Address:</label>
                        <input
                            type="text"
                            value={newProperty.address}
                            onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Project Name:</label>
                        <input
                            type="text"
                            value={newProperty.projectName}
                            onChange={(e) => setNewProperty({ ...newProperty, projectName: e.target.value })}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Price:</label>
                        <input
                            type="number"
                            value={newProperty.price}
                            onChange={(e) => setNewProperty({ ...newProperty, price: e.target.value })}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Year:</label>
                        <input
                            type="number"
                            value={newProperty.year}
                            onChange={(e) => setNewProperty({ ...newProperty, year: e.target.value })}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Price Per SqFt:</label>
                        <input
                            type="number"
                            value={newProperty.pricePerSqft}
                            readOnly
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Facilities:</label>
                        <input
                            type="text"
                            value={newProperty.facilities}
                            onChange={(e) => setNewProperty({ ...newProperty, facilities: e.target.value })}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Date of Valuation:</label>
                        <input
                            type="date"
                            value={newProperty.dateOfValuation}
                            onChange={(e) => setNewProperty({ ...newProperty, dateOfValuation: e.target.value })}
                            style={styles.input}
                        />
                    </div>
                    <button onClick={handleAddProperty} style={styles.button}>
                        {newProperty.id ? 'Update Property' : 'Add Property'}
                    </button>
                </div>

                {/* List of Existing Properties (Right Side) */}
                <div style={styles.rightColumn}>
                    <h3>Existing Properties</h3>
                    <ul style={styles.propertyList}>
                        {properties.map((property) => (
                            <li key={property.id} style={styles.propertyItem}>
                                <strong>{property.projectName}</strong> - {property.propertyType} - ${property.price}
                                <div>
                                    <button onClick={() => handleEditProperty(property)} style={styles.button}>
                                        Edit
                                    </button>
                                    {/* Show delete button for both ADMIN and AGENT roles */}
                                    {(userRole === 'ADMIN' || userRole === 'AGENT') && (
                                        <button onClick={() => handleDeleteProperty(property.id)} style={styles.button}>
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Back to Home Button */}
            <button onClick={handleGoHome} style={styles.homeButton}>Back to Home</button>
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1000px',
        margin: 'auto',
        textAlign: 'center',
    },
    title: {
        fontSize: '24px',
        marginBottom: '20px',
        color: '#333',
    },
    columnsContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '20px',
    },
    leftColumn: {
        flex: '1',
        backgroundColor: '#f7f7f7',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    rightColumn: {
        flex: '1',
        backgroundColor: '#f7f7f7',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    inputGroup: {
        marginBottom: '10px',
        textAlign: 'left',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontSize: '14px',
        color: '#555',
    },
    input: {
        width: '100%',
        padding: '8px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        fontSize: '16px',
        boxSizing: 'border-box',
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        marginTop: '10px',
    },
    propertyList: {
        listStyleType: 'none',
        padding: 0,
    },
    propertyItem: {
        padding: '15px',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    homeButton: {
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#17a2b8',
        color: '#fff',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
    },
};

export default PropertyManagement;
