package be.ehb.backend.service;

import be.ehb.backend.model.User;
import be.ehb.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Registreert een nieuwe gebruiker
    public User registerUser(User user) {

        // Controleert of het e-mailadres al bestaat
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Dit e-mailadres is al in gebruik");
        }

        // Versleutelt het wachtwoord voor het opslaan
        user.setWachtwoord(passwordEncoder.encode(user.getWachtwoord()));

        return userRepository.save(user);
    }
    // Controleert de gegevens van een gebruiker bij het inloggen
    public User loginUser(String email, String wachtwoord) {

        // Zoekt de gebruiker op basis van het e-mailadres
        User user = userRepository.findByEmail(email);

        // Controleert of de gebruiker bestaat en het wachtwoord klopt
        if (user == null || !passwordEncoder.matches(wachtwoord, user.getWachtwoord())) {
            throw new IllegalArgumentException("E-mailadres of wachtwoord is onjuist");
        }

        return user;
    }

    // Haalt een gebruiker op via het e-mailadres
    public User getUserByEmail(String email) {
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new IllegalArgumentException("Gebruiker niet gevonden");
        }

        return user;
    }
}