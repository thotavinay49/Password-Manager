package com.PasswordManager.Backend.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import com.PasswordManager.Backend.model.User;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    private static final long EXPIRATION_TIME = 1000 * 60 * 15; // 15 minutes
    private static final long TOKEN_ISSUED_AT_GRACE_WINDOW_MS = 2000; // 2 seconds

    private final String secretKey;

    public JwtUtil(@Value("${app.jwt-secret:super-secret-key-which-is-long-enough-to-be-secure-default}") String secretKey) {
        this.secretKey = secretKey;
    }

    private Key getSigningKey() {
        byte[] keyBytes = secretKey.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String username, String role) {
        return generateToken(username, role, System.currentTimeMillis());
    }

    public String generateToken(String username, String role, long issuedAtMillis) {
        Date issuedAt = new Date(issuedAtMillis);
        Date expiration = new Date(issuedAtMillis + EXPIRATION_TIME);

        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(issuedAt)
                .setExpiration(expiration)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    public long extractIssuedAt(String token) {
        return extractClaims(token).getIssuedAt().getTime();
    }

    public boolean validateToken(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (JwtException e) {
            System.out.println("❌ Invalid token: " + e.getMessage());
            return false;
        }
    }

    public boolean validateToken(String token, User user) {
        try {
            Claims claims = extractClaims(token);
            long tokenIat = claims.getIssuedAt().getTime();
            Long latestIat = user.getTokenIssuedAt();

            if (latestIat != null && (tokenIat + TOKEN_ISSUED_AT_GRACE_WINDOW_MS) < latestIat) {
                System.out.println("❌ Token manually expired: token.iat + 2s < user.tokenIssuedAt");
                return false;
            }

            if (claims.getExpiration().before(new Date())) {
                System.out.println("❌ Token expired by time");
                return false;
            }

            return true;
        } catch (JwtException e) {
            System.out.println("❌ Invalid token: " + e.getMessage());
            return false;
        }
    }

    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 7L * 24 * 60 * 60 * 1000)) // 7 days
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
