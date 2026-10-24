package be.ehb.backend.controller;
/**
 * REST Controller voor het beheren van reserveringen.
 * Behandelt het aanmaken van reserveringen, het opvragen van gebruikersspecifieke
 * of alle reserveringen, en het bijwerken van de reserveringsstatus.
 */
import be.ehb.backend.model.Reservation;
import be.ehb.backend.model.ReservationStatus;
import be.ehb.backend.model.User;
import be.ehb.backend.repository.UserRepository;
import be.ehb.backend.service.ReservationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;
    private final UserRepository userRepository;

    public ReservationController(
            ReservationService reservationService,
            UserRepository userRepository) {
        this.reservationService = reservationService;
        this.userRepository = userRepository;
    }
    // Haalt alle reservaties op voor de beheerder
    @GetMapping
    public ResponseEntity<?> getAllReservations(
            Authentication authentication) {

        return ResponseEntity.ok(
                reservationService.getAllReservations()
        );
    }
    // Maakt een reservatie aan voor de ingelogde gebruiker
    @PostMapping
    public ResponseEntity<?> createReservation(
            @RequestParam Long bookId,
            Authentication authentication) {

        try {
            User user = userRepository.findByEmail(authentication.getName());

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("fout", "Gebruiker niet gevonden"));
            }

            Reservation reservation =
                    reservationService.createReservation(user.getId(), bookId);

            Map<String, Object> response = Map.of(
                    "id", reservation.getId(),
                    "userId", reservation.getGebruiker().getId(),
                    "bookId", reservation.getBoek().getId(),
                    "reservatieDatum", reservation.getReservatieDatum(),
                    "status", reservation.getStatus()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("fout", e.getMessage()));
        }
    }

    // Haalt de reservaties van de ingelogde gebruiker op
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getReservationsByUser(
            @PathVariable Long userId,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("fout", "Gebruiker niet gevonden"));
        }

        if (!user.getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            return ResponseEntity.ok(
                    reservationService.getReservationsByUser(user.getId())
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("fout", e.getMessage()));
        }
    }

    // Wijzigt de status van een reservatie
    @PutMapping("/{reservationId}/status")
    public ResponseEntity<?> updateReservationStatus(
            @PathVariable Long reservationId,
            @RequestParam ReservationStatus status) {

        try {
            Reservation reservation =
                    reservationService.updateReservationStatus(
                            reservationId, status);

            Map<String, Object> response = Map.of(
                    "id", reservation.getId(),
                    "userId", reservation.getGebruiker().getId(),
                    "bookId", reservation.getBoek().getId(),
                    "reservatieDatum", reservation.getReservatieDatum(),
                    "status", reservation.getStatus()
            );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("fout", e.getMessage()));
        }
    }

    // Haalt de opgehaalde reservaties van de ingelogde gebruiker op
    @GetMapping("/user/{userId}/collected")
    public ResponseEntity<?> getCollectedReservationsByUser(
            @PathVariable Long userId,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        if (!user.getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            return ResponseEntity.ok(
                    reservationService.getCollectedReservationsByUser(user.getId())
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}