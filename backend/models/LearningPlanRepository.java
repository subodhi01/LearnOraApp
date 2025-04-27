package models;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningPlanRepository extends JpaRepository<LearningPlan, Long> {
    List<LearningPlan> findByUserId(Long userId);
    
    List<LearningPlan> findByIsPublicTrue();
    
    @Query("SELECT lp FROM LearningPlan lp WHERE lp.isPublic = true ORDER BY lp.rating DESC")
    List<LearningPlan> findTopRatedPublicPlans();
    
    List<LearningPlan> findByTitleContainingIgnoreCase(String title);
} 