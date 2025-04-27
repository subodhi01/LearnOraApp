package com.learnora.services;

import com.learnora.models.LearningPlan;
import com.learnora.repositories.LearningPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LearningPlanService {
    
    @Autowired
    private LearningPlanRepository learningPlanRepository;
    
    public List<LearningPlan> getAllLearningPlans() {
        return learningPlanRepository.findAll();
    }
    
    public LearningPlan getLearningPlanById(String id) {
        return learningPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Learning Plan not found with id: " + id));
    }
    
    public List<LearningPlan> getLearningPlansByUser(String userId) {
        return learningPlanRepository.findByUserId(userId);
    }
    
    public List<LearningPlan> getPublicLearningPlans() {
        return learningPlanRepository.findByIsPublicTrue();
    }
    
    public List<LearningPlan> getTopRatedPublicPlans() {
        return learningPlanRepository.findTopRatedPublicPlans();
    }
    
    public LearningPlan createLearningPlan(LearningPlan learningPlan) {
        learningPlan.setCreatedAt(LocalDateTime.now());
        learningPlan.setUpdatedAt(LocalDateTime.now());
        if (learningPlan.getRating() == null) {
            learningPlan.setRating(0.0);
        }
        if (learningPlan.getTotalRatings() == null) {
            learningPlan.setTotalRatings(0);
        }
        return learningPlanRepository.save(learningPlan);
    }
    
    public LearningPlan updateLearningPlan(String id, LearningPlan updatedPlan) {
        LearningPlan existingPlan = getLearningPlanById(id);
        
        existingPlan.setTitle(updatedPlan.getTitle());
        existingPlan.setDescription(updatedPlan.getDescription());
        existingPlan.setTopics(updatedPlan.getTopics());
        existingPlan.setResources(updatedPlan.getResources());
        existingPlan.setExpectedCompletionDate(updatedPlan.getExpectedCompletionDate());
        existingPlan.setPublic(updatedPlan.isPublic());
        existingPlan.setUpdatedAt(LocalDateTime.now());
        
        return learningPlanRepository.save(existingPlan);
    }
    
    public void deleteLearningPlan(String id) {
        LearningPlan plan = getLearningPlanById(id);
        learningPlanRepository.delete(plan);
    }
    
    public LearningPlan rateLearningPlan(String id, double rating) {
        LearningPlan plan = getLearningPlanById(id);
        
        if (plan.getRating() == null) {
            plan.setRating(rating);
            plan.setTotalRatings(1);
        } else {
            double totalRating = plan.getRating() * plan.getTotalRatings();
            plan.setTotalRatings(plan.getTotalRatings() + 1);
            plan.setRating((totalRating + rating) / plan.getTotalRatings());
        }
        
        return learningPlanRepository.save(plan);
    }
    
    public List<LearningPlan> searchLearningPlans(String query) {
        return learningPlanRepository.findByTitleContainingIgnoreCase(query);
    }
} 