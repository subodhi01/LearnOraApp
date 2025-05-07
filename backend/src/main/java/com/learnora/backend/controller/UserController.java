// package com.learnora.backend.controller;

// import com.learnora.backend.model.UserModel;
// import com.learnora.backend.service.UserService;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.Map;

// @RestController
// @RequestMapping("/api/auth")
// @CrossOrigin(origins = "http://localhost:3000")
// public class UserController {

//     @Autowired
//     private UserService userService;

//     @PostMapping("/signup")
//     public ResponseEntity<?> signup(@RequestBody UserModel user) {
//         try {
//             UserModel createdUser = userService.signup(user);
//             return ResponseEntity.ok(createdUser);
//         } catch (Exception e) {
//             return ResponseEntity.badRequest().body(e.getMessage());
//         }
//     }

//     @PostMapping("/signin")
//     public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
//         try {
//             String email = credentials.get("email");
//             String password = credentials.get("password");
            
//             if (email == null || password == null) {
//                 return ResponseEntity.badRequest().body("Email and password are required");
//             }

//             Map<String, Object> response = userService.login(email, password);
//             return ResponseEntity.ok(response);
//         } catch (Exception e) {
//             return ResponseEntity.badRequest().body(e.getMessage());
//         }
//     }

//     @GetMapping("/profile")
//     public ResponseEntity<?> getUserProfile(@RequestParam String email) {
//         try {
//             UserModel user = userService.getUserProfile(email);
//             return ResponseEntity.ok(user);
//         } catch (Exception e) {
//             return ResponseEntity.badRequest().body(e.getMessage());
//         }
//     }

//     @PutMapping("/profile")
//     public ResponseEntity<?> updateUserProfile(@RequestParam String email, @RequestBody UserModel updates) {
//         try {
//             UserModel updatedUser = userService.updateUserProfile(email, updates);
//             return ResponseEntity.ok(updatedUser);
//         } catch (Exception e) {
//             return ResponseEntity.badRequest().body(e.getMessage());
//         }
//     }

//     @PutMapping("/change-password")
//     public ResponseEntity<?> changePassword(@RequestParam String email, @RequestBody Map<String, String> passwords) {
//         try {
//             String oldPassword = passwords.get("oldPassword");
//             String newPassword = passwords.get("newPassword");
            
//             if (oldPassword == null || newPassword == null) {
//                 return ResponseEntity.badRequest().body("Old password and new password are required");
//             }

//             userService.changePassword(email, oldPassword, newPassword);
//             return ResponseEntity.ok().build();
//         } catch (Exception e) {
//             return ResponseEntity.badRequest().body(e.getMessage());
//         }
//     }

//     @DeleteMapping("/profile")
//     public ResponseEntity<?> deleteUserProfile(@RequestParam String email, @RequestBody Map<String, String> request) {
//         try {
//             String password = request.get("password");
//             if (password == null) {
//                 return ResponseEntity.badRequest().body("Password is required for account deletion");
//             }

//             userService.deleteUserProfile(email, password);
//             return ResponseEntity.ok("User profile deleted successfully");
//         } catch (Exception e) {
//             return ResponseEntity.badRequest().body(e.getMessage());
//         }
//     }
// }
package com.learnora.backend.controller;

   import com.learnora.backend.model.UserModel;
   import com.learnora.backend.service.UserService;
   import org.springframework.beans.factory.annotation.Autowired;
   import org.springframework.http.ResponseEntity;
   import org.springframework.web.bind.annotation.*;

   import java.util.Map;

   @RestController
   @RequestMapping("/api/auth")
   @CrossOrigin(origins = "http://localhost:3000")
   public class UserController {

       @Autowired
       private UserService userService;

       @PostMapping("/signup")
       public ResponseEntity<?> signup(@RequestBody UserModel user) {
           try {
               UserModel createdUser = userService.signup(user);
               return ResponseEntity.ok(createdUser);
           } catch (Exception e) {
               return ResponseEntity.badRequest().body(e.getMessage());
           }
       }

       @PostMapping("/signin")
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

       @PostMapping("/google")
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

       @GetMapping("/profile")
       public ResponseEntity<?> getUserProfile(@RequestParam String email) {
           try {
               UserModel user = userService.getUserProfile(email);
               return ResponseEntity.ok(user);
           } catch (Exception e) {
               return ResponseEntity.badRequest().body(e.getMessage());
           }
       }

       @PutMapping("/profile")
       public ResponseEntity<?> updateUserProfile(@RequestParam String email, @RequestBody UserModel updates) {
           try {
               UserModel updatedUser = userService.updateUserProfile(email, updates);
               return ResponseEntity.ok(updatedUser);
           } catch (Exception e) {
               return ResponseEntity.badRequest().body(e.getMessage());
           }
       }

       @PutMapping("/change-password")
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

       @DeleteMapping("/profile")
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
   }