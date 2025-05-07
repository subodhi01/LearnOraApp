package com.learnora.backend.service;

import com.learnora.backend.model.ReactionModel;
import com.learnora.backend.repository.ReactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class ReactionService {
    @Autowired
    private ReactionRepository reactionRepository;

    public Map<String, Object> addReaction(String userId, String contentId, String contentType, String reactionType) {
        // Check if user already reacted
        ReactionModel existingReaction = reactionRepository.findByUserAndContent(userId, contentId, contentType)
            .orElse(null);

        if (existingReaction != null) {
            if (existingReaction.getReactionType().equals(reactionType)) {
                // If same reaction type, remove it
                reactionRepository.delete(existingReaction);
            } else {
                // If different reaction type, update it
                existingReaction.setReactionType(reactionType);
                reactionRepository.save(existingReaction);
            }
        } else {
            // Create new reaction
            ReactionModel newReaction = new ReactionModel(userId, contentId, contentType, reactionType);
            reactionRepository.save(newReaction);
        }

        // Get updated counts
        return getReactionCounts(contentId, contentType);
    }

    public Map<String, Object> getReactionCounts(String contentId, String contentType) {
        long likes = reactionRepository.countByContentAndType(contentId, contentType, "LIKE");
        long dislikes = reactionRepository.countByContentAndType(contentId, contentType, "DISLIKE");
        
        Map<String, Object> response = new HashMap<>();
        response.put("likes", likes);
        response.put("dislikes", dislikes);
        return response;
    }

    public String getUserReaction(String userId, String contentId, String contentType) {
        return reactionRepository.findByUserAndContent(userId, contentId, contentType)
            .map(ReactionModel::getReactionType)
            .orElse(null);
    }

    public void removeReaction(String userId, String contentId, String contentType) {
        reactionRepository.deleteByUserIdAndContentIdAndContentType(userId, contentId, contentType);
    }
} 