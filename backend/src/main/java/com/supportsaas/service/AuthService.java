package com.supportsaas.service;

import com.supportsaas.dto.AuthResponse;
import com.supportsaas.dto.LoginRequest;
import com.supportsaas.dto.RegisterRequest;
import com.supportsaas.entity.Role;
import com.supportsaas.entity.User;
import com.supportsaas.exception.BadRequestException;
import com.supportsaas.repository.UserRepository;
import com.supportsaas.security.CustomUserDetails;
import com.supportsaas.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final TokenBlacklistService tokenBlacklistService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with this email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .enabled(true)
                .build();
        userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        return buildAuthResponse(userDetails, user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        CustomUserDetails userDetails = new CustomUserDetails(user);
        return buildAuthResponse(userDetails, user);
    }

    public void logout(String token) {
        long remainingTtl = jwtService.extractExpiration(token).getTime() - System.currentTimeMillis();
        tokenBlacklistService.blacklist(token, remainingTtl);
    }

    private AuthResponse buildAuthResponse(CustomUserDetails userDetails, User user) {
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
