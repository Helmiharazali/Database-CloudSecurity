import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function PropertyDetails() {
    const { propertyId } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ subject: '', content: '' });
    const [messageStatus, setMessageStatus] = useState('');
    const [favoriteStatus, setFavoriteStatus] = useState('');
    const [userRole, setUserRole] = useState(null); // For storing the user's role
    const [isEditing, setIsEditing] = useState(false); // Track edit mode
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPropertyDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const propertyResponse = await axios.get(`http://localhost:8081/api/properties/${propertyId}`);
                setProperty(propertyResponse.data);

                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT token
                    setUserRole(payload.role); // Get the user's role from the token
                }
            } catch (error) {
                console.error("Error fetching property details:", error);
                setError('Failed to load property details.');
            } finally {
                setLoading(false);
            }
        };

        fetchPropertyDetails();
    }, [propertyId]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Handle form input changes
    const handleChange = (e) => {
        setProperty({ ...property, [e.target.name]: e.target.value });
    };

    // Handle saving property details (Admin only)
    const handleSaveProperty = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert("You need to be logged in as Admin to update properties.");
            return;
        }

        try {
            console.log("Updating property:", property); // Log the property object
            await axios.put(`http://localhost:8081/api/properties/update/${propertyId}`, property, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Property updated successfully!');
            setIsEditing(false); // Exit edit mode
        } catch (error) {
            console.error("Failed to update property", error.response || error); // Log the error response
            alert('Failed to update property.');
        }
    };

    // Handle message form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!property.agent) {
                setMessageStatus('Agent details not available.');
                return;
            }
            await axios.post('http://localhost:8081/api/messages', {
                recipient: property.agent.email,
                subject: form.subject,
                content: form.content
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMessageStatus('Message sent successfully!');
            setForm({ subject: '', content: '' });
        } catch (err) {
            setMessageStatus('Failed to send message. Please log in first.');
            console.error("Failed to send message:", err);
        }
    };

    // Handle adding property to favorites
    const handleAddToFavorites = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setFavoriteStatus('Please log in to add this property to favorites.');
            return;
        }

        try {
            await axios.post(`http://localhost:8081/api/favorites/add/${propertyId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFavoriteStatus('Property added to favorites!');
        } catch (err) {
            if (err.response && err.response.status === 409) {
                setFavoriteStatus('This property is already in your favorites.');
            } else {
                setFavoriteStatus('Failed to add property to favorites. Please try again.');
            }
            console.error("Failed to add property to favorites:", err);
        }
    };

    // Handle deleting the property (for Admin only)
    const handleDeleteProperty = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:8081/api/properties/delete/${propertyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/'); // Navigate back to the home page or another page after deletion
        } catch (err) {
            console.error("Failed to delete property:", err);
            setError('Failed to delete the property.');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div style={{ width: '100%', maxWidth: '600px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                <h2>Property Details</h2>
                {property && (
                    <>
                        <div>
                            <strong>Size SqFt:</strong>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="sizeSqFt"
                                    value={property.sizeSqFt}
                                    onChange={handleChange}
                                    style={{ padding: '5px', marginTop: '10px', width: '100%' }}
                                />
                            ) : (
                                <p>{property.sizeSqFt}</p>
                            )}
                        </div>
                        <div>
                            <strong>Property Type:</strong>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="propertyType"
                                    value={property.propertyType}
                                    onChange={handleChange}
                                    style={{ padding: '5px', marginTop: '10px', width: '100%' }}
                                />
                            ) : (
                                <p>{property.propertyType}</p>
                            )}
                        </div>
                        <div>
                            <strong>Number of Floors:</strong>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="noOfFloors"
                                    value={property.noOfFloors}
                                    onChange={handleChange}
                                    style={{ padding: '5px', marginTop: '10px', width: '100%' }}
                                />
                            ) : (
                                <p>{property.noOfFloors}</p>
                            )}
                        </div>
                        <div>
                            <strong>Address:</strong>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="address"
                                    value={property.address}
                                    onChange={handleChange}
                                    style={{ padding: '5px', marginTop: '10px', width: '100%' }}
                                />
                            ) : (
                                <p>{property.address}</p>
                            )}
                        </div>
                        <div>
                            <strong>Project Name:</strong>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="projectName"
                                    value={property.projectName}
                                    onChange={handleChange}
                                    style={{ padding: '5px', marginTop: '10px', width: '100%' }}
                                />
                            ) : (
                                <p>{property.projectName}</p>
                            )}
                        </div>
                        <div>
                            <strong>Price:</strong>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="price"
                                    value={property.price}
                                    onChange={handleChange}
                                    style={{ padding: '5px', marginTop: '10px', width: '100%' }}
                                />
                            ) : (
                                <p>${property.price.toLocaleString()}</p>
                            )}
                        </div>
                        <div>
                            <strong>Year:</strong>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="year"
                                    value={property.year}
                                    onChange={handleChange}
                                    style={{ padding: '5px', marginTop: '10px', width: '100%' }}
                                />
                            ) : (
                                <p>{property.year}</p>
                            )}
                        </div>
                        <div>
                            <strong>Price Per SqFt:</strong>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="pricePerSqft"
                                    value={property.pricePerSqft}
                                    onChange={handleChange}
                                    style={{ padding: '5px', marginTop: '10px', width: '100%' }}
                                />
                            ) : (
                                <p>${property.pricePerSqft}</p>
                            )}
                        </div>
                        <div>
                            <strong>Facilities:</strong>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="facilities"
                                    value={property.facilities}
                                    onChange={handleChange}
                                    style={{ padding: '5px', marginTop: '10px', width: '100%' }}
                                />
                            ) : (
                                <p>{property.facilities}</p>
                            )}
                        </div>
                        <div>
                            <strong>Date of Valuation:</strong>
                            <p>{formatDate(property.dateOfValuation)}</p>
                        </div>

                        <h3>Agent Details</h3>
                        {property.agent ? (
                            <>
                                <p><strong>Name:</strong> {property.agent.name}</p>
                                <p><strong>Email:</strong> {property.agent.email}</p>
                                <p><strong>Phone Number:</strong> {property.agent.phoneNumber}</p>
                            </>
                        ) : (
                            <p>No agent assigned</p>
                        )}

                        <button onClick={handleAddToFavorites} style={{ padding: '10px', backgroundColor: 'blue', color: 'white', border: 'none', cursor: 'pointer', marginBottom: '10px', width: '100%' }}>
                            Add to Favorites
                        </button>
                        {favoriteStatus && <p>{favoriteStatus}</p>}
                    </>
                )}

                <h3>Contact Agent</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Subject:</label>
                        <input
                            type="text"
                            name="subject"
                            value={form.subject}
                            onChange={handleChange}
                            required
                            style={{ padding: '5px', width: '100%' }}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Message:</label>
                        <textarea
                            name="content"
                            value={form.content}
                            onChange={handleChange}
                            required
                            style={{ padding: '5px', width: '100%', height: '100px' }}
                        ></textarea>
                    </div>
                    <button type="submit" style={{ padding: '10px', backgroundColor: 'green', color: 'white', border: 'none', cursor: 'pointer', width: '100%' }}>
                        Send Message
                    </button>
                </form>

                {messageStatus && <p>{messageStatus}</p>}

                {/* Show Edit and Delete buttons for Admin */}
                {userRole === 'ADMIN' && (
                    <>
                        {isEditing ? (
                            <button
                                onClick={handleSaveProperty}
                                style={{ padding: '10px', backgroundColor: 'green', color: 'white', border: 'none', cursor: 'pointer', marginTop: '20px', width: '100%' }}
                            >
                                Save Property
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    style={{ padding: '10px', backgroundColor: 'orange', color: 'white', border: 'none', cursor: 'pointer', marginTop: '20px', width: '100%' }}
                                >
                                    Edit Property
                                </button>
                                <button
                                    onClick={handleDeleteProperty}
                                    style={{ padding: '10px', backgroundColor: 'red', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px', width: '100%' }}
                                >
                                    Delete Property
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default PropertyDetails;
