package com.learnora.backend.repository;

import com.learnora.backend.model.NotificationModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NotificationRepository extends MongoRepository<NotificationModel, String> {
    List<NotificationModel> findByUserIdOrderByCreatedAtDesc(String userId);
    List<NotificationModel> findByUserIdAndReadOrderByCreatedAtDesc(String userId, boolean read);
    long countByUserIdAndRead(String userId, boolean read);
}