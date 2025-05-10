package com.learnora.backend.service;

import com.learnora.backend.model.Post;
import com.learnora.backend.model.CommentModel;
import com.learnora.backend.model.UserModel;
import com.learnora.backend.repository.PostRepository;
import com.learnora.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<Post> getPostById(String id) {
        return postRepository.findById(id);
    }

    public Post createPost(Post post, String email) {
        UserModel user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        post.setUser(user);
        post.setCreatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    public Post updatePost(String id, Post updatedPost, String email) {
        Post existingPost = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!existingPost.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Not authorized to update this post");
        }

        existingPost.setTitle(updatedPost.getTitle());
        existingPost.setContent(updatedPost.getContent());
        existingPost.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(existingPost);
    }

    public void deletePost(String id, String email) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Not authorized to delete this post");
        }

        postRepository.delete(post);
    }

    public List<Post> getPostsByUserEmail(String email) {
        return postRepository.findByUserEmailOrderByCreatedAtDesc(email);
    }

    public Post addComment(String postId, CommentModel comment) {
        Optional<Post> post = postRepository.findById(postId);
        if (post.isPresent()) {
            Post existingPost = post.get();
            existingPost.getComments().add(comment);
            existingPost.setUpdatedAt(LocalDateTime.now());
            return postRepository.save(existingPost);
        }
        return null;
    }

    public Post removeComment(String postId, String commentId) {
        Optional<Post> post = postRepository.findById(postId);
        if (post.isPresent()) {
            Post existingPost = post.get();
            existingPost.getComments().removeIf(comment -> comment.getId().equals(commentId));
            existingPost.setUpdatedAt(LocalDateTime.now());
            return postRepository.save(existingPost);
        }
        return null;
    }
} 