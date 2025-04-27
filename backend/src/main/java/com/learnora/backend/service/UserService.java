package com.learnora.backend.service;

import com.learnora.backend.model.UserModel;
import com.learnora.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserModel signup(UserModel user) throws Exception {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new Exception("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public UserModel login(String email, String password) throws Exception {
        UserModel user = userRepository.findByEmail(email)
            .orElseThrow(() -> new Exception("Invalid email or password"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new Exception("Invalid email or password");
        }
        return user;
    }

    public UserModel getUserProfile(String email) throws Exception {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new Exception("User not found"));
    }

    public UserModel updateUserProfile(String email, UserModel updates) throws Exception {
        UserModel user = userRepository.findByEmail(email)
            .orElseThrow(() -> new Exception("User not found"));
        if (updates.getFirstName() != null) {
            user.setFirstName(updates.getFirstName());
        }
        if (updates.getLastName() != null) {
            user.setLastName(updates.getLastName());
        }
        return userRepository.save(user);
    }

    public void changePassword(String email, String oldPassword, String newPassword) throws Exception {
        UserModel user = userRepository.findByEmail(email)
            .orElseThrow(() -> new Exception("User not found"));
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new Exception("Invalid current password");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}