package com.learnora.backend.service;

import com.learnora.backend.model.LearningPlanModel;
import com.learnora.backend.repository.LearningPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        
        System.out.println("Creating plan with sharing status: " + plan.isShared());
        plan.setUserEmail(userEmail);
        plan.setProgress(calculateProgress(plan));
        return learningPlanRepository.save(plan);
    }

    public List<LearningPlanModel> getPlans(String userEmail) throws Exception {
        if (userEmail == null || userEmail.isEmpty()) {
            throw new IllegalArgumentException("User email is required");
        }
        List<LearningPlanModel> plans = learningPlanRepository.findByUserEmail(userEmail);
        if (plans.isEmpty()) {
            throw new Exception("No learning plans found for user");
        }
        return plans;
    }

    public LearningPlanModel getPlanById(String planId) throws Exception {
        return learningPlanRepository.findById(planId)
                .orElseThrow(() -> new Exception("Learning plan not found"));
    }

    public LearningPlanModel updatePlan(String userEmail, LearningPlanModel updates) throws Exception {
        LearningPlanModel existingPlan = learningPlanRepository.findById(updates.getId())
                .orElseThrow(() -> new Exception("Learning plan not found"));

        if (!existingPlan.getUserEmail().equals(userEmail)) {
            throw new Exception("You don't have permission to update this plan");
        }

        System.out.println("Updating plan with sharing status: " + updates.isShared());

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
        existingPlan.setShared(updates.isShared());
        existingPlan.setProgress(calculateProgress(existingPlan));
        return learningPlanRepository.save(existingPlan);
    }

    public void deletePlan(String planId, String userEmail) throws Exception {
        LearningPlanModel plan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new Exception("Learning plan not found"));

        if (!plan.getUserEmail().equals(userEmail)) {
            throw new Exception("You don't have permission to delete this plan");
        }

        learningPlanRepository.deleteById(planId);
    }

    public List<LearningPlanModel> getSharedPlans() throws Exception {
        System.out.println("Service: Getting shared plans");
        try {
            List<LearningPlanModel> sharedPlans = learningPlanRepository.findByShared(true);
            System.out.println("Service: Found " + (sharedPlans != null ? sharedPlans.size() : 0) + " shared plans");
            if (sharedPlans == null) {
                return Collections.emptyList();
            }
            return sharedPlans;
        } catch (Exception e) {
            System.err.println("Service error in getSharedPlans: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public LearningPlanModel startLearningPlan(String userEmail, String planId) throws Exception {
        // Get the shared plan
        LearningPlanModel sharedPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new Exception("Learning plan not found"));

        if (!sharedPlan.isShared()) {
            throw new Exception("This learning plan is not shared");
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
        
        // Copy topics with completed status reset
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
        
        // Calculate initial progress
        userPlan.setProgress(0);

        return learningPlanRepository.save(userPlan);
    }

    // helper method to calculate progress
    private Integer calculateProgress(LearningPlanModel plan) {
        if (plan.getTopics() == null || plan.getTopics().isEmpty()) {
            return 0;
        }
        
        // Count completed topics
        long completed = plan.getTopics().stream()
                .filter(LearningPlanModel.Topic::isCompleted)
                .count();
        
        // Calculate percentage and round to nearest integer
        double progress = (completed / (double) plan.getTopics().size()) * 100;
        return (int) Math.round(progress);
    }
}