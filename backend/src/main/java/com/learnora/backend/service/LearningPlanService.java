package com.learnora.backend.service;

import com.learnora.backend.model.LearningPlanModel;
import com.learnora.backend.repository.LearningPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LearningPlanService {

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    public LearningPlanModel createPlan(String userEmail, LearningPlanModel plan) throws Exception {
        if (plan.getTitle() == null || plan.getTitle().isEmpty()) {
            throw new IllegalArgumentException("Plan title is required");
        }
        if (plan.getStartDate() == null || plan.getEndDate() == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }
        if (plan.getStartDate().after(plan.getEndDate())) {
            throw new IllegalArgumentException("Start date must be before end date");
        }
        
        System.out.println("Creating plan with image: " + (plan.getImageUrl() != null ? "Image present" : "No image"));
        plan.setUserEmail(userEmail);
        plan.setProgress(calculateProgress(plan));
        return learningPlanRepository.save(plan);
    }

    public List<LearningPlanModel> getPlans(String userEmail) throws Exception {
        if (userEmail == null || userEmail.isEmpty()) {
            throw new IllegalArgumentException("User email is required");
        }
        List<LearningPlanModel> plans = learningPlanRepository.findByUserEmail(userEmail);
        return plans != null ? plans : Collections.emptyList();
    }

    public LearningPlanModel getPlanById(String planId) throws Exception {
        return learningPlanRepository.findById(planId)
                .orElseThrow(() -> new Exception("Learning plan not found"));
    }

    public LearningPlanModel updatePlan(String userEmail, LearningPlanModel updates) throws Exception {
        LearningPlanModel existingPlan = learningPlanRepository.findByIdAndUserEmail(updates.getId(), userEmail)
                .orElseThrow(() -> new Exception("Learning plan not found or not owned by user"));

        System.out.println("Updating plan with image: " + (updates.getImageUrl() != null ? "Image present" : "No image"));

        if (updates.getTitle() != null) {
            existingPlan.setTitle(updates.getTitle());
        }
        if (updates.getDescription() != null) {
            existingPlan.setDescription(updates.getDescription());
        }
        if (updates.getStartDate() != null) {
            if (updates.getEndDate() != null && updates.getStartDate().after(updates.getEndDate())) {
                throw new IllegalArgumentException("Start date must be before end date");
            }
            existingPlan.setStatus("In Progress");
            existingPlan.setStartDate(updates.getStartDate());
        }
        if (updates.getEndDate() != null) {
            if (updates.getStartDate() != null && updates.getStartDate().after(updates.getEndDate())) {
                throw new IllegalArgumentException("Start date must be before end date");
            }
            existingPlan.setEndDate(updates.getEndDate());
        }
        if (updates.getTopics() != null) {
            existingPlan.setTopics(updates.getTopics());
        }
        if (updates.getStatus() != null) {
            existingPlan.setStatus(updates.getStatus());
        }
        if (updates.getImageUrl() != null) {
            existingPlan.setImageUrl(updates.getImageUrl());
        }
        existingPlan.setShared(updates.isShared());
        existingPlan.setProgress(calculateProgress(existingPlan));
        return learningPlanRepository.save(existingPlan);
    }

    public void deletePlan(String planId, String userEmail) throws Exception {
        LearningPlanModel plan = learningPlanRepository.findByIdAndUserEmail(planId, userEmail)
                .orElseThrow(() -> new Exception("Learning plan not found or not owned by user"));
        learningPlanRepository.deleteById(planId);
    }

    public List<LearningPlanModel> getSharedPlans() throws Exception {
        System.out.println("Service: Getting shared plans");
        try {
            List<LearningPlanModel> sharedPlans = learningPlanRepository.findByShared(true);
            // Ensure each plan has an enrolledUsers list
            sharedPlans.forEach(plan -> {
                if (plan.getEnrolledUsers() == null) {
                    plan.setEnrolledUsers(new ArrayList<>());
                }
            });
            System.out.println("Service: Found " + (sharedPlans != null ? sharedPlans.size() : 0) + " shared plans");
            return sharedPlans != null ? sharedPlans : Collections.emptyList();
        } catch (Exception e) {
            System.err.println("Service error in getSharedPlans: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public LearningPlanModel startLearningPlan(String userEmail, String planId) throws Exception {
        LearningPlanModel sharedPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new Exception("Learning plan not found"));

        if (!sharedPlan.isShared()) {
            throw new Exception("This learning plan is not shared");
        }

        // Check if user already has a copy of this plan
        List<LearningPlanModel> existingUserPlans = learningPlanRepository.findByUserEmail(userEmail);
        for (LearningPlanModel existingPlan : existingUserPlans) {
            if (existingPlan.getTitle().equals(sharedPlan.getTitle()) && 
                existingPlan.getUserEmail().equals(userEmail)) {
                return existingPlan; // Return existing plan if user already has it
            }
        }

        // Create a new plan for the user
        LearningPlanModel userPlan = new LearningPlanModel();
        userPlan.setUserEmail(userEmail);
        userPlan.setTitle(sharedPlan.getTitle());
        userPlan.setDescription(sharedPlan.getDescription());
        userPlan.setStartDate(new Date());
        userPlan.setEndDate(sharedPlan.getEndDate());
        userPlan.setStatus("In Progress");
        userPlan.setShared(false);
        userPlan.setImageUrl(sharedPlan.getImageUrl());
        
        List<LearningPlanModel.Topic> userTopics = sharedPlan.getTopics().stream()
                .map(topic -> {
                    LearningPlanModel.Topic newTopic = new LearningPlanModel.Topic();
                    newTopic.setTitle(topic.getTitle());
                    newTopic.setResources(topic.getResources());
                    newTopic.setCompleted(false);
                    return newTopic;
                })
                .collect(Collectors.toList());
        userPlan.setTopics(userTopics);
        
        userPlan.setProgress(0);

        // Update the shared plan's enrolled users
        List<String> enrolledUsers = sharedPlan.getEnrolledUsers();
        if (!enrolledUsers.contains(userEmail)) {
            enrolledUsers.add(userEmail);
            sharedPlan.setEnrolledUsers(enrolledUsers);
            // Save the shared plan first to ensure the enrolled users are updated
            learningPlanRepository.save(sharedPlan);
        }

        // Save and return the user's new plan
        return learningPlanRepository.save(userPlan);
    }

    public LearningPlanModel updateTopicProgress(String userEmail, String planId, Integer topicIndex, Boolean completed) throws Exception {
        LearningPlanModel plan = learningPlanRepository.findByIdAndUserEmail(planId, userEmail)
                .orElseThrow(() -> new Exception("Learning plan not found or not owned by user"));
        
        List<LearningPlanModel.Topic> topics = plan.getTopics();
        if (topicIndex < 0 || topicIndex >= topics.size()) {
            throw new IllegalArgumentException("Invalid topic index");
        }
        
        LearningPlanModel.Topic topic = topics.get(topicIndex);
        topic.setCompleted(completed);
        plan.setProgress(calculateProgress(plan));
        return learningPlanRepository.save(plan);
    }

    public LearningPlanModel getUserProgress(String userEmail, String planId) throws Exception {
        if (userEmail == null || userEmail.isEmpty()) {
            throw new IllegalArgumentException("User email is required");
        }
        if (planId == null || planId.isEmpty()) {
            throw new IllegalArgumentException("Plan ID is required");
        }
        return learningPlanRepository.findByIdAndUserEmail(planId, userEmail)
                .orElseThrow(() -> new Exception("Learning plan not found or not owned by user"));
    }

    private Integer calculateProgress(LearningPlanModel plan) {
        if (plan.getTopics() == null || plan.getTopics().isEmpty()) {
            return 0;
        }
        
        long completed = plan.getTopics().stream()
                .filter(LearningPlanModel.Topic::isCompleted)
                .count();
        
        double progress = (completed / (double) plan.getTopics().size()) * 100;
        return (int) Math.round(progress);
    }
}