package com.learnora.backend.controller;

import com.learnora.backend.model.Post;
import com.learnora.backend.model.CommentModel;
import com.learnora.backend.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:3000")
public class PostController {
    
    @Autowired
    private PostService postService;
    
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Post post, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(postService.createPost(post, email));
    }
    
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable String id) {
        return postService.getPostById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable String id, @RequestBody Post post, Authentication authentication) {
        try {
            String email = authentication.getName();
            Post updatedPost = postService.updatePost(id, post, email);
            return ResponseEntity.ok(updatedPost);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id, Authentication authentication) {
        try {
            String email = authentication.getName();
            postService.deletePost(id, email);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/user/{email}")
    public ResponseEntity<List<Post>> getPostsByUserEmail(@PathVariable String email) {
        return ResponseEntity.ok(postService.getPostsByUserEmail(email));
    }
    
    @PostMapping("/{postId}/comments")
    public ResponseEntity<Post> addComment(@PathVariable String postId, @RequestBody CommentModel comment) {
        Post updatedPost = postService.addComment(postId, comment);
        if (updatedPost != null) {
            return ResponseEntity.ok(updatedPost);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<Post> removeComment(@PathVariable String postId, @PathVariable String commentId) {
        Post updatedPost = postService.removeComment(postId, commentId);
        if (updatedPost != null) {
            return ResponseEntity.ok(updatedPost);
        }
        return ResponseEntity.notFound().build();
    }
} 