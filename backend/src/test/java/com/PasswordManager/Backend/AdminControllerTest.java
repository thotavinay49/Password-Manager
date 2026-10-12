package com.PasswordManager.Backend;

import com.PasswordManager.Backend.controller.AdminController;
import com.PasswordManager.Backend.model.User;
import com.PasswordManager.Backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdminControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminController adminController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetAllUsersWithCredentials() {
        User user = new User();
        user.setUsername("testuser");

        when(userService.getAllUsers()).thenReturn(List.of(user));

        ResponseEntity<List<User>> response = adminController.getAllUsersWithCredentials();
        List<User> users = response.getBody();

        assertNotNull(users);
        assertEquals(1, users.size());
        assertEquals("testuser", users.get(0).getUsername());
    }

    @Test
    void testCreateUser() {
        User user = new User();
        user.setUsername("newuser");
        user.setPassword("password");

        when(passwordEncoder.encode("password")).thenReturn("hashedpass");
        when(userService.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<User> response = adminController.createUser(user);
        User createdUser = response.getBody();

        assertNotNull(createdUser);
        assertEquals("hashedpass", createdUser.getPassword());
        assertEquals("ROLE_USER", createdUser.getRole());
    }

    @Test
    void testDeleteUserById() {
        User user = new User();
        user.setId(1L);

        when(userService.findById(1L)).thenReturn(Optional.of(user));
        doNothing().when(userService).deleteUserById(1L);

        ResponseEntity<String> response = adminController.deleteUser(1L);
        assertEquals("User deleted successfully.", response.getBody());

        verify(userService, times(1)).deleteUserById(1L);
    }

    @Test
    void testDeleteCredentialFromUser() {
        Long userId = 1L;
        Long credId = 2L;

        when(userService.deleteCredentialFromUser(userId, credId)).thenReturn(true);
        ResponseEntity<String> response = adminController.deleteCredentialFromUser(userId, credId);
        assertEquals("Credential deleted successfully.", response.getBody());

        when(userService.deleteCredentialFromUser(userId, credId)).thenReturn(false);
        ResponseEntity<String> responseNotFound = adminController.deleteCredentialFromUser(userId, credId);
        assertEquals(404, responseNotFound.getStatusCode().value());
        assertEquals("Credential not found or not associated with user.", responseNotFound.getBody());
    }
}
