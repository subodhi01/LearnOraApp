package com.learnora.backend.controller;

import com.learnora.backend.model.LearningPlanModel;
import com.learnora.backend.service.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-plan")
@CrossOrigin(origins = "http://localhost:3000")
public class LearningPlanController {

    @Autowired
    private LearningPlanService learningPlanService;

    @PostMapping
    public ResponseEntity<?> createPlan(@RequestParam String userEmail, @RequestBody LearningPlanModel plan) {
        try {
            LearningPlanModel createdPlan = learningPlanService.createPlan(userEmail, plan);
            return ResponseEntity.ok(createdPlan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getPlans(@RequestParam String userEmail) {
        try {
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

    @PutMapping("/{planId}")
    public ResponseEntity<?> updatePlan(@PathVariable String userEmail, @RequestBody LearningPlanModel plan) {
        try {
            LearningPlanModel updatedPlan = learningPlanService.updatePlan(userEmail, plan);
            return ResponseEntity.ok(updatedPlan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{planId}")
    public ResponseEntity<?> deletePlan(@PathVariable String planId) {
        try {
            learningPlanService.deletePlan(planId);
            return ResponseEntity.ok("Learning plan deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}