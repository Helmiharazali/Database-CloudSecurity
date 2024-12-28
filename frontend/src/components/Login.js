import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App'; // Import context

function Login() {
    const { setUserRole } = useContext(AuthContext); // Use context to set user role
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(''); // Add error state
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8081/api/users/login', {
                email: email,
                password: password,
            });
            
            const token = response.data.token;
            const id = response.data.id; // Ensure backend sends 'id'
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ id, role: response.data.role })); // Store the id in localStorage
            
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserRole(payload.role);
    
            setMessage('Login successful!');
            navigate('/');
        } catch (error) {
            console.error("Login failed: ", error);
            setMessage('Login failed: ' + (error.response?.data?.message || 'Wrong username or password'));
            setError(error.response?.data?.error || 'Login failed'); // Set error message
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
            <form onSubmit={handleLogin} style={styles.form}>
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
                <button type="submit" style={styles.button}>Login</button>
            </form>
            <p style={styles.message}>{message}</p>
            <p style={styles.signupText}>
                Don't have an account?{' '}
                <button
                    onClick={() => navigate('/signup')}
                    style={styles.signupButton}
                >
                    Signup here
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
    inputFocus: {
        borderColor: '#333',
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
    buttonHover: {
        backgroundColor: '#0056b3',
    },
    message: {
        marginTop: '15px',
        color: 'green',
    },
    signupText: {
        marginTop: '20px',
        fontSize: '14px',
        color: '#333',
    },
    signupButton: {
        background: 'none',
        color: '#007bff',
        border: 'none',
        cursor: 'pointer',
        textDecoration: 'underline',
        fontSize: '14px',
    },
};

export default Login;
