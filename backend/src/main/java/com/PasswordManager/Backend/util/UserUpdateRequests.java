package com.PasswordManager.Backend.util;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class UserUpdateRequests {

    @Data
    public static class ChangeUsername {
        @NotBlank
        private String newUsername;
    }

    @Data
    public static class ChangePassword {
        @NotBlank
        private String currentPassword;
        @NotBlank
        private String newPassword;
    }
}
