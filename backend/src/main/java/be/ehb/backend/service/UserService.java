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
}