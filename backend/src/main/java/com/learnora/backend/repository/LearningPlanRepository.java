package com.learnora.backend.repository;

import com.learnora.backend.model.LearningPlanModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface LearningPlanRepository extends MongoRepository<LearningPlanModel, String> {
    List<LearningPlanModel> findByUserEmail(String userEmail);
}