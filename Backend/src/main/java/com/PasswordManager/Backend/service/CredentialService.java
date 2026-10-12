package com.PasswordManager.Backend.service;

import com.PasswordManager.Backend.model.Credential;
import com.PasswordManager.Backend.model.CredentialResponse;
import com.PasswordManager.Backend.model.User;
import com.PasswordManager.Backend.repository.CredentialRepository;
import com.PasswordManager.Backend.repository.UserRepository;
import com.PasswordManager.Backend.util.PwdStrengthUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CredentialService {

    private final CredentialRepository credentialRepository;
    private final UserRepository userRepository;
    private final CredentialEncryptionService encryptionService;

    public CredentialService(
            CredentialRepository credentialRepository,
            UserRepository userRepository,
            CredentialEncryptionService encryptionService) {
        this.credentialRepository = credentialRepository;
        this.userRepository = userRepository;
        this.encryptionService = encryptionService;
    }

    public CredentialResponse addCredential(Credential credential, String username) {
        User user = getUserOrThrow(username);
        Optional<Credential> dup = credentialRepository.findByUserAndServiceName(user, credential.getServiceName());
        if (dup.isPresent())
            throw new RuntimeException("Credential already exists for this site.");

        String plaintextPassword = credential.getPassword();
        credential.setUser(user);
        credential.setPassword(encryptionService.encrypt(plaintextPassword));
        return toResponse(credentialRepository.save(credential), plaintextPassword);
    }

    @Transactional
    public CredentialResponse changeCredential(Credential req, String username) {
        Credential credential = credentialRepository.findById(req.getId())
                .orElseThrow(() -> new RuntimeException("Credential not found"));
        if (!credential.getUser().getUsername().equals(username))
            throw new RuntimeException("Unauthorized: You can only update your own credentials");

        String plaintextPassword = req.getPassword();
        credential.setServiceName(req.getServiceName());
        credential.setUsername(req.getUsername());
        credential.setPassword(encryptionService.encrypt(plaintextPassword));
        return toResponse(credential, plaintextPassword);
    }

    @Transactional
    public List<CredentialResponse> getUserCredentials(String username) {
        return credentialRepository.findByUser(getUserOrThrow(username)).stream()
                .map(credential -> {
                    String storedPassword = credential.getPassword();
                    String plaintextPassword = encryptionService.decrypt(storedPassword);
                    if (!encryptionService.isEncrypted(storedPassword)) {
                        credential.setPassword(encryptionService.encrypt(plaintextPassword));
                    }
                    return toResponse(credential, plaintextPassword);
                })
                .toList();
    }

    public void deleteCredential(Long credentialId, String username) {
        Credential credential = credentialRepository.findById(credentialId)
                .orElseThrow(() -> new RuntimeException("Credential not found"));
        if (!credential.getUser().getUsername().equals(username))
            throw new RuntimeException("Unauthorized: You can only delete your own credentials");
        credentialRepository.delete(credential);
    }

    private User getUserOrThrow(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private CredentialResponse toResponse(Credential credential, String plaintextPassword) {
        return new CredentialResponse(
                credential.getId(),
                credential.getServiceName(),
                credential.getUsername(),
                plaintextPassword,
                PwdStrengthUtil.analyze(plaintextPassword));
    }
}
