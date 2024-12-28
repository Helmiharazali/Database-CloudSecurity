package com.yourpackage.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${allowed.origins:http://localhost:3000}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.split(",")) // Use environment variables for flexibility
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Limit methods as per API requirements
                .allowedHeaders("Authorization", "Content-Type", "Accept") // Specify only required headers
                .exposedHeaders("Authorization") // Expose headers needed by frontend
                .allowCredentials(true) // Allow credentials like Authorization headers
                .maxAge(3600); // Cache preflight requests for 1 hour
    }
}
