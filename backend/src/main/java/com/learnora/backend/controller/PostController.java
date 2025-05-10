package com.learnora.backend.controller;

import com.learnora.backend.model.Post;
import com.learnora.backend.model.CommentModel;
import com.learnora.backend.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE}, allowedHeaders = "*")
@RequestMapping("/api")
public class PostController {
    
    @Autowired
    private PostService postService;
    
    @PostMapping("/create")
    public ResponseEntity<Post> addPost(@RequestBody Post post) {
        Post createdPost = postService.addPost(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
    }
    
    @GetMapping("/Get")
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }
    
    @GetMapping("/{postUId}")
    public ResponseEntity<List<Post>> getPostsByPostUId(@PathVariable String postUId) {
        List<Post> posts = postService.getPostsByPostUId(postUId);
        if (!posts.isEmpty()) {
            return ResponseEntity.ok(posts);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/update/{postId}")
    public ResponseEntity<Post> updatePost(@PathVariable String postId, @RequestBody Post post) {
        Post updatedPost = postService.updatePost(postId, post);
        if (updatedPost != null) {
            return ResponseEntity.ok(updatedPost);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deletePost(@PathVariable("id") String id) {
        try {
            postService.deletePost(id);
            return ResponseEntity.ok("Delete successful for ID: " + id);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete post with ID: " + id + " due to: " + e.getMessage());
        }
    }
    
    @PutMapping("/like/{postId}")
    public ResponseEntity<Post> likePost(@PathVariable String postId) {
        Post updatedPost = postService.likePost(postId);
        if (updatedPost != null) {
            return ResponseEntity.ok(updatedPost);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/AllDelete")
    public ResponseEntity<Void> deleteAllPosts() {
        postService.deleteAllPosts();
        return ResponseEntity.noContent().build();
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