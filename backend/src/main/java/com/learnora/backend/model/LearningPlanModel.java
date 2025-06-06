package com.learnora.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "learning_plans")
public class LearningPlanModel {

    @Id
    private String id;
    private String userEmail; // To associate plan with user
    private String title;
    private String description;
    private Date startDate;
    private Date endDate;
    private Integer progress;
    private String status;
    private boolean shared;
    private List<Topic> topics;
    @Field("imageUrl")
    private String imageUrl;
    private Date createdAt;
    @Field("enrolledUsers")
    private List<String> enrolledUsers;

    public LearningPlanModel() {
        this.topics = new ArrayList<>();
        this.enrolledUsers = new ArrayList<>();
        this.createdAt = new Date();
    }

    public LearningPlanModel(String userEmail, String title, String description, Date startDate, Date endDate, List<Topic> topics, String imageUrl) {
        this.userEmail = userEmail;
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.topics = topics != null ? topics : new ArrayList<>();
        this.enrolledUsers = new ArrayList<>();
        this.createdAt = new Date();
        this.imageUrl = imageUrl;
    }

    public static class Topic {
        private String title;
        private String resources;
        private boolean completed;

        public Topic() {}

        public Topic(String title, String resources, boolean completed) {
            this.title = title;
            this.resources = resources;
            this.completed = completed;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getResources() {
            return resources;
        }

        public void setResources(String resources) {
            this.resources = resources;
        }

        public boolean isCompleted() {
            return completed;
        }

        public void setCompleted(boolean completed) {
            this.completed = completed;
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isShared() {
        return shared;
    }

    public void setShared(boolean shared) {
        this.shared = shared;
    }

    public List<Topic> getTopics() {
        return topics;
    }

    public void setTopics(List<Topic> topics) {
        this.topics = topics;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public List<String> getEnrolledUsers() {
        return enrolledUsers != null ? enrolledUsers : new ArrayList<>();
    }

    public void setEnrolledUsers(List<String> enrolledUsers) {
        this.enrolledUsers = enrolledUsers != null ? enrolledUsers : new ArrayList<>();
    }
}