import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate


function AdminUserManagement() {
    const [users, setUsers] = useState([]); // Store all users
    const [newUser, setNewUser] = useState({ name: '', email: '', role: '', password: '' }); // Include password in new user data
    const [editingUser, setEditingUser] = useState(null); // Store user being edited
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Use navigate from react-router-dom

    useEffect(() => {
        fetchUsers();
    }, []);

    // Fetch all users from the server
    const fetchUsers = async () => {
        const token = localStorage.getItem('token'); // Get token from local storage
        try {
            const response = await axios.get('http://localhost:8081/api/admin/users', {
                headers: {
                    Authorization: `Bearer ${token}`, // Include token in the request
                },
            });
            const filteredUsers = response.data.filter(user => user.role !== 'ADMIN');
            setUsers(filteredUsers);
        } catch (error) {
            console.error("Failed to fetch users", error.response?.data || error.message);
        }
    };
    
    

    // Handle input change for new or editing user
    const handleInputChange = (e, isEditing = false) => {
        const { name, value } = e.target;
        if (isEditing) {
            setEditingUser((prev) => ({ ...prev, [name]: value }));
        } else {
            setNewUser((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Add a new user
    const addUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8081/api/admin/users', newUser);
            setUsers([...users, response.data]);
            setNewUser({ name: '', email: '', role: '', password: '' }); // Reset form
        } catch (error) {
            console.error("Failed to add user", error);
            setError('Failed to add user');
        }
    };

    // Edit an existing user
    const editUser = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8081/api/admin/users/${editingUser.id}`, editingUser);
            fetchUsers(); // Refresh the user list
            setEditingUser(null); // Reset edit mode
        } catch (error) {
            console.error("Failed to edit user", error);
            setError('Failed to edit user');
        }
    };

    // Delete a user
    // Delete a user
    const deleteUser = async (userId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:8081/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchUsers(); // Refresh user list
        } catch (error) {
            console.error("Failed to delete user", error.response?.data || error.message);
            setError(error.response?.data?.error || "Failed to delete user");
        }
    };
    


    // Navigate back to the home page without refreshing
    const navigateHome = () => {
        navigate('/'); // Use navigate instead of window.location.href
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Admin User Management</h2>
            
            <button onClick={navigateHome} style={styles.homeButton}>Back to Home</button>

            <div style={styles.columnsContainer}>
                {/* Add New User Form (Left Side) */}
                <div style={styles.leftColumn}>
                    <h3>Add New User</h3>
                    <form onSubmit={addUser}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={newUser.name}
                                onChange={(e) => handleInputChange(e)}
                                required
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={newUser.email}
                                onChange={(e) => handleInputChange(e)}
                                required
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={newUser.password}
                                onChange={(e) => handleInputChange(e)}
                                required
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Role</label>
                            <select
                                name="role"
                                value={newUser.role}
                                onChange={(e) => handleInputChange(e)}
                                required
                                style={styles.input}
                            >
                                <option value="">Select Role</option>
                                <option value="BUYER">Buyer</option>
                                <option value="AGENT">Agent</option>
                            </select>
                        </div>
                        <button type="submit" style={styles.button}>Add User</button>
                    </form>
                </div>

                {/* List of Users (Right Side) */}
                <div style={styles.rightColumn}>
                    <h3>All Users</h3>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <ul style={styles.userList}>
                        {users.map((user) => (
                            <li key={user.id} style={styles.userItem}>
                                {editingUser && editingUser.id === user.id ? (
                                    <form onSubmit={editUser} style={styles.form}>
                                        <input
                                            type="text"
                                            name="name"
                                            value={editingUser.name}
                                            onChange={(e) => handleInputChange(e, true)}
                                            style={styles.input}
                                        />
                                        <input
                                            type="email"
                                            name="email"
                                            value={editingUser.email}
                                            onChange={(e) => handleInputChange(e, true)}
                                            style={styles.input}
                                        />
                                        <select
                                            name="role"
                                            value={editingUser.role}
                                            onChange={(e) => handleInputChange(e, true)}
                                            style={styles.input}
                                        >
                                            <option value="BUYER">Buyer</option>
                                            <option value="AGENT">Agent</option>
                                        </select>
                                        <button type="submit" style={styles.button}>Save</button>
                                        <button type="button" onClick={() => setEditingUser(null)} style={styles.button}>Cancel</button>
                                    </form>
                                ) : (
                                    <>
                                        <span>{user.name} - {user.email} - {user.role}</span>
                                        <div style={styles.buttonsContainer}>
                                            <button onClick={() => setEditingUser(user)} style={styles.button}>Edit</button>
                                            <button onClick={() => deleteUser(user.id)} style={styles.button}>Delete</button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
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
    homeButton: {
        padding: '10px 20px',
        backgroundColor: '#17a2b8',
        color: '#fff',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        marginBottom: '20px',
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
    userList: {
        listStyleType: 'none',
        padding: 0,
    },
    userItem: {
        padding: '15px',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    form: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    buttonsContainer: {
        display: 'flex',
        gap: '10px',
    },
};

export default AdminUserManagement;
