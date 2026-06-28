package com.supportsaas.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Backs logout / token-revocation using Redis. When a user logs out, the
 * access token is pushed here with a TTL matching its remaining lifetime,
 * so the JwtAuthFilter can reject it even though it hasn't technically expired.
 */
@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private static final String PREFIX = "blacklist:token:";

    private final RedisTemplate<String, String> redisTemplate;

    public void blacklist(String token, long ttlMillis) {
        redisTemplate.opsForValue().set(PREFIX + token, "1", Duration.ofMillis(Math.max(ttlMillis, 0)));
    }

    public boolean isBlacklisted(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(PREFIX + token));
    }
}
