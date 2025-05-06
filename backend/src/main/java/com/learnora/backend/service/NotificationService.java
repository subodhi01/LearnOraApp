package com.learnora.backend.service;

import com.learnora.backend.model.NotificationModel;
import com.learnora.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
public class NotificationService {
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    public NotificationModel createNotification(String userId, String type, String message, String relatedId) {
        logger.info("Creating notification for user {}: type={}, message={}, relatedId={}", 
            userId, type, message, relatedId);
        NotificationModel notification = new NotificationModel(userId, type, message, relatedId);
        NotificationModel savedNotification = notificationRepository.save(notification);
        logger.info("Notification created successfully with ID: {}", savedNotification.getId());
        return savedNotification;
    }

    public List<NotificationModel> getUserNotifications(String userId) {
        logger.info("Fetching all notifications for user: {}", userId);
        List<NotificationModel> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        logger.info("Found {} notifications for user {}", notifications.size(), userId);
        return notifications;
    }

    public List<NotificationModel> getUnreadNotifications(String userId) {
        logger.info("Fetching unread notifications for user: {}", userId);
        List<NotificationModel> notifications = notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(userId, false);
        logger.info("Found {} unread notifications for user {}", notifications.size(), userId);
        return notifications;
    }

    public long getUnreadCount(String userId) {
        logger.info("Fetching unread count for user: {}", userId);
        long count = notificationRepository.countByUserIdAndRead(userId, false);
        logger.info("Unread count for user {}: {}", userId, count);
        return count;
    }

    public NotificationModel markAsRead(String notificationId, String userEmail) {
        logger.info("Marking notification as read: {} for user: {}", notificationId, userEmail);
        NotificationModel notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUserId().equals(userEmail)) {
            throw new RuntimeException("Unauthorized: You can only mark your own notifications as read");
        }

        notification.setRead(true);
        NotificationModel updatedNotification = notificationRepository.save(notification);
        logger.info("Notification marked as read successfully: {}", notificationId);
        return updatedNotification;
    }

    public void markAllAsRead(String userId) {
        logger.info("Marking all notifications as read for user: {}", userId);
        List<NotificationModel> unreadNotifications = getUnreadNotifications(userId);
        unreadNotifications.forEach(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
        logger.info("Marked {} notifications as read for user {}", unreadNotifications.size(), userId);
    }
} 