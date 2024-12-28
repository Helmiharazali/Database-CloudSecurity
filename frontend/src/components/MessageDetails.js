import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';

function MessageDetails() {
    const { messageId } = useParams();
    const navigate = useNavigate(); // Use navigate for redirection
    const [conversation, setConversation] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true); // Loading state
    const [showReplyForm, setShowReplyForm] = useState(false); // State to toggle reply form
    const [replyForm, setReplyForm] = useState({ recipientEmail: '', subject: '', content: '' }); // Reply form state

    useEffect(() => {
        const fetchConversation = async () => {
            try {
                setLoading(true); // Start loading
                // Fetch the message details to find out the other user's email
                const messageResponse = await axios.get(`http://localhost:8081/api/messages/${messageId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                const messageData = messageResponse.data;

                // Fetch the full conversation between the logged-in user and the other user
                const conversationResponse = await axios.get(`http://localhost:8081/api/messages/conversation/${messageData.sender}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });

                // Sort the messages by timestamp in descending order (latest messages on top)
                const sortedConversation = conversationResponse.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                setConversation(sortedConversation);

                // Set up the reply form with recipient and subject
                setReplyForm((prevForm) => ({
                    ...prevForm,
                    recipientEmail: messageData.sender,
                    subject: `Re: ${messageData.subject}` // Prefix "Re:" to indicate a reply
                }));
            } catch (error) {
                setError('Failed to fetch conversation details');
                console.error("Failed to fetch conversation details:", error);
            } finally {
                setLoading(false); // Stop loading
            }
        };
        fetchConversation();
    }, [messageId]);

    // Handle reply form input changes
    const handleReplyChange = (e) => {
        setReplyForm({ ...replyForm, [e.target.name]: e.target.value });
    };

    // Handle reply form submission
    const handleReplySubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8081/api/messages', {
                recipient: replyForm.recipientEmail,
                subject: replyForm.subject,
                content: replyForm.content
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Reply sent successfully!');
            setReplyForm({ recipientEmail: '', subject: '', content: '' });
            setShowReplyForm(false); // Hide the reply form after sending
        } catch (err) {
            setError('Failed to send reply');
            console.error("Failed to send reply:", err);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Conversation</h1>

            {/* Back to Inbox Button */}
            <button 
                onClick={() => navigate('/inbox')} // Navigate back to inbox
                style={styles.backButton}
            >
                Back to Inbox
            </button>

            {loading ? (
                <p style={styles.loading}>Loading conversation...</p>
            ) : (
                <>
                    {/* Toggleable Reply Form */}
                    <button 
                        onClick={() => {
                            setShowReplyForm(!showReplyForm);
                            if (!showReplyForm) {
                                // Focus on content area when opening reply form
                                setTimeout(() => document.getElementById('replyContent').focus(), 0);
                            }
                        }}
                        style={styles.replyButton}
                    >
                        {showReplyForm ? "Hide Reply" : "Reply"}
                    </button>

                    {showReplyForm && (
                        <div style={styles.replyContainer}>
                            <h2 style={styles.subTitle}>Reply to {replyForm.recipientEmail}</h2>
                            <form onSubmit={handleReplySubmit}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Subject:</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={replyForm.subject}
                                        onChange={handleReplyChange}
                                        required
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Content:</label>
                                    <textarea
                                        id="replyContent"
                                        name="content"
                                        value={replyForm.content}
                                        onChange={handleReplyChange}
                                        required
                                        style={styles.textarea}
                                    ></textarea>
                                </div>
                                <button type="submit" style={styles.submitButton}>Send Reply</button>
                            </form>
                        </div>
                    )}

                    {error && <p style={styles.error}>{error}</p>}

                    {conversation.length > 0 ? (
                        conversation.map((msg, index) => (
                            <div 
                                key={index} 
                                style={styles.message}
                            >
                                <p style={styles.sender}><strong>{msg.sender}:</strong></p>
                                <p style={styles.content}>{msg.content}</p>
                                <p style={styles.timestamp}><small>{new Date(msg.timestamp).toLocaleString()}</small></p>
                            </div>
                        ))
                    ) : (
                        <p>No messages in this conversation.</p>
                    )}
                </>
            )}
        </div>
    );
}

// Styles object with improved spacing for buttons
const styles = {
    container: {
        padding: '20px',
        maxWidth: '600px',
        margin: 'auto',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    title: {
        fontSize: '28px',
        fontWeight: '600',
        marginBottom: '20px',
        color: '#333',
        textAlign: 'center',
    },
    loading: {
        fontSize: '18px',
        color: '#666',
    },
    error: {
        color: 'red',
        fontSize: '16px',
        marginBottom: '20px',
    },
    backButton: {
        padding: '10px 20px',
        backgroundColor: '#17a2b8',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginBottom: '20px',
        marginRight: '10px', // Add margin to the right to space out buttons
    },
    replyButton: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginBottom: '20px',
        marginLeft: '10px', // Add margin to the left to create space between buttons
    },
    replyContainer: {
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#fff',
        marginBottom: '20px',
    },
    subTitle: {
        fontSize: '22px',
        marginBottom: '15px',
        color: '#333',
    },
    inputGroup: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontSize: '16px',
        fontWeight: '500',
    },
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '16px',
        borderRadius: '5px',
        border: '1px solid #ddd',
    },
    textarea: {
        width: '100%',
        padding: '10px',
        fontSize: '16px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        height: '120px',
        resize: 'none',
    },
    submitButton: {
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    message: {
        marginBottom: '20px',
        borderBottom: '1px solid #ddd',
        paddingBottom: '10px',
    },
    sender: {
        fontSize: '16px',
        color: '#333',
    },
    content: {
        fontSize: '16px',
        color: '#555',
        marginBottom: '10px',
    },
    timestamp: {
        fontSize: '12px',
        color: '#999',
    },
};

export default MessageDetails;
