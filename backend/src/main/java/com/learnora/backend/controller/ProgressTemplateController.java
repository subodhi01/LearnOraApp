package com.learnora.backend.controller;

import com.learnora.backend.model.ProgressTemplate;
import com.learnora.backend.service.ProgressTemplateService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;

@RestController
@RequestMapping("/api/progress-templates")
@CrossOrigin(origins = "http://localhost:3000")
public class ProgressTemplateController {
    private static final Logger logger = LoggerFactory.getLogger(ProgressTemplateController.class);

    @Autowired
    private ProgressTemplateService progressTemplateService;

    @PostMapping
    public ResponseEntity<ProgressTemplate> createTemplate(@RequestBody ProgressTemplate template) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.debug("Received request to create template. Auth: {}, Template: {}", auth, template);
        
        if (auth == null || !auth.isAuthenticated()) {
            logger.error("Authentication failed: {}", auth);
            return ResponseEntity.status(403).build();
        }

        String userEmail = auth.getName();
        logger.debug("Authenticated user email: {}", userEmail);
        
        // Set the userId to match the authenticated user's email
        template.setUserId(userEmail);
        
        try {
            ProgressTemplate createdTemplate = progressTemplateService.createTemplate(template);
            logger.debug("Successfully created template: {}", createdTemplate);
            return ResponseEntity.ok(createdTemplate);
        } catch (Exception e) {
            logger.error("Error creating template: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgressTemplate> updateTemplate(
            @PathVariable String id,
            @RequestBody ProgressTemplate template) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(403).build();
        }
        template.setUserId(auth.getName());
        return ResponseEntity.ok(progressTemplateService.updateTemplate(id, template));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(403).build();
        }
        progressTemplateService.deleteTemplate(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProgressTemplate>> getUserTemplates(@PathVariable String userId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(403).build();
        }
        // Only allow users to access their own templates
        if (!auth.getName().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(progressTemplateService.getUserTemplates(userId));
    }

    @GetMapping("/user/{userId}/course/{courseId}")
    public ResponseEntity<ProgressTemplate> getTemplateByUserAndCourse(
            @PathVariable String userId,
            @PathVariable String courseId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(403).build();
        }
        // Only allow users to access their own templates
        if (!auth.getName().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        return progressTemplateService.getTemplateByUserAndCourse(userId, courseId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<ProgressTemplate>> getAllTemplates() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.debug("Received request to get all templates. Auth: {}", auth);
        
        if (auth == null || !auth.isAuthenticated()) {
            logger.error("Authentication failed: {}", auth);
            return ResponseEntity.status(403).build();
        }

        String userEmail = auth.getName();
        logger.debug("Authenticated user email: {}", userEmail);
        
        try {
            List<ProgressTemplate> templates = progressTemplateService.getUserTemplates(userEmail);
            logger.debug("Successfully retrieved templates: {}", templates);
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            logger.error("Error retrieving templates: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }
} 