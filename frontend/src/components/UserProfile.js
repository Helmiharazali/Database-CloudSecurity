import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function UserProfile() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Unauthorized. Please log in.");
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'}/api/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUser(response.data);
                setName(response.data.name);
                setEmail(response.data.email);
                setPhoneNumber(response.data.phoneNumber);
                setAddress(response.data.address);
                setProfilePictureUrl(response.data.profilePicturePath
                    ? `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'}/${response.data.profilePicturePath}`
                    : '/path/to/default-profile-picture.png');
            } catch (error) {
                setError(error.response?.data?.error || 'Failed to load user profile.');
            }
        };

        fetchUserProfile();
    }, [id, navigate]);

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Unauthorized. Please log in.");
            navigate('/login');
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('phoneNumber', phoneNumber);
            formData.append('address', address);

            if (profilePicture) {
                formData.append('profilePicture', profilePicture);
            }

            const response = await axios.put(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'}/api/users/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            setUser(response.data);
            setEditMode(false);
            setProfilePictureUrl(response.data.profilePicturePath
                ? `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081'}/${response.data.profilePicturePath}`
                : '/path/to/default-profile-picture.png');
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to update user profile.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoHome = () => {
        navigate('/');
    };

    if (!user) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div style={styles.container}>
            <div style={styles.profileCard}>
                <h2 style={styles.title}>User Profile</h2>
                {editMode ? (
                    <div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Name:</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Phone Number:</label>
                            <input
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Address:</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Profile Picture:</label>
                            <input type="file" onChange={(e) => setProfilePicture(e.target.files[0])} />
                            <div style={{ marginTop: '10px' }}>
                                <img
                                    src={profilePictureUrl}
                                    alt="Profile"
                                    style={styles.profileImage}
                                />
                            </div>
                        </div>
                        <div style={styles.buttonGroup}>
                            <button onClick={handleSave} style={styles.saveButton} disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={() => setEditMode(false)} style={styles.cancelButton}>
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p><strong>Name:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Phone Number:</strong> {user.phoneNumber}</p>
                        <p><strong>Address:</strong> {user.address}</p>
                        <div>
                            <strong>Profile Picture:</strong>
                            <div style={{ marginTop: '10px' }}>
                                <img
                                    src={profilePictureUrl}
                                    alt="Profile"
                                    style={styles.profileImage}
                                />
                            </div>
                        </div>
                        <div style={styles.buttonGroup}>
                            <button onClick={() => setEditMode(true)} style={styles.editButton}>Edit Profile</button>
                        </div>
                    </div>
                )}
                <button onClick={handleGoHome} style={styles.homeButton}>Back to Home</button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    },
    profileCard: {
        width: '100%',
        maxWidth: '400px',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '10px',
        backgroundColor: '#fff',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    title: {
        fontSize: '24px',
        marginBottom: '20px',
        fontFamily: 'Avenir, sans-serif',
        color: '#333',
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
    profileImage: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
    },
    buttonGroup: {
        marginTop: '20px',
    },
    saveButton: {
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginRight: '10px',
    },
    cancelButton: {
        padding: '10px 20px',
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    editButton: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
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

export default UserProfile;
