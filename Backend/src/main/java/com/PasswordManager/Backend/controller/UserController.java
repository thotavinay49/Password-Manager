package com.PasswordManager.Backend.controller;

import com.PasswordManager.Backend.model.User;
import com.PasswordManager.Backend.model.JwtResponse;
import com.PasswordManager.Backend.service.UserService;
import com.PasswordManager.Backend.util.JwtUtil;
import com.PasswordManager.Backend.util.UserUpdateRequests.ChangeUsername;
import com.PasswordManager.Backend.util.UserUpdateRequests.ChangePassword;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserService userService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Value("${app.cookie-secure:false}")
    private boolean cookieSecure;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginUser, HttpServletResponse response) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginUser.getUsername(), loginUser.getPassword()));

            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String username = userDetails.getUsername();
            String role = userDetails.getAuthorities().iterator().next().getAuthority();

            User user = userService.findByUsername(username).orElseThrow();

            long now = System.currentTimeMillis();
            user.setTokenIssuedAt(now);
            String token = jwtUtil.generateToken(username, role, now);
            String refreshToken = jwtUtil.generateRefreshToken(username);

            user.setRefreshToken(refreshToken);
            userService.save(user);

            Cookie refresh = new Cookie("refreshToken", refreshToken);
            refresh.setHttpOnly(true);
            refresh.setSecure(cookieSecure);
            refresh.setPath("/api");
            refresh.setMaxAge(7 * 24 * 60 * 60);
            response.addCookie(refresh);

            return ResponseEntity.ok(new JwtResponse(token, "Bearer", 15));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<JwtResponse> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = null;
        Cookie[] cookies = request.getCookies();

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshToken == null || !jwtUtil.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String extractedUsername = jwtUtil.extractUsername(refreshToken);
        User user = userService.findByUsername(extractedUsername).orElse(null);

        if (user == null || !refreshToken.equals(user.getRefreshToken())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        long now = System.currentTimeMillis();
        user.setTokenIssuedAt(now);
        userService.save(user);

        String newAccessToken = jwtUtil.generateToken(extractedUsername, user.getRole(), now);
        return ResponseEntity.ok(new JwtResponse(newAccessToken, "Bearer", 15));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        userService.findByUsername(username).ifPresent(user -> {
            user.setRefreshToken(null);
            user.setTokenIssuedAt(null);
            userService.save(user);
        });

        Cookie refresh = new Cookie("refreshToken", null);
        refresh.setHttpOnly(true);
        refresh.setSecure(cookieSecure);
        refresh.setPath("/api");
        refresh.setMaxAge(0);
        response.addCookie(refresh);

        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody @Valid User user) {
        if (userService.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already taken");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("ROLE_USER");
        userService.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.findUserWithCredentials(username)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PatchMapping("/username")
    public ResponseEntity<?> changeUsername(@RequestBody @Valid ChangeUsername req) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean ok = userService.updateUsername(currentUser, req.getNewUsername());
        return ok ? ResponseEntity.ok("Username updated")
                : ResponseEntity.status(HttpStatus.CONFLICT).body("Username already taken");
    }

    @PatchMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody @Valid ChangePassword req) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean ok = userService.updatePassword(currentUser, req.getCurrentPassword(), req.getNewPassword());
        return ok ? ResponseEntity.ok("Password changed")
                : ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Current password incorrect");
    }

    @GetMapping("/hello")
    public ResponseEntity<String> hello() {
        return ResponseEntity.ok("Hello");
    }
}
