import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUnreadCount, getUserNotifications, markAsRead, markAllAsRead } from '../services/notificationService';
import './NotificationBell.css';

const NotificationBell = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchUnreadCount = async () => {
        if (!user?.email) return;
        try {
            console.log('Fetching unread count for user:', user.email);
            const count = await getUnreadCount(user.email);
            console.log('Unread count:', count);
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const fetchNotifications = async () => {
        if (!user?.email) return;
        try {
            console.log('Fetching notifications for user:', user.email);
            const allNotifications = await getUserNotifications(user.email);
            console.log('All notifications:', allNotifications);
            setNotifications(allNotifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // Initial fetch
    useEffect(() => {
        if (user?.email) {
            console.log('User authenticated, fetching notifications');
            fetchUnreadCount();
            fetchNotifications();
        }
    }, [user]);

    // Poll for new notifications every 30 seconds
    useEffect(() => {
        if (!user?.email) return;

        console.log('Setting up notification polling');
        const pollInterval = setInterval(() => {
            console.log('Polling for new notifications');
            fetchUnreadCount();
            if (isOpen) {
                fetchNotifications();
            }
        }, 30000); // 30 seconds

        return () => clearInterval(pollInterval);
    }, [user, isOpen]);

    const handleBellClick = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            fetchNotifications();
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            // Mark the notification as read
            await markAsRead(notification.id);
            
            // Update the notification in the state
            setNotifications(prevNotifications =>
                prevNotifications.map(n =>
                    n.id === notification.id ? { ...n, read: true } : n
                )
            );

            // Handle navigation based on notification type
            if (notification.type === 'COURSE_COMMENT') {
                // Navigate to the course with the specific comment
                navigate(`/courses?courseId=${notification.courseId}&commentId=${notification.relatedId}`);
            } else if (notification.type === 'COMMENT_REPLY') {
                // Navigate to the comment reply
                navigate(`/courses?courseId=${notification.courseId}&commentId=${notification.relatedId}`);
            } else if (notification.type === 'COURSE_REACTION' || notification.type === 'REACTION_REMOVED') {
                // Navigate to the course that was reacted to
                navigate(`/courses?courseId=${notification.courseId}`);
            }
            // Add other notification type handlers as needed
        } catch (error) {
            console.error('Error handling notification click:', error);
        }
    };

    const handleMarkAllRead = async () => {
        if (!user?.email) return;
        try {
            await markAllAsRead(user.email);
            setUnreadCount(0);
            fetchNotifications(); // Refresh the notifications list
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    if (!user) return null;

    return (
        <div className="notification-bell">
            <div className={`bell-icon ${unreadCount > 0 ? 'has-notifications' : ''}`} onClick={handleBellClick}>
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </div>
            
            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="mark-all-read">
                                Mark all as read
                            </button>
                        )}
                    </div>
                    
                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <p className="no-notifications">No notifications</p>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <p className="notification-message">{notification.message}</p>
                                    <small className="notification-time">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </small>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell; 