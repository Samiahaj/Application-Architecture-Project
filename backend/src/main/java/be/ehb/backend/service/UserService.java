package be.ehb.backend.service;

import be.ehb.backend.model.User;
import be.ehb.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Registreert een nieuwe gebruiker
    public User registerUser(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException(
                    "Dit e-mailadres is al in gebruik");
        }

        user.setRol("USER");
        user.setWachtwoord(
                passwordEncoder.encode(user.getWachtwoord()));

        return userRepository.save(user);
    }

    // Controleert de gegevens bij het inloggen
    public User loginUser(String email, String wachtwoord) {

        User user = userRepository.findByEmail(email);

        if (user == null
                || !passwordEncoder.matches(
                wachtwoord, user.getWachtwoord())) {
            throw new IllegalArgumentException(
                    "E-mailadres of wachtwoord is onjuist");
        }

        return user;
    }

    // Haalt een gebruiker op via het e-mailadres
    public User getUserByEmail(String email) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new IllegalArgumentException(
                    "Gebruiker niet gevonden");
        }

        return user;
    }

    // Haalt alle gebruikers op
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Wijzigt de naam en het e-mailadres
    @Transactional
    public User updateProfile(
            String currentEmail,
            String naam,
            String email) {

        User user = getUserByEmail(currentEmail);

        if (naam == null || naam.isBlank()) {
            throw new IllegalArgumentException(
                    "Naam mag niet leeg zijn");
        }

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "E-mailadres mag niet leeg zijn");
        }

        String nieuwEmail = email.trim();

        User existingUser = userRepository.findByEmail(nieuwEmail);

        if (existingUser != null
                && !existingUser.getId().equals(user.getId())) {
            throw new IllegalArgumentException(
                    "Dit e-mailadres is al in gebruik");
        }

        user.setNaam(naam.trim());
        user.setEmail(nieuwEmail);

        return userRepository.save(user);
    }

    // Wijzigt het wachtwoord
    @Transactional
    public void updatePassword(
            String currentEmail,
            String oldPassword,
            String newPassword) {

        User user = getUserByEmail(currentEmail);

        if (oldPassword == null
                || !passwordEncoder.matches(
                oldPassword, user.getWachtwoord())) {
            throw new IllegalArgumentException(
                    "Het huidige wachtwoord is onjuist");
        }

        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException(
                    "Nieuw wachtwoord mag niet leeg zijn");
        }

        if (newPassword.length() < 8) {
            throw new IllegalArgumentException(
                    "Nieuw wachtwoord moet minstens 8 tekens bevatten");
        }

        user.setWachtwoord(passwordEncoder.encode(newPassword));

        userRepository.save(user);
    }

    // Wijzigt de rol van een gebruiker
    @Transactional
    public User updateUserRole(Long userId, String rol) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Gebruiker niet gevonden"));

        if (rol == null
                || (!rol.equals("USER") && !rol.equals("ADMIN"))) {
            throw new IllegalArgumentException(
                    "Ongeldige rol. Kies USER of ADMIN.");
        }

        user.setRol(rol);

        return userRepository.save(user);
    }

    // Verwijdert een gebruiker
    @Transactional
    public void deleteUser(Long userId, String currentEmail) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Gebruiker niet gevonden"));

        if (user.getEmail().equalsIgnoreCase(currentEmail)) {
            throw new IllegalArgumentException(
                    "Je kunt je eigen account niet verwijderen");
        }

        userRepository.delete(user);
    }
}