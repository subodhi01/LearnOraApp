package com.learnora.controllers;

import com.learnora.models.LearningPlan;
import com.learnora.services.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-plans")
@CrossOrigin(origins = "http://localhost:3000")
public class LearningPlanController {

    @Autowired
    private LearningPlanService learningPlanService;

    @GetMapping
    public ResponseEntity<?> getAllLearningPlans() {
        try {
            return ResponseEntity.ok(learningPlanService.getAllLearningPlans());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching learning plans: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getLearningPlanById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(learningPlanService.getLearningPlanById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching learning plan: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getLearningPlansByUser(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(learningPlanService.getLearningPlansByUser(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching user's learning plans: " + e.getMessage());
        }
    }

    @GetMapping("/public")
    public ResponseEntity<?> getPublicLearningPlans() {
        try {
            return ResponseEntity.ok(learningPlanService.getPublicLearningPlans());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching public learning plans: " + e.getMessage());
        }
    }

    @GetMapping("/top-rated")
    public ResponseEntity<?> getTopRatedPublicPlans() {
        try {
            return ResponseEntity.ok(learningPlanService.getTopRatedPublicPlans());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching top rated learning plans: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createLearningPlan(@RequestBody LearningPlan learningPlan) {
        try {
            LearningPlan savedPlan = learningPlanService.createLearningPlan(learningPlan);
            return ResponseEntity.ok(savedPlan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating learning plan: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLearningPlan(
            @PathVariable String id,
            @RequestBody LearningPlan updatedPlan) {
        try {
            LearningPlan savedPlan = learningPlanService.updateLearningPlan(id, updatedPlan);
            return ResponseEntity.ok(savedPlan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating learning plan: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLearningPlan(@PathVariable String id) {
        try {
            learningPlanService.deleteLearningPlan(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting learning plan: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<?> rateLearningPlan(
            @PathVariable String id,
            @RequestParam double rating) {
        try {
            LearningPlan updatedPlan = learningPlanService.rateLearningPlan(id, rating);
            return ResponseEntity.ok(updatedPlan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error rating learning plan: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchLearningPlans(@RequestParam String query) {
        try {
            return ResponseEntity.ok(learningPlanService.searchLearningPlans(query));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error searching learning plans: " + e.getMessage());
        }
    }
} 