package com.learnora.backend.repository;

import com.learnora.backend.model.CommentModel;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentRepository extends MongoRepository<CommentModel, String> {
    List<CommentModel> findByPostId(String postId);
}