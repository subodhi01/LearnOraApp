package com.learnora.backend.service;

import com.learnora.backend.model.LearningPlanModel;
import com.learnora.backend.repository.LearningPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LearningPlanService {

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    public LearningPlanModel createPlan(String userEmail, LearningPlanModel plan) throws Exception {
        if (plan.getTitle() == null || plan.getTitle().isEmpty()) {
            throw new IllegalArgumentException("Plan title is required");
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

        System.out.println("Updating plan with sharing status: " + updates.isShared());

        if (updates.getTitle() != null) {
            existingPlan.setTitle(updates.getTitle());
        }
        if (updates.getDescription() != null) {
            existingPlan.setDescription(updates.getDescription());
        }
        if (updates.getStartDate() != null) {
            existingPlan.setStartDate(updates.getStartDate());
        }
        if (updates.getEndDate() != null) {
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

    public void deletePlan(String planId) throws Exception {
        if (!learningPlanRepository.existsById(planId)) {
            throw new Exception("Learning plan not found");
        }
        learningPlanRepository.deleteById(planId);
    }

    // helper method to calculate progress
    private Integer calculateProgress(LearningPlanModel plan) {
        if (plan.getTopics() == null || plan.getTopics().isEmpty()) {
            return 0;
        }
        long completed = plan.getTopics().stream()
                .filter(LearningPlanModel.Topic::isCompleted)
                .count();
        return (int) Math.round((completed / (double) plan.getTopics().size()) * 100);
    }
}