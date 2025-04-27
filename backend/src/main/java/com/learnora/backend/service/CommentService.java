package com.learnora.backend.service;

import com.learnora.backend.model.CommentModel;
import com.learnora.backend.model.UserModel;
import com.learnora.backend.repository.CommentRepository;
import com.learnora.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    public CommentModel createComment(CommentModel comment) throws Exception {
        if (comment.getPostId() == null || comment.getPostId().isEmpty()) {
            throw new Exception("Post ID is required");
        }
        if (comment.getUserId() == null || comment.getUserId().isEmpty()) {
            throw new Exception("User ID is required");
        }
        if (comment.getUsername() == null || comment.getUsername().isEmpty()) {
            throw new Exception("Username is required");
        }
        if (comment.getText() == null || comment.getText().isEmpty()) {
            throw new Exception("Comment text is required");
        }

        // Verify user exists
        UserModel user = userRepository.findById(comment.getUserId())
            .orElseThrow(() -> new Exception("User not found"));

        // Ensure username matches user's name
        String expectedUsername = user.getFirstName() + " " + user.getLastName();
        if (!comment.getUsername().equals(expectedUsername)) {
            throw new Exception("Username does not match user");
        }

        return commentRepository.save(comment);
    }

    public List<CommentModel> getCommentsByPostId(String postId) throws Exception {
        if (postId == null || postId.isEmpty()) {
            throw new Exception("Post ID is required");
        }
        return commentRepository.findByPostId(postId);
    }

    public CommentModel updateComment(String id, CommentModel updates) throws Exception {
        CommentModel comment = commentRepository.findById(id)
            .orElseThrow(() -> new Exception("Comment not found"));

        if (updates.getText() == null || updates.getText().isEmpty()) {
            throw new Exception("Comment text is required");
        }

        // Only allow updating the text
        comment.setText(updates.getText());
        return commentRepository.save(comment);
    }

    public void deleteComment(String id, String userId) throws Exception {
        CommentModel comment = commentRepository.findById(id)
            .orElseThrow(() -> new Exception("Comment not found"));

        // Only allow the comment's owner to delete it
        if (!comment.getUserId().equals(userId)) {
            throw new Exception("Unauthorized: Only the comment owner can delete it");
        }

        commentRepository.deleteById(id);
    }
}