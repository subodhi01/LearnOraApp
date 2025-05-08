package com.learnora.backend.controller;

import com.learnora.backend.model.LearningPlanModel;
import com.learnora.backend.service.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/learning-plan")
@CrossOrigin(origins = "http://localhost:3000")
public class LearningPlanController {

    @Autowired
    private LearningPlanService learningPlanService;

    @PostMapping
    public ResponseEntity<?> createPlan(@RequestBody LearningPlanModel plan) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            System.out.println("Received plan for creation: " + plan);
            LearningPlanModel createdPlan = learningPlanService.createPlan(userEmail, plan);
            return ResponseEntity.ok(createdPlan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getPlans() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            List<LearningPlanModel> plans = learningPlanService.getPlans(userEmail);
            return ResponseEntity.ok(plans);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{planId}")
    public ResponseEntity<?> getPlanById(@PathVariable String planId) {
        try {
            LearningPlanModel plan = learningPlanService.getPlanById(planId);
            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping
    public ResponseEntity<?> updatePlan(@RequestBody LearningPlanModel plan) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            System.out.println("Received plan for update: " + plan);
            LearningPlanModel updatedPlan = learningPlanService.updatePlan(userEmail, plan);
            return ResponseEntity.ok(updatedPlan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{planId}")
    public ResponseEntity<?> deletePlan(@PathVariable String planId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            learningPlanService.deletePlan(planId, userEmail);
            return ResponseEntity.ok("Learning plan deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/shared")
    public ResponseEntity<?> getSharedPlans() {
        try {
            System.out.println("Received request for shared plans");
            List<LearningPlanModel> sharedPlans = learningPlanService.getSharedPlans();
            System.out.println("Found " + sharedPlans.size() + " shared plans");
            if (sharedPlans.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }
            return ResponseEntity.ok(sharedPlans);
        } catch (Exception e) {
            System.err.println("Error in getSharedPlans: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/start")
    public ResponseEntity<?> startLearningPlan(@RequestBody Map<String, String> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            String planId = request.get("planId");
            
            if (planId == null) {
                return ResponseEntity.badRequest().body("Plan ID is required");
            }

            LearningPlanModel plan = learningPlanService.startLearningPlan(userEmail, planId);
            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/progress/topic")
    public ResponseEntity<?> updateTopicProgress(@RequestBody Map<String, Object> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            
            String planId = (String) request.get("planId");
            Integer topicIndex = (Integer) request.get("topicIndex");
            Boolean completed = (Boolean) request.get("completed");
            
            if (planId == null || topicIndex == null || completed == null) {
                return ResponseEntity.badRequest().body("Plan ID, topic index, and completion status are required");
            }

            LearningPlanModel updatedPlan = learningPlanService.updateTopicProgress(userEmail, planId, topicIndex, completed);
            return ResponseEntity.ok(updatedPlan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{planId}/progress")
    public ResponseEntity<?> getUserProgress(@PathVariable String planId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            LearningPlanModel progress = learningPlanService.getUserProgress(userEmail, planId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}