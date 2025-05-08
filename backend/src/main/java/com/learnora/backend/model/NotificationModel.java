package com.learnora.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "notifications")
public class NotificationModel {
    @Id
    private String id;
    private String userId;
    private String type;
    private String message;
    private String relatedId; // ID of the related comment or post
    private String courseId;  // ID of the course for navigation
    private boolean read;
    private LocalDateTime createdAt;

    public NotificationModel() {
        this.createdAt = LocalDateTime.now();
        this.read = false;
    }

    public NotificationModel(String userId, String type, String message, String relatedId, String courseId) {
        this();
        this.userId = userId;
        this.type = type;
        this.message = message;
        this.relatedId = relatedId;
        this.courseId = courseId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRelatedId() {
        return relatedId;
    }

    public void setRelatedId(String relatedId) {
        this.relatedId = relatedId;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}