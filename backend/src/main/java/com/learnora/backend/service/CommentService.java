package com.learnora.backend.service;

import com.learnora.backend.model.CommentModel;
import com.learnora.backend.model.UserModel;
import com.learnora.backend.repository.CommentRepository;
import com.learnora.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

        // If this is a reply, verify parent comment exists
        if (comment.getParentId() != null && !comment.getParentId().isEmpty()) {
            Optional<CommentModel> parentComment = commentRepository.findById(comment.getParentId());
            if (!parentComment.isPresent()) {
                throw new Exception("Parent comment not found");
            }
        }

        return commentRepository.save(comment);
    }

    public List<CommentModel> getCommentsByPostId(String postId) throws Exception {
        if (postId == null || postId.isEmpty()) {
            throw new Exception("Post ID is required");
        }
        // Get all comments for the post
        List<CommentModel> allComments = commentRepository.findByPostId(postId);
        
        // Filter out replies and organize them under their parent comments
        List<CommentModel> parentComments = allComments.stream()
            .filter(comment -> comment.getParentId() == null || comment.getParentId().isEmpty())
            .toList();

        // Add replies to their parent comments
        for (CommentModel parent : parentComments) {
            List<CommentModel> replies = allComments.stream()
                .filter(comment -> parent.getId().equals(comment.getParentId()))
                .toList();
            parent.setReplies(replies);
        }

        return parentComments;
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

        // Delete all replies to this comment
        List<CommentModel> replies = commentRepository.findByPostId(comment.getPostId()).stream()
            .filter(c -> id.equals(c.getParentId()))
            .toList();
        
        for (CommentModel reply : replies) {
            commentRepository.deleteById(reply.getId());
        }

        commentRepository.deleteById(id);
    }
}