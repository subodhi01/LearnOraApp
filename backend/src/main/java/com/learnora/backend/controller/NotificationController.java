package com.learnora.backend.controller;

import com.learnora.backend.model.NotificationModel;
import com.learnora.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    @GetMapping("/user")
    public ResponseEntity<List<NotificationModel>> getUserNotifications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        return ResponseEntity.ok(notificationService.getUserNotifications(userEmail));
    }

    @GetMapping("/user/unread")
    public ResponseEntity<List<NotificationModel>> getUnreadNotifications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userEmail));
    }

    @GetMapping("/user/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(userEmail)));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationModel> markAsRead(@PathVariable String notificationId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        NotificationModel notification = notificationService.markAsRead(notificationId, userEmail);
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/user/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        notificationService.markAllAsRead(userEmail);
        return ResponseEntity.ok().build();
    }
}