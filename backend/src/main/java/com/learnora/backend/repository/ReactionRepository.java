package com.learnora.backend.repository;

import com.learnora.backend.model.ReactionModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ReactionRepository extends MongoRepository<ReactionModel, String> {
    List<ReactionModel> findByContentIdAndContentType(String contentId, String contentType);
    
    @Query("{'userId': ?0, 'contentId': ?1, 'contentType': ?2}")
    Optional<ReactionModel> findByUserAndContent(String userId, String contentId, String contentType);
    
    @Query(value = "{'contentId': ?0, 'contentType': ?1, 'reactionType': ?2}", count = true)
    long countByContentAndType(String contentId, String contentType, String reactionType);
    
    void deleteByUserIdAndContentIdAndContentType(String userId, String contentId, String contentType);
}