package com.learnora.backend.controller;

import com.learnora.backend.model.ProgressTemplate;
import com.learnora.backend.service.ProgressTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/progress-templates")
@CrossOrigin(origins = "http://localhost:3000")
public class ProgressTemplateController {

    @Autowired
    private ProgressTemplateService progressTemplateService;

    @PostMapping
    public ResponseEntity<?> createTemplate(@RequestBody ProgressTemplate template) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            template.setUserId(userEmail);
            ProgressTemplate createdTemplate = progressTemplateService.createTemplate(template);
            return ResponseEntity.ok(createdTemplate);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTemplate(
            @PathVariable String id,
            @RequestBody ProgressTemplate template) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            ProgressTemplate updatedTemplate = progressTemplateService.updateTemplate(id, template, userEmail);
            return ResponseEntity.ok(updatedTemplate);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTemplate(@PathVariable String id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            progressTemplateService.deleteTemplate(id, userEmail);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserTemplates() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            List<ProgressTemplate> templates = progressTemplateService.getUserTemplates(userEmail);
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/course/{courseId}")
    public ResponseEntity<?> getTemplateByUserAndCourse(@PathVariable String courseId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            return progressTemplateService.getTemplateByUserAndCourse(userEmail, courseId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}