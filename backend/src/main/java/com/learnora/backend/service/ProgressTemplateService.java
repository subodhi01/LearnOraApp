package com.learnora.backend.service;

import com.learnora.backend.model.ProgressTemplate;
import com.learnora.backend.repository.ProgressTemplateRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ProgressTemplateService {
    private static final Logger logger = LoggerFactory.getLogger(ProgressTemplateService.class);

    @Autowired
    private ProgressTemplateRepository progressTemplateRepository;

    public ProgressTemplate createTemplate(ProgressTemplate template) {
        logger.debug("Creating new progress template: {}", template);
        if (template.getUserId() == null || template.getUserId().isEmpty()) {
            throw new IllegalArgumentException("User ID is required");
        }
        template.setCreatedAt(new Date());
        template.setUpdatedAt(new Date());
        template.setActive(true);
        calculatePercentages(template);
        ProgressTemplate savedTemplate = progressTemplateRepository.save(template);
        logger.debug("Saved progress template: {}", savedTemplate);
        return savedTemplate;
    }

    public ProgressTemplate updateTemplate(String id, ProgressTemplate template) {
        logger.debug("Updating template with id: {}", id);
        Optional<ProgressTemplate> existingTemplate = progressTemplateRepository.findById(id);
        if (existingTemplate.isPresent()) {
            ProgressTemplate updatedTemplate = existingTemplate.get();
            // Only allow updating custom items
            updatedTemplate.setCustomItems(template.getCustomItems());
            updatedTemplate.setUpdatedAt(new Date());
            calculatePercentages(updatedTemplate);
            return progressTemplateRepository.save(updatedTemplate);
        }
        throw new RuntimeException("Progress template not found with id: " + id);
    }

    public void deleteTemplate(String id) {
        logger.debug("Deleting template with id: {}", id);
        if (!progressTemplateRepository.existsById(id)) {
            throw new RuntimeException("Progress template not found with id: " + id);
        }
        progressTemplateRepository.deleteById(id);
    }

    public List<ProgressTemplate> getUserTemplates(String userId) {
        logger.debug("Getting templates for user: {}", userId);
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("User ID is required");
        }
        List<ProgressTemplate> templates = progressTemplateRepository.findByUserIdAndIsActiveTrue(userId);
        logger.debug("Found {} templates for user {}", templates.size(), userId);
        return templates;
    }

    public Optional<ProgressTemplate> getTemplateByUserAndCourse(String userId, String courseId) {
        logger.debug("Getting template for user {} and course {}", userId, courseId);
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("User ID is required");
        }
        if (courseId == null || courseId.isEmpty()) {
            throw new IllegalArgumentException("Course ID is required");
        }
        return progressTemplateRepository.findByUserIdAndCourseId(userId, courseId);
    }

    private void calculatePercentages(ProgressTemplate template) {
        logger.debug("Calculating percentages for template: {}", template);
        
        // Calculate total items
        int totalItems = (template.getTopics() != null ? template.getTopics().size() : 0) + 
                        (template.getCustomItems() != null ? template.getCustomItems().size() : 0);
        
        if (totalItems == 0) {
            logger.warn("No items found in template for percentage calculation");
            return;
        }
        
        double basePercentage = 100.0 / totalItems;
        logger.debug("Base percentage per item: {}", basePercentage);

        // Set percentages for topics
        if (template.getTopics() != null) {
            for (ProgressTemplate.TopicProgress topic : template.getTopics()) {
                topic.setPercentage(basePercentage);
                logger.debug("Set topic {} percentage to {}", topic.getTopicName(), basePercentage);
            }
        }

        // Set percentages for custom items
        if (template.getCustomItems() != null) {
            for (ProgressTemplate.CustomItem item : template.getCustomItems()) {
                item.setPercentage(basePercentage);
                logger.debug("Set custom item {} percentage to {}", item.getName(), basePercentage);
            }
        }

        // Calculate total progress
        double totalProgress = 0;
        
        // Calculate progress from topics
        if (template.getTopics() != null) {
            for (ProgressTemplate.TopicProgress topic : template.getTopics()) {
                double topicProgress = (topic.getCurrentProgress() * topic.getPercentage() / 100);
                totalProgress += topicProgress;
                logger.debug("Topic {} progress: {}% (weighted: {}%)", 
                    topic.getTopicName(), topic.getCurrentProgress(), topicProgress);
            }
        }
        
        // Calculate progress from custom items
        if (template.getCustomItems() != null) {
            for (ProgressTemplate.CustomItem item : template.getCustomItems()) {
                double itemProgress = (item.getCurrentProgress() * item.getPercentage() / 100);
                totalProgress += itemProgress;
                logger.debug("Custom item {} progress: {}% (weighted: {}%)", 
                    item.getName(), item.getCurrentProgress(), itemProgress);
            }
        }
        
        template.setTotalProgress(totalProgress);
        logger.debug("Calculated total progress: {}%", totalProgress);
    }
} 