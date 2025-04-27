package com.learnora.backend.service;

    import com.learnora.backend.model.LearningPlan;
    import com.learnora.backend.repository.LearningPlanRepository;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.stereotype.Service;
    import java.time.LocalDateTime;
    import java.util.List;
    import java.util.Optional;

    @Service
    public class LearningPlanService {
        
        @Autowired
        private LearningPlanRepository repository;

        public LearningPlan createLearningPlan(LearningPlan plan) {
            plan.setCreatedAt(LocalDateTime.now().toString());
            return repository.save(plan);
        }

        public List<LearningPlan> getAllLearningPlans() {
            return repository.findAll();
        }

        public Optional<LearningPlan> getLearningPlanById(String id) {
            return repository.findById(id);
        }

        public LearningPlan updateLearningPlan(String id, LearningPlan plan) {
            Optional<LearningPlan> existing = repository.findById(id);
            if (existing.isPresent()) {
                LearningPlan updated = existing.get();
                updated.setName(plan.getName());
                updated.setCourses(plan.getCourses());
                updated.setCompletionRate(plan.getCompletionRate());
                return repository.save(updated);
            }
            throw new RuntimeException("Learning Plan not found");
        }

        public void deleteLearningPlan(String id) {
            repository.deleteById(id);
        }
    }