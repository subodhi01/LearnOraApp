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
            @RequestParam String reactionType,
            @RequestParam String username) {
        return ResponseEntity.ok(reactionService.addReaction(userId, contentId, contentType, reactionType, username));
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
            @RequestParam String userId,
            @RequestParam String username) {
        reactionService.removeReaction(userId, contentId, contentType, username);
        return ResponseEntity.ok().build();
    }
}