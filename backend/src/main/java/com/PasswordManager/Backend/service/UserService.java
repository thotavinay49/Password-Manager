package com.PasswordManager.Backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.PasswordManager.Backend.model.User;
import com.PasswordManager.Backend.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findUserWithCredentials(String username) {
        return userRepository.findWithCredentialsByUsername(username);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    public boolean updateUsername(String currentUsername, String newUsername) {
        if (userRepository.existsByUsername(newUsername))
            return false;
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setUsername(newUsername);
        userRepository.save(user);
        return true;
    }

    public boolean updatePassword(String username, String currentRaw, String newRaw) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(currentRaw, user.getPassword()))
            return false;
        user.setPassword(passwordEncoder.encode(newRaw));
        userRepository.save(user);
        return true;
    }

    @Transactional
    public boolean deleteCredentialFromUser(Long userId, Long credId) {
        User user = findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getCredentials().removeIf(c -> c.getId().equals(credId));
    }

    // ✅ Get latest tokenIssuedAt (in seconds)
    public Long getLatestIssuedAt(String username) {
        return userRepository.findByUsername(username)
                .map(User::getTokenIssuedAt)
                .orElse(0L);
    }

    // ✅ Update tokenIssuedAt (usually after issuing new token)
    public void updateTokenIssuedAt(String username, long newIssuedAt) {
        userRepository.findByUsername(username).ifPresent(user -> {
            user.setTokenIssuedAt(newIssuedAt);
            userRepository.save(user);
        });
    }
}
