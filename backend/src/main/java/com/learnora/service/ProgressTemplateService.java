package com.learnora.service;

import com.learnora.model.ProgressTemplate;
import com.learnora.repository.ProgressTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ProgressTemplateService {

    @Autowired
    private ProgressTemplateRepository progressTemplateRepository;

    public ProgressTemplate createTemplate(ProgressTemplate template) {
        template.setCreatedAt(new Date());
        template.setUpdatedAt(new Date());
        template.setActive(true);
        calculatePercentages(template);
        return progressTemplateRepository.save(template);
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
        int totalItems = template.getTopics().size() + template.getCustomItems().size();
        double basePercentage = 100.0 / totalItems;

        // Set percentages for topics
        for (ProgressTemplate.TopicProgress topic : template.getTopics()) {
            topic.setPercentage(basePercentage);
        }

        // Set percentages for custom items
        for (ProgressTemplate.CustomItem item : template.getCustomItems()) {
            item.setPercentage(basePercentage);
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