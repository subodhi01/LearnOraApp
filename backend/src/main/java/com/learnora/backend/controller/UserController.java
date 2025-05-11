package com.learnora.backend.controller;

import com.learnora.backend.model.UserModel;
import com.learnora.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/auth/signup")
    public ResponseEntity<?> signup(@RequestBody UserModel user) {
        try {
            UserModel createdUser = userService.signup(user);
            return ResponseEntity.ok(createdUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/auth/signin")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            
            if (email == null || password == null) {
                return ResponseEntity.badRequest().body("Email and password are required");
            }

            Map<String, Object> response = userService.login(email, password);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/auth/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload) {
        try {
            String idToken = payload.get("idToken");
            if (idToken == null) {
                return ResponseEntity.badRequest().body("ID token is required");
            }
            Map<String, Object> response = userService.googleLogin(idToken);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/auth/profile")
    public ResponseEntity<?> getUserProfile(@RequestParam String email) {
        try {
            UserModel user = userService.getUserProfile(email);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/auth/profile")
    public ResponseEntity<?> updateUserProfile(@RequestParam String email, @RequestBody UserModel updates) {
        try {
            UserModel updatedUser = userService.updateUserProfile(email, updates);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/auth/change-password")
    public ResponseEntity<?> changePassword(@RequestParam String email, @RequestBody Map<String, String> passwords) {
        try {
            String oldPassword = passwords.get("oldPassword");
            String newPassword = passwords.get("newPassword");
            
            if (oldPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body("Old password and new password are required");
            }

            userService.changePassword(email, oldPassword, newPassword);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/auth/profile")
    public ResponseEntity<?> deleteUserProfile(@RequestParam String email, @RequestBody Map<String, String> request) {
        try {
            String password = request.get("password");
            if (password == null) {
                return ResponseEntity.badRequest().body("Password is required for account deletion");
            }

            userService.deleteUserProfile(email, password);
            return ResponseEntity.ok("User profile deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/users/followers")
    public ResponseEntity<?> getFollowers(@RequestParam String email) {
        try {
            List<UserModel> followers = userService.getFollowers(email);
            return ResponseEntity.ok(followers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/users/following")
    public ResponseEntity<?> getFollowing(@RequestParam String email) {
        try {
            List<UserModel> following = userService.getFollowing(email);
            return ResponseEntity.ok(following);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/users/follow")
    public ResponseEntity<?> followUser(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String userId = request.get("userId");
            if (email == null || userId == null) {
                return ResponseEntity.badRequest().body("Email and userId are required");
            }
            userService.followUser(email, userId);
            return ResponseEntity.ok("Followed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/users/unfollow")
    public ResponseEntity<?> unfollowUser(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String userId = request.get("userId");
            if (email == null || userId == null) {
                return ResponseEntity.badRequest().body("Email and userId are required");
            }
            userService.unfollowUser(email, userId);
            return ResponseEntity.ok("Unfollowed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/users/search")
    public ResponseEntity<?> searchUsers(@RequestParam String username) {
        try {
            List<UserModel> users = userService.searchUsers(username);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}