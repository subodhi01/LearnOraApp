package com.learnora.backend.controller;

import com.learnora.backend.service.ReactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/reactions")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE})
public class ReactionController {
    @Autowired
    private ReactionService reactionService;

    // Add a test endpoint
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "Reaction controller is working");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{contentType}/{contentId}")
    public ResponseEntity<Map<String, Object>> addReaction(
            @PathVariable String contentType,
            @PathVariable String contentId,
            @RequestParam String userId,
            @RequestParam String reactionType) {
        return ResponseEntity.ok(reactionService.addReaction(userId, contentId, contentType, reactionType));
    }

    @GetMapping("/{contentType}/{contentId}")
    public ResponseEntity<Map<String, Object>> getReactionCounts(
            @PathVariable String contentType,
            @PathVariable String contentId) {
        return ResponseEntity.ok(reactionService.getReactionCounts(contentId, contentType));
    }

    @GetMapping("/user/{contentType}/{contentId}")
    public ResponseEntity<String> getUserReaction(
            @PathVariable String contentType,
            @PathVariable String contentId,
            @RequestParam String userId) {
        return ResponseEntity.ok(reactionService.getUserReaction(userId, contentId, contentType));
    }

    @DeleteMapping("/{contentType}/{contentId}")
    public ResponseEntity<Void> removeReaction(
            @PathVariable String contentType,
            @PathVariable String contentId,
            @RequestParam String userId) {
        reactionService.removeReaction(userId, contentId, contentType);
        return ResponseEntity.ok().build();
    }
} 