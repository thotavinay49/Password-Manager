package com.PasswordManager.Backend.model;

import java.util.List;

public record CredentialResponse(
        Long id,
        String serviceName,
        String username,
        String password,
        List<String> pswdStrength) {
}
