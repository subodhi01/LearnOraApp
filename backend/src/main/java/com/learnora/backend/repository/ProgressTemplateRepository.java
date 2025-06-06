package com.learnora.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.learnora.backend.model.ProgressTemplate;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressTemplateRepository extends MongoRepository<ProgressTemplate, String> {
    List<ProgressTemplate> findByUserId(String userId);
    Optional<ProgressTemplate> findByUserIdAndCourseId(String userId, String courseId);
    List<ProgressTemplate> findByUserIdAndIsActiveTrue(String userId);
    void deleteByUserIdAndCourseId(String userId, String courseId);
}  