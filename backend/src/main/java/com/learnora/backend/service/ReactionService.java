package com.learnora.backend.service;

import com.learnora.backend.model.ReactionModel;
import com.learnora.backend.repository.ReactionRepository;
import com.learnora.backend.repository.LearningPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ReactionService {
    private static final Logger logger = LoggerFactory.getLogger(ReactionService.class);

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    @Autowired
    private NotificationService notificationService;

    public Map<String, Object> addReaction(String userId, String contentId, String contentType, String reactionType, String username) {
        logger.info("Adding reaction: userId={}, contentId={}, contentType={}, reactionType={}, username={}", 
            userId, contentId, contentType, reactionType, username);

        // Check if user already reacted
        ReactionModel existingReaction = reactionRepository.findByUserAndContent(userId, contentId, contentType)
            .orElse(null);

        if (existingReaction != null) {
            if (existingReaction.getReactionType().equals(reactionType)) {
                // If same reaction type, remove it
                reactionRepository.delete(existingReaction);
                logger.info("Removed existing reaction of same type");
            } else {
                // If different reaction type, update it
                existingReaction.setReactionType(reactionType);
                reactionRepository.save(existingReaction);
                logger.info("Updated existing reaction to new type");

                // Create notification for reaction change
                try {
                    if (contentType.equals("COURSE")) {
                        var plan = learningPlanRepository.findById(contentId)
                            .orElseThrow(() -> new RuntimeException("Course not found"));
                        
                        // Don't send notification if user is reacting to their own course
                        if (!plan.getUserEmail().equals(userId)) {
                            String message = String.format("%s changed their reaction to %s on your course '%s'", 
                                username, 
                                reactionType.equals("LIKE") ? "like" : "dislike",
                                plan.getTitle());
                            
                            notificationService.createNotification(
                                plan.getUserEmail(),
                                "REACTION_CHANGED",
                                message,
                                contentId,
                                contentId
                            );
                            logger.info("Created notification for reaction change");
                        }
                    }
                } catch (Exception e) {
                    logger.error("Failed to create notification for reaction change: {}", e.getMessage());
                    // Don't throw the exception as the reaction was already updated
                }
            }
        } else {
            // Create new reaction
            ReactionModel newReaction = new ReactionModel(userId, contentId, contentType, reactionType);
            reactionRepository.save(newReaction);
            logger.info("Created new reaction");

            // Create notification for new reaction
            try {
                if (contentType.equals("COURSE")) {
                    var plan = learningPlanRepository.findById(contentId)
                        .orElseThrow(() -> new RuntimeException("Course not found"));
                    
                    // Don't send notification if user is reacting to their own course
                    if (!plan.getUserEmail().equals(userId)) {
                        String message = String.format("%s %s your course '%s'", 
                            username, 
                            reactionType.equals("LIKE") ? "liked" : "disliked",
                            plan.getTitle());
                        
                        notificationService.createNotification(
                            plan.getUserEmail(),
                            "COURSE_REACTION",
                            message,
                            contentId,
                            contentId
                        );
                        logger.info("Created notification for new reaction");
                    }
                }
            } catch (Exception e) {
                logger.error("Failed to create notification for reaction: {}", e.getMessage());
                // Don't throw the exception as the reaction was already saved
            }
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

    public void removeReaction(String userId, String contentId, String contentType, String username) {
        logger.info("Removing reaction: userId={}, contentId={}, contentType={}, username={}", 
            userId, contentId, contentType, username);

        // Get the reaction before deleting it
        ReactionModel reaction = reactionRepository.findByUserAndContent(userId, contentId, contentType)
            .orElse(null);

        if (reaction != null) {
            // Create notification for reaction removal
            try {
                if (contentType.equals("COURSE")) {
                    var plan = learningPlanRepository.findById(contentId)
                        .orElseThrow(() -> new RuntimeException("Course not found"));
                    
                    // Don't send notification if user is removing reaction from their own course
                    if (!plan.getUserEmail().equals(userId)) {
                        String message = String.format("%s removed their %s from your course '%s'", 
                            username, 
                            reaction.getReactionType().equals("LIKE") ? "like" : "dislike",
                            plan.getTitle());
                        
                        notificationService.createNotification(
                            plan.getUserEmail(),
                            "REACTION_REMOVED",
                            message,
                            contentId,
                            contentId
                        );
                        logger.info("Created notification for reaction removal");
                    }
                }
            } catch (Exception e) {
                logger.error("Failed to create notification for reaction removal: {}", e.getMessage());
                // Don't throw the exception as we still want to remove the reaction
            }

            // Delete the reaction
            reactionRepository.delete(reaction);
            logger.info("Reaction deleted successfully");
        }
    }
} 