package com.learnora.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;
import java.util.Date;

@Document(collection = "progress")
public class ProgressTemplate {
    @Id
    private String id;
    private String userId;
    private String courseId;
    private String learningPlanId;
    private List<TopicProgress> topics;
    private List<CustomItem> customItems;
    private double totalProgress;
    private Date createdAt;
    private Date updatedAt;
    private boolean isActive;

    // Nested class for topic progress
    public static class TopicProgress {
        private String topicId;
        private String topicName;
        private double percentage;
        private double currentProgress;

        // Getters and Setters
        public String getTopicId() { return topicId; }
        public void setTopicId(String topicId) { this.topicId = topicId; }
        public String getTopicName() { return topicName; }
        public void setTopicName(String topicName) { this.topicName = topicName; }
        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }
        public double getCurrentProgress() { return currentProgress; }
        public void setCurrentProgress(double currentProgress) { this.currentProgress = currentProgress; }
    }

    // Nested class for custom items
    public static class CustomItem {
        private String id;
        private String name;
        private double percentage;
        private double currentProgress;

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }
        public double getCurrentProgress() { return currentProgress; }
        public void setCurrentProgress(double currentProgress) { this.currentProgress = currentProgress; }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    public String getLearningPlanId() { return learningPlanId; }
    public void setLearningPlanId(String learningPlanId) { this.learningPlanId = learningPlanId; }
    public List<TopicProgress> getTopics() { return topics; }
    public void setTopics(List<TopicProgress> topics) { this.topics = topics; }
    public List<CustomItem> getCustomItems() { return customItems; }
    public void setCustomItems(List<CustomItem> customItems) { this.customItems = customItems; }
    public double getTotalProgress() { return totalProgress; }
    public void setTotalProgress(double totalProgress) { this.totalProgress = totalProgress; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
} 