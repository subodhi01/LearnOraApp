package com.learnora.backend.repository;

import com.learnora.backend.model.LearningPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LearningPlanRepository extends MongoRepository<LearningPlan, String> {
}