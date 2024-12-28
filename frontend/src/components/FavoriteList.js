import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FavoriteList = () => {
    const [favorites, setFavorites] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:8081/api/favorites', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const sortedFavorites = response.data.sort((a, b) => b.id - a.id);
                setFavorites(sortedFavorites);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching favorites', error);
                setError('Failed to load favorite properties.');
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    const handlePropertyClick = (propertyId) => {
        navigate(`/properties/${propertyId}`);
    };

    const handleRemoveFavorite = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:8081/api/favorites/remove/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setFavorites(favorites.filter(favorite => favorite.id !== id));
        } catch (error) {
            console.error('Error removing favorite', error);
            setError('Failed to remove property from favorites.');
        }
    };

    // Navigate back to home page
    const navigateHome = () => {
        navigate('/');
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Your Favorite Properties</h2>

            <button onClick={navigateHome} style={styles.homeButton}>Back to Home</button>

            {loading ? (
                <p>Loading favorite properties...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <ul style={styles.list}>
                    {favorites.length > 0 ? (
                        favorites.map(property => (
                            <li key={property.id} style={styles.propertyCard}>
                                <h3 
                                    onClick={() => handlePropertyClick(property.id)} 
                                    style={styles.propertyTitle}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0px 0px 2px rgba(0, 0, 0, 0.1)';
                                    }}
                                >
                                    {property.projectName}
                                </h3>
                                <p><strong>Address:</strong> {property.address}</p>
                                <p><strong>Price:</strong> ${property.price}</p>
                                <p><strong>Size:</strong> {property.sizeSqFt} sq ft</p>
                                <button 
                                    onClick={() => handleRemoveFavorite(property.id)} 
                                    style={styles.removeButton}
                                >
                                    Remove from Favorites
                                </button>
                            </li>
                        ))
                    ) : (
                        <p>You have no favorite properties yet!</p>
                    )}
                </ul>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '800px',
        margin: 'auto',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Optional
        borderRadius: '8px', // Optional
    },
    title: {
        fontSize: '24px',
        marginBottom: '20px',
        color: '#333',
    },
    homeButton: {
        padding: '10px 20px',
        backgroundColor: '#17a2b8',
        color: '#fff',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        marginBottom: '20px',
    },
    list: {
        listStyleType: 'none',
        padding: 0,
    },
    propertyCard: {
        marginBottom: '20px',
        borderBottom: '1px solid #ccc',
        paddingBottom: '20px',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    },
    propertyTitle: {
        cursor: 'pointer',
        textDecoration: 'none',
        color: 'black',
        padding: '10px',
        display: 'inline-block',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    },
    removeButton: {
        padding: '5px 10px',
        backgroundColor: 'red',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '10px',
    },
};

export default FavoriteList;
