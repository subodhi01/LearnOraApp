package com.learnora.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "comments")
public class CommentModel {

    @Id
    private String id;
    private String postId;
    private String userId;
    private String username;
    private String text;
    private LocalDateTime createdAt;
    private String parentId; // ID of the parent comment if this is a reply
    private List<CommentModel> replies; // List of replies to this comment

    public CommentModel() {
        this.replies = new ArrayList<>();
    }

    public CommentModel(String postId, String userId, String username, String text) {
        this.postId = postId;
        this.userId = userId;
        this.username = username;
        this.text = text;
        this.createdAt = LocalDateTime.now();
        this.replies = new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPostId() {
        return postId;
    }

    public void setPostId(String postId) {
        this.postId = postId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public List<CommentModel> getReplies() {
        return replies;
    }

    public void setReplies(List<CommentModel> replies) {
        this.replies = replies;
    }
}