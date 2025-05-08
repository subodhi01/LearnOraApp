package com.learnora.backend.repository;

import com.learnora.backend.model.LearningPlanModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningPlanRepository extends MongoRepository<LearningPlanModel, String> {
    List<LearningPlanModel> findByUserEmail(String userEmail);
    List<LearningPlanModel> findByShared(boolean shared);
    Optional<LearningPlanModel> findByIdAndUserEmail(String id, String userEmail);
}