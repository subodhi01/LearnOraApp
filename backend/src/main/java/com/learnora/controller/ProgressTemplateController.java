package com.learnora.controller;

import com.learnora.model.ProgressTemplate;
import com.learnora.service.ProgressTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/progress-templates")
@CrossOrigin(origins = "*")
public class ProgressTemplateController {

    @Autowired
    private ProgressTemplateService progressTemplateService;

    @PostMapping
    public ResponseEntity<ProgressTemplate> createTemplate(@RequestBody ProgressTemplate template) {
        return ResponseEntity.ok(progressTemplateService.createTemplate(template));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgressTemplate> updateTemplate(
            @PathVariable String id,
            @RequestBody ProgressTemplate template) {
        return ResponseEntity.ok(progressTemplateService.updateTemplate(id, template));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        progressTemplateService.deleteTemplate(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProgressTemplate>> getUserTemplates(@PathVariable String userId) {
        return ResponseEntity.ok(progressTemplateService.getUserTemplates(userId));
    }

    @GetMapping("/user/{userId}/course/{courseId}")
    public ResponseEntity<ProgressTemplate> getTemplateByUserAndCourse(
            @PathVariable String userId,
            @PathVariable String courseId) {
        return progressTemplateService.getTemplateByUserAndCourse(userId, courseId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
} 