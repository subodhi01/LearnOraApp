package com.learnora.backend.service;

import com.learnora.backend.model.UserModel;
import com.learnora.backend.repository.UserRepository;
import com.learnora.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    public UserModel signup(UserModel user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        
        // Encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Map<String, Object> login(String email, String password) {
        try {
            // Authenticate user
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
            );

            // Get user from repository
            UserModel user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            // Generate token
            String token = jwtUtil.generateToken(user.getEmail());

            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("email", user.getEmail());
            response.put("token", token);

            return response;
        } catch (Exception e) {
            throw new RuntimeException("Invalid email or password");
        }
    }

    public UserModel getUserProfile(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserModel updateUserProfile(String email, UserModel updates) {
        UserModel user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (updates.getFirstName() != null) {
            user.setFirstName(updates.getFirstName());
        }
        if (updates.getLastName() != null) {
            user.setLastName(updates.getLastName());
        }
        if (updates.getPhone() != null) {
            user.setPhone(updates.getPhone());
        }
        
        return userRepository.save(user);
    }

    public void changePassword(String email, String oldPassword, String newPassword) {
        UserModel user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Invalid current password");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void deleteUserProfile(String email, String password) {
        UserModel user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        
        userRepository.delete(user);
    }
}