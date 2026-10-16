package be.ehb.backend.controller;

import be.ehb.backend.model.User;
import be.ehb.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Registreert een nieuwe gebruiker
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        try {
            User savedUser = userService.registerUser(user);

            // Geeft de aangemaakte gebruiker terug
            savedUser.setWachtwoord(null);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}