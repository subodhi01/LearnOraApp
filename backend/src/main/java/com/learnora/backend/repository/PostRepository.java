package com.learnora.backend.repository;

import com.learnora.backend.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByUserId(String userId);
} 