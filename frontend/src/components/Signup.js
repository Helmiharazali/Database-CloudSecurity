import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import navigate

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('BUYER');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Use navigate for redirecting

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading to true
        setMessage(''); // Clear any previous messages

        try {
            const response = await axios.post('http://localhost:8081/api/users/register', {
                name: name,
                email: email,
                password: password,
                role: role,
            });
            setMessage('Signup successful! Welcome ' + response.data.name);
            setName('');
            setEmail('');
            setPassword('');
            setRole('BUYER');
        } catch (error) {
            console.error("Signup failed: ", error);
            setMessage('Signup failed: ' + (error.response?.data?.message || 'Unknown error'));
        } finally {
            setLoading(false); // Set loading to false when done
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Signup</h2>
            <form onSubmit={handleSignup} style={styles.form}>
                <div style={styles.inputGroup}>
                    <label htmlFor="name" style={styles.label}>Name</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="email" style={styles.label}>Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="password" style={styles.label}>Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="role" style={styles.label}>Role</label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                        style={styles.select}
                    >
                        <option value="BUYER">Buyer</option>
                        <option value="AGENT">Agent</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={loading ? styles.buttonLoading : styles.button}
                >
                    {loading ? 'Signing up...' : 'Signup'}
                </button>
            </form>
            {message && <p style={styles.message}>{message}</p>}
            <p style={styles.loginText}>
                Already have an account?{' '}
                <button
                    onClick={() => navigate('/login')}
                    style={styles.loginButton}
                >
                    Login here
                </button>
            </p>
        </div>
    );
}

const styles = {
    container: {
        backgroundColor: '#f7f7f7',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        maxWidth: '400px',
        margin: '50px auto',
        textAlign: 'center',
    },
    title: {
        fontSize: '24px',
        marginBottom: '20px',
        fontFamily: 'Avenir, sans-serif',
        color: '#333',
    },
    form: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        color: '#555',
    },
    input: {
        width: '100%',
        padding: '12px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        fontSize: '16px',
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'border-color 0.3s',
    },
    select: {
        width: '100%',
        padding: '12px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        fontSize: '16px',
        outline: 'none',
        cursor: 'pointer',
        backgroundColor: '#fff',
    },
    button: {
        padding: '12px 20px',
        width: '100%',
        borderRadius: '5px',
        backgroundColor: '#007bff',
        color: '#fff',
        fontSize: '16px',
        cursor: 'pointer',
        border: 'none',
        transition: 'background-color 0.3s',
    },
    buttonLoading: {
        padding: '12px 20px',
        width: '100%',
        borderRadius: '5px',
        backgroundColor: '#0056b3',
        color: '#fff',
        fontSize: '16px',
        cursor: 'not-allowed',
        border: 'none',
        opacity: 0.7,
    },
    message: {
        marginTop: '15px',
        color: 'green',
    },
    loginText: {
        marginTop: '20px',
        fontSize: '14px',
        color: '#333',
    },
    loginButton: {
        background: 'none',
        color: '#007bff',
        border: 'none',
        cursor: 'pointer',
        textDecoration: 'underline',
        fontSize: '14px',
    },
};

export default Signup;
