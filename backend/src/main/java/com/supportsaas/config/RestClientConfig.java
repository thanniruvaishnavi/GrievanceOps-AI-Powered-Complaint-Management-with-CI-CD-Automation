package com.supportsaas.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${ml-service.base-url}")
    private String mlServiceBaseUrl;

    @Bean
    public RestClient mlServiceRestClient() {
        return RestClient.builder()
                .baseUrl(mlServiceBaseUrl)
                .build();
    }
}
