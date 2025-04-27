package routes;

import middleware.LearningPlanService;
import models.LearningPlan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/learning-plans")
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
    public ResponseEntity<?> getLearningPlanById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(learningPlanService.getLearningPlanById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching learning plan: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getLearningPlansByUser(@PathVariable Long userId) {
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
            // Set default values if not provided
            if (learningPlan.getRating() == null) {
                learningPlan.setRating(0.0);
            }
            if (learningPlan.getTotalRatings() == null) {
                learningPlan.setTotalRatings(0);
            }
            if (learningPlan.getTopics() == null) {
                learningPlan.setTopics(new ArrayList<>());
            }
            if (learningPlan.getResources() == null) {
                learningPlan.setResources(new ArrayList<>());
            }
            
            LearningPlan savedPlan = learningPlanService.createLearningPlan(learningPlan);
            return ResponseEntity.ok(savedPlan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating learning plan: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLearningPlan(
            @PathVariable Long id,
            @RequestBody LearningPlan updatedPlan) {
        try {
            LearningPlan savedPlan = learningPlanService.updateLearningPlan(id, updatedPlan);
            return ResponseEntity.ok(savedPlan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating learning plan: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLearningPlan(@PathVariable Long id) {
        try {
            learningPlanService.deleteLearningPlan(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting learning plan: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<?> rateLearningPlan(
            @PathVariable Long id,
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