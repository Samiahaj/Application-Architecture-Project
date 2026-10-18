package be.ehb.backend.service;

import be.ehb.backend.model.User;
import be.ehb.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void registerUserSavesUserWithEncodedPassword() {
        User user = new User();
        user.setNaam("Test Gebruiker");
        user.setEmail("test@example.com");
        user.setWachtwoord("veilig123");

        when(userRepository.existsByEmail("test@example.com"))
                .thenReturn(false);
        when(passwordEncoder.encode("veilig123"))
                .thenReturn("hashedPassword");
        when(userRepository.save(user)).thenReturn(user);

        User result = userService.registerUser(user);

        assertEquals("hashedPassword", result.getWachtwoord());
        verify(userRepository).save(user);
    }

    @Test
    void registerUserRejectsDuplicateEmail() {
        User user = new User();
        user.setNaam("Test Gebruiker");
        user.setEmail("test@example.com");
        user.setWachtwoord("veilig123");

        when(userRepository.existsByEmail("test@example.com"))
                .thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> userService.registerUser(user));

        verify(userRepository, never()).save(any(User.class));
    }
    @Test
    void registerUserAlwaysAssignsUserRole() {
        User user = new User();
        user.setNaam("Test Gebruiker");
        user.setEmail("test@example.com");
        user.setWachtwoord("veilig123");
        user.setRol("ADMIN");

        when(userRepository.existsByEmail("test@example.com"))
                .thenReturn(false);
        when(passwordEncoder.encode("veilig123"))
                .thenReturn("hashedPassword");
        when(userRepository.save(user)).thenReturn(user);

        User result = userService.registerUser(user);

        assertEquals("USER", result.getRol());
        verify(userRepository).save(user);
    }
}