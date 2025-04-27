package middleware;

import models.LearningPlan;
import models.LearningPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.util.List;

@Service
public class LearningPlanService {
    
    @Autowired
    private LearningPlanRepository learningPlanRepository;
    
    public List<LearningPlan> getAllLearningPlans() {
        return learningPlanRepository.findAll();
    }
    
    public LearningPlan getLearningPlanById(Long id) {
        return learningPlanRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Learning Plan not found with id: " + id));
    }
    
    public List<LearningPlan> getLearningPlansByUser(Long userId) {
        return learningPlanRepository.findByUserId(userId);
    }
    
    public List<LearningPlan> getPublicLearningPlans() {
        return learningPlanRepository.findByIsPublicTrue();
    }
    
    public List<LearningPlan> getTopRatedPublicPlans() {
        return learningPlanRepository.findTopRatedPublicPlans();
    }
    
    @Transactional
    public LearningPlan createLearningPlan(LearningPlan learningPlan) {
        return learningPlanRepository.save(learningPlan);
    }
    
    @Transactional
    public LearningPlan updateLearningPlan(Long id, LearningPlan updatedPlan) {
        LearningPlan existingPlan = getLearningPlanById(id);
        
        existingPlan.setTitle(updatedPlan.getTitle());
        existingPlan.setDescription(updatedPlan.getDescription());
        existingPlan.setTopics(updatedPlan.getTopics());
        existingPlan.setResources(updatedPlan.getResources());
        existingPlan.setExpectedCompletionDate(updatedPlan.getExpectedCompletionDate());
        existingPlan.setPublic(updatedPlan.isPublic());
        
        return learningPlanRepository.save(existingPlan);
    }
    
    @Transactional
    public void deleteLearningPlan(Long id) {
        LearningPlan plan = getLearningPlanById(id);
        learningPlanRepository.delete(plan);
    }
    
    @Transactional
    public LearningPlan rateLearningPlan(Long id, double rating) {
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