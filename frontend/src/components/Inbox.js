import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Inbox() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ recipientEmail: '', subject: '', content: '' });
    const [showForm, setShowForm] = useState(false);  // State to toggle form visibility

    // Fetch received messages when the component loads
    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true); // Start loading before fetch
            try {
                const response = await axios.get('http://localhost:8081/api/messages', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setLoading(false); // Stop loading after fetch
                if (response.data && response.data.length > 0) {
                    // Sort messages by timestamp in descending order so the latest ones are on top
                    const sortedMessages = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    setMessages(sortedMessages);
                } else {
                    setError('No messages found');
                }
            } catch (err) {
                setLoading(false); // Stop loading on error
                setError('Failed to fetch messages');
                console.error("Failed to fetch messages:", err);
            }
        };
        fetchMessages();
    }, []);

    // Handle form input changes
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8081/api/messages', {
                recipient: form.recipientEmail,
                subject: form.subject,
                content: form.content
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setForm({ recipientEmail: '', subject: '', content: '' });
            alert('Message sent successfully!');
            // Fetch the messages again after sending a new one to update the list
            const response = await axios.get('http://localhost:8081/api/messages', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const sortedMessages = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setMessages(sortedMessages);  // Update the message list
        } catch (err) {
            setError('Failed to send message');
            console.error("Failed to send message:", err);
        }
    };

    // Navigate back to the home page
    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Inbox</h2>

            {/* Toggleable Form Section */}
            <button onClick={() => setShowForm(!showForm)} style={styles.toggleButton}>
                {showForm ? "Hide New Message" : "Send New Message"}
            </button>

            <div style={styles.columnsContainer}>
                {/* Send New Message Form (Left Side) */}
                {showForm && (
                    <div style={styles.leftColumn}>
                        <h3>Send a New Message</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Recipient Email:</label>
                                <input
                                    type="email"
                                    name="recipientEmail"
                                    value={form.recipientEmail}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Subject:</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={form.subject}
                                    onChange={handleChange}
                                    required
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Content:</label>
                                <textarea
                                    name="content"
                                    value={form.content}
                                    onChange={handleChange}
                                    required
                                    style={styles.textarea}
                                ></textarea>
                            </div>
                            <button type="submit" style={styles.button}>Send Message</button>
                        </form>
                    </div>
                )}

                {/* Messages Section (Right Side) */}
                <div style={styles.rightColumn}>
                    {loading ? (
                        <p>Loading messages...</p>
                    ) : (
                        <>
                            {messages.length > 0 ? (
                                <ul style={styles.messageList}>
                                    {messages.map((message, index) => (
                                        <li key={index} onClick={() => navigate(`/messages/${message.id}`)} style={styles.messageItem}>
                                            <p><strong>From:</strong> {message.sender}</p>
                                            <p><strong>Subject:</strong> {message.subject}</p>
                                            <p><strong>Snippet:</strong> {message.content.substring(0, 100)}...</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ color: 'red' }}>{error}</p>
                            )}
                        </>
                    )}
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
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Optional
        borderRadius: '8px', // Optional
    },
    title: {
        fontSize: '24px',
        marginBottom: '20px',
        color: '#333',
    },
    toggleButton: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
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
    textarea: {
        width: '100%',
        padding: '8px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        fontSize: '16px',
        height: '100px',
        boxSizing: 'border-box',
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: '#fff',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        marginTop: '10px',
    },
    messageList: {
        listStyleType: 'none',
        padding: 0,
    },
    messageItem: {
        padding: '15px',
        borderBottom: '1px solid #ddd',
        cursor: 'pointer',
        backgroundColor: '#fff',
        borderRadius: '5px',
        marginBottom: '10px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
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

export default Inbox;
