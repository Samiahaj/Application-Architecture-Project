package be.ehb.backend.config;
/**
 * Beveiligingsconfiguratie van de applicatie.
 * Beheert CORS, CSRF-uitschakeling, sessiebeheer en toegangsrechten
 * op basis van HTTP-methodes en gebruikersrollen (USER / ADMIN).
 */
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .securityContext(context -> context.requireExplicitSave(true))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setStatus(200);
                        })
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                )
                .authorizeHttpRequests(auth -> auth
                        // Routes publiques
                        .requestMatchers(
                                "/api/users/register",
                                "/api/users/login",
                                "/logout"
                        ).permitAll()

                        // Boeken en auteurs bekijken is openbaar
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/books",
                                "/api/books/**",
                                "/api/authors",
                                "/api/authors/**"
                        ).permitAll()
                        // Beoordelingen bekijken is openbaar
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/reviews/book/**"
                        ).permitAll()

                        // Alleen beheerders mogen boeken beheren
                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST,
                                "/api/books",
                                "/api/books/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                org.springframework.http.HttpMethod.PUT,
                                "/api/books/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                org.springframework.http.HttpMethod.DELETE,
                                "/api/books/**"
                        ).hasRole("ADMIN")

                        // Alleen beheerders mogen auteurs beheren
                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST,
                                "/api/authors",
                                "/api/authors/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                org.springframework.http.HttpMethod.PUT,
                                "/api/authors/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                org.springframework.http.HttpMethod.DELETE,
                                "/api/authors/**"
                        ).hasRole("ADMIN")

                        // Gebruikersbeheer is alleen voor beheerders
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/api/users"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                org.springframework.http.HttpMethod.PUT,
                                "/api/users/*/role"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                org.springframework.http.HttpMethod.DELETE,
                                "/api/users/*"
                        ).hasRole("ADMIN")

                        // Alleen beheerders mogen reserveringsstatussen wijzigen
                        .requestMatchers(
                                "/api/reservations/*/status"
                        ).hasRole("ADMIN")

                        // Alle andere routes vereisen een login
                        .anyRequest().authenticated()
                );

        return http.build();
    }
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:5173", "http://localhost:5174")
        );

        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")
        );

        configuration.setAllowedHeaders(List.of("*"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}