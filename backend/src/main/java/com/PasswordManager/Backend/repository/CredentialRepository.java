package com.PasswordManager.Backend.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.PasswordManager.Backend.model.Credential;
import com.PasswordManager.Backend.model.User;

public interface CredentialRepository extends JpaRepository<Credential, Long> {
    Optional<Credential> findByUserAndServiceName(User user, String serviceName);

    List<Credential> findByUser(User user);
}