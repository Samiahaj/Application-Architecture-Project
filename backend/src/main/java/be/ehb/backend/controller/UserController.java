package be.ehb.backend.controller;

import be.ehb.backend.model.User;
import be.ehb.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;

    public UserController(
            UserService userService,
            AuthenticationManager authenticationManager,
            SecurityContextRepository securityContextRepository) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
    }

    // Registreert een nieuwe gebruiker
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        try {
            User savedUser = userService.registerUser(user);
            savedUser.setWachtwoord(null);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Laat een gebruiker inloggen en maakt een beveiligde sessie aan
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(
            @Valid @RequestBody be.ehb.backend.dto.LoginRequest loginRequest,
            HttpServletRequest request,
            HttpServletResponse response) {

        try {
            // 1. Vérifier d'abord si l'utilisateur existe et s'il est bloqué
            User userCheck = userService.getUserByEmail(loginRequest.getEmail());
            if (!userCheck.isActief()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Dit account is geblokkeerd door een beheerder.");
            }

            // 2. Si actif, Spring Security procède à l'authentification normale
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getWachtwoord()
                    )
            );

            SecurityContext context =
                    SecurityContextHolder.createEmptyContext();

            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            securityContextRepository.saveContext(context, request, response);

            User user = userService.getUserByEmail(loginRequest.getEmail());
            user.setWachtwoord(null);

            return ResponseEntity.ok(user);

        } catch (Exception e) {
            // Si le compte est bloqué, on renvoie le message spécifique
            if (e.getMessage() != null && e.getMessage().contains("geblokkeerd")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("E-mailadres of wachtwoord is onjuist");
        }
    }

    // Haalt het profiel van de ingelogde gebruiker op
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        try {
            if (authentication == null
                    || !authentication.isAuthenticated()
                    || "anonymousUser".equals(authentication.getName())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Je moet ingelogd zijn");
            }

            User user = userService.getUserByEmail(authentication.getName());
            user.setWachtwoord(null);

            return ResponseEntity.ok(user);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // Wijzigt de naam en het e-mailadres van de ingelogde gebruiker
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, String> gegevens,
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Je moet ingelogd zijn");
        }

        try {
            User user = userService.updateProfile(
                    authentication.getName(),
                    gegevens.get("naam"),
                    gegevens.get("email")
            );

            user.setWachtwoord(null);

            return ResponseEntity.ok(user);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Wijzigt het wachtwoord van de ingelogde gebruiker
    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(
            @RequestBody Map<String, String> gegevens,
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Je moet ingelogd zijn");
        }

        try {
            userService.updatePassword(
                    authentication.getName(),
                    gegevens.get("oudWachtwoord"),
                    gegevens.get("nieuwWachtwoord")
            );

            return ResponseEntity.ok(
                    Map.of("bericht", "Wachtwoord succesvol gewijzigd")
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    // Haalt alle gebruikers op voor het beheerdersdashboard
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Wijzigt de rol van een gebruiker
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> gegevens) {

        try {
            User user = userService.updateUserRole(
                    id,
                    gegevens.get("rol")
            );

            return ResponseEntity.ok(user);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("fout", e.getMessage()));
        }
    }



    @PutMapping("/{id}/block")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> blockUser(@PathVariable Long id) {
        try {
            userService.blokkeerUser(id);
            return ResponseEntity.ok(Map.of("bericht", "Gebruiker is succesvol geblokkeerd."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("fout", e.getMessage()));
        }
    }

    @PutMapping("/{id}/unblock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> unblockUser(@PathVariable Long id) {
        try {
            userService.deblokkeerUser(id);
            return ResponseEntity.ok(Map.of("bericht", "Gebruiker is succesvol gedeblokkeerd."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("fout", e.getMessage()));
        }
    }
}