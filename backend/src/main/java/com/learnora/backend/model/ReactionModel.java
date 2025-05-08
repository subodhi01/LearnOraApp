package com.learnora.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "reactions")
public class ReactionModel {
    @Id
    private String id;
    private String userId;
    private String contentId; // ID of the course, post, or video
    private String contentType; // "COURSE", "POST", or "VIDEO"
    private String reactionType; // "LIKE" or "DISLIKE"
    private LocalDateTime createdAt;

    public ReactionModel() {
        this.createdAt = LocalDateTime.now();
    }

    public ReactionModel(String userId, String contentId, String contentType, String reactionType) {
        this();
        this.userId = userId;
        this.contentId = contentId;
        this.contentType = contentType;
        this.reactionType = reactionType;
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

    public String getContentId() {
        return contentId;
    }

    public void setContentId(String contentId) {
        this.contentId = contentId;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getReactionType() {
        return reactionType;
    }

    public void setReactionType(String reactionType) {
        this.reactionType = reactionType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}