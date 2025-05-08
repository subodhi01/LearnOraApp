package com.learnora.backend.service;

import com.learnora.backend.model.LearningPlanModel;
import com.learnora.backend.repository.LearningPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Date;
import java.util.List;

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
            return Collections.emptyList();
        }
        return plans;
    }

    public LearningPlanModel getPlanById(String planId) throws Exception {
        return learningPlanRepository.findById(planId)
                .orElseThrow(() -> new Exception("Learning plan not found"));
    }

    public LearningPlanModel updatePlan(String userEmail, LearningPlanModel updates) throws Exception {
        LearningPlanModel existingPlan = learningPlanRepository.findByIdAndUserEmail(updates.getId(), userEmail)
                .orElseThrow(() -> new Exception("Learning plan not found or not owned by user"));

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
        LearningPlanModel plan = learningPlanRepository.findByIdAndUserEmail(planId, userEmail)
                .orElseThrow(() -> new Exception("Learning plan not found or not owned by user"));
        learningPlanRepository.deleteById(planId);
    }

    public List<LearningPlanModel> getSharedPlans() throws Exception {
        System.out.println("Service: Getting shared plans");
        try {
            List<LearningPlanModel> sharedPlans = learningPlanRepository.findByShared(true);
            System.out.println("Service: Found " + (sharedPlans != null ? sharedPlans.size() : 0) + " shared plans");
            return sharedPlans != null ? sharedPlans : Collections.emptyList();
        } catch (Exception e) {
            System.err.println("Service error in getSharedPlans: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public LearningPlanModel startLearningPlan(String userEmail, String planId) throws Exception {
        LearningPlanModel plan = learningPlanRepository.findByIdAndUserEmail(planId, userEmail)
                .orElseThrow(() -> new Exception("Learning plan not found or not owned by user"));
        
        if (!"ACTIVE".equalsIgnoreCase(plan.getStatus())) {
            plan.setStatus("ACTIVE");
            plan.setProgress(calculateProgress(plan));
            return learningPlanRepository.save(plan);
        }
        return plan;
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