import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: '',
    });

    useEffect(() => {
        // Fetch all users when the component loads
        axios.get('/api/admin/users').then(response => {
            setUsers(response.data);
        });
    }, []);

    const handleDelete = (userId) => {
        axios.delete(`/api/admin/users/${userId}`).then(() => {
            // Remove the deleted user from the UI
            setUsers(users.filter(user => user.id !== userId));
        });
    };

    const handleAdd = () => {
        axios.post('/api/admin/users', formData).then(response => {
            setUsers([...users, response.data]);
            setFormData({ name: '', email: '', password: '', role: '' });
        });
    };

    const handleEdit = (userId) => {
        axios.put(`/api/admin/users/${userId}`, formData).then(response => {
            const updatedUser = response.data;
            setUsers(users.map(user => (user.id === updatedUser.id ? updatedUser : user)));
            setSelectedUser(null); // Reset after editing
        });
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '', // Don't show the password
        });
    };

    return (
        <div>
            <h1>Admin User Management</h1>

            <div>
                <h3>{selectedUser ? 'Edit User' : 'Add New User'}</h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    selectedUser ? handleEdit(selectedUser.id) : handleAdd();
                }}>
                    <input
                        type="text"
                        placeholder="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!selectedUser} // Required only when adding
                    />
                    <input
                        type="text"
                        placeholder="Role (ADMIN/AGENT/BUYER)"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        required
                    />
                    <button type="submit">{selectedUser ? 'Update User' : 'Add User'}</button>
                </form>
            </div>

            <h3>User List</h3>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        {user.name} - {user.email} ({user.role})
                        <button onClick={() => handleSelectUser(user)}>Edit</button>
                        <button onClick={() => handleDelete(user.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminUsers;
