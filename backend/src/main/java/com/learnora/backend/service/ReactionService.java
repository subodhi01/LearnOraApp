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
import java.util.Optional;

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

        // Check if user already has a reaction
        Optional<ReactionModel> existingReaction = reactionRepository.findByUserAndContent(userId, contentId, contentType);
        
        if (existingReaction.isPresent()) {
            ReactionModel reaction = existingReaction.get();
            
            // If clicking the same reaction type, remove it
            if (reaction.getReactionType().equals(reactionType)) {
                reactionRepository.delete(reaction);
                logger.info("Removed existing reaction of same type");
                
                try {
                    if (contentType.equals("COURSE")) {
                        var plan = learningPlanRepository.findById(contentId)
                            .orElseThrow(() -> new RuntimeException("Course not found"));
                        
                        if (!plan.getUserEmail().equals(userId)) {
                            String message = String.format("%s removed their %s from your course '%s'", 
                                username, 
                                reactionType.equals("LIKE") ? "like" : "dislike",
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
                }
            } else {
                // If different reaction type, update the existing reaction
                reaction.setReactionType(reactionType);
                reactionRepository.save(reaction);
                logger.info("Updated existing reaction to new type");
                
                try {
                    if (contentType.equals("COURSE")) {
                        var plan = learningPlanRepository.findById(contentId)
                            .orElseThrow(() -> new RuntimeException("Course not found"));
                        
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
                }
            }
        } else {
            // Create new reaction if user doesn't have one
            ReactionModel newReaction = new ReactionModel(userId, contentId, contentType, reactionType);
            reactionRepository.save(newReaction);
            logger.info("Created new reaction");
            
            try {
                if (contentType.equals("COURSE")) {
                    var plan = learningPlanRepository.findById(contentId)
                        .orElseThrow(() -> new RuntimeException("Course not found"));
                    
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
            }
        }

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

        ReactionModel reaction = reactionRepository.findByUserAndContent(userId, contentId, contentType)
            .orElse(null);

        if (reaction != null) {
            try {
                if (contentType.equals("COURSE")) {
                    var plan = learningPlanRepository.findById(contentId)
                        .orElseThrow(() -> new RuntimeException("Course not found"));
                    
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
            }

            reactionRepository.delete(reaction);
            logger.info("Reaction deleted successfully");
        }
    }
}