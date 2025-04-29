package com.learnora.backend.repository;

import com.learnora.backend.model.LearningPlanModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningPlanRepository extends MongoRepository<LearningPlanModel, String> {
    List<LearningPlanModel> findByUserEmail(String userEmail);
    List<LearningPlanModel> findByShared(boolean shared);
}