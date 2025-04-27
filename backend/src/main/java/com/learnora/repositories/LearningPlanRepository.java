package com.learnora.repositories;

import com.learnora.models.LearningPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface LearningPlanRepository extends MongoRepository<LearningPlan, String> {
    List<LearningPlan> findByUserId(String userId);
    List<LearningPlan> findByIsPublicTrue();
    
    @Query(value = "{'isPublic': true}", sort = "{'rating': -1}")
    List<LearningPlan> findTopRatedPublicPlans();
    
    List<LearningPlan> findByTitleContainingIgnoreCase(String title);
} 