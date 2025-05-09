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
import java.util.stream.Collectors;

@Service
public class ProgressTemplateService {
    private static final Logger logger = LoggerFactory.getLogger(ProgressTemplateService.class);

    @Autowired
    private ProgressTemplateRepository progressTemplateRepository;

    public ProgressTemplate createTemplate(ProgressTemplate template) {
        logger.debug("Creating new progress template: {}", template);
        template.setCreatedAt(new Date());
        template.setUpdatedAt(new Date());
        template.setActive(true);
        calculatePercentages(template);
        ProgressTemplate savedTemplate = progressTemplateRepository.save(template);
        logger.debug("Saved progress template: {}", savedTemplate);
        return savedTemplate;
    }

    public ProgressTemplate updateTemplate(String id, ProgressTemplate template) {
        Optional<ProgressTemplate> existingTemplate = progressTemplateRepository.findById(id);
        if (existingTemplate.isPresent()) {
            ProgressTemplate updatedTemplate = existingTemplate.get();
            // Only allow updating custom items
            updatedTemplate.setCustomItems(template.getCustomItems());
            updatedTemplate.setUpdatedAt(new Date());
            calculatePercentages(updatedTemplate);
            return progressTemplateRepository.save(updatedTemplate);
        }
        throw new RuntimeException("Progress template not found");
    }

    public void deleteTemplate(String id) {
        progressTemplateRepository.deleteById(id);
    }

    public List<ProgressTemplate> getUserTemplates(String userId) {
        return progressTemplateRepository.findByUserIdAndIsActiveTrue(userId);
    }

    public Optional<ProgressTemplate> getTemplateByUserAndCourse(String userId, String courseId) {
        return progressTemplateRepository.findByUserIdAndCourseId(userId, courseId);
    }

    private void calculatePercentages(ProgressTemplate template) {
        String calculationMethod = template.getCalculationMethod();
        
        if ("byTopics".equals(calculationMethod)) {
            // Calculate by topics first
            int topicCount = template.getTopics().size();
            double baseTopicPercentage = 100.0 / topicCount;
            
            // Set percentages for topics
            for (ProgressTemplate.TopicProgress topic : template.getTopics()) {
                topic.setPercentage(baseTopicPercentage);
                
                // Calculate percentages for custom items under this topic
                List<ProgressTemplate.CustomItem> topicItems = template.getCustomItems().stream()
                    .filter(item -> item.getTopicId() != null && 
                           topic.getTopicId() != null && 
                           item.getTopicId().equals(topic.getTopicId()))
                    .collect(Collectors.toList());
                
                if (!topicItems.isEmpty()) {
                    double itemPercentage = baseTopicPercentage / topicItems.size();
                    for (ProgressTemplate.CustomItem item : topicItems) {
                        item.setPercentage(itemPercentage);
                    }
                }
            }
        } else {
            // Calculate by total targets
            int totalTargets = template.getCustomItems().size();
            double baseTargetPercentage = 100.0 / totalTargets;
            
            // Set percentages for all custom items
            for (ProgressTemplate.CustomItem item : template.getCustomItems()) {
                item.setPercentage(baseTargetPercentage);
            }
            
            // Calculate topic percentages based on their targets
            for (ProgressTemplate.TopicProgress topic : template.getTopics()) {
                double topicPercentage = template.getCustomItems().stream()
                    .filter(item -> item.getTopicId() != null && 
                           topic.getTopicId() != null && 
                           item.getTopicId().equals(topic.getTopicId()))
                    .mapToDouble(ProgressTemplate.CustomItem::getPercentage)
                    .sum();
                topic.setPercentage(topicPercentage);
            }
        }

        // Calculate total progress
        double totalProgress = 0;
        for (ProgressTemplate.TopicProgress topic : template.getTopics()) {
            totalProgress += (topic.getCurrentProgress() * topic.getPercentage() / 100);
        }
        for (ProgressTemplate.CustomItem item : template.getCustomItems()) {
            totalProgress += (item.getCurrentProgress() * item.getPercentage() / 100);
        }
        template.setTotalProgress(totalProgress);
    }
} 