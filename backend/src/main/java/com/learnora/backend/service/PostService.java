package com.learnora.backend.service;

import com.learnora.backend.model.Post;
import com.learnora.backend.model.CommentModel;
import com.learnora.backend.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public List<Post> getPostsByPostUId(String postUId) {
        return postRepository.findByUserId(postUId);
    }

    public Post addPost(Post post) {
        return postRepository.save(post);
    }

    public Post updatePost(String postId, Post post) {
        Optional<Post> existingPost = postRepository.findById(postId);
        if (existingPost.isPresent()) {
            Post updatedPost = existingPost.get();
            updatedPost.setTitle(post.getTitle());
            updatedPost.setContent(post.getContent());
            updatedPost.setVideo(post.getVideo());
            return postRepository.save(updatedPost);
        }
        return null;
    }

    public void deletePost(String id) {
        postRepository.deleteById(id);
    }

    public Post likePost(String postId) {
        Optional<Post> post = postRepository.findById(postId);
        if (post.isPresent()) {
            Post updatedPost = post.get();
            updatedPost.setLikes(updatedPost.getLikes() + 1);
            return postRepository.save(updatedPost);
        }
        return null;
    }

    public void deleteAllPosts() {
        postRepository.deleteAll();
    }

    public Post addComment(String postId, CommentModel comment) {
        Optional<Post> post = postRepository.findById(postId);
        if (post.isPresent()) {
            Post existingPost = post.get();
            existingPost.getComments().add(comment);
            return postRepository.save(existingPost);
        }
        return null;
    }

    public Post removeComment(String postId, String commentId) {
        Optional<Post> post = postRepository.findById(postId);
        if (post.isPresent()) {
            Post existingPost = post.get();
            existingPost.getComments().removeIf(comment -> comment.getId().equals(commentId));
            return postRepository.save(existingPost);
        }
        return null;
    }
} 