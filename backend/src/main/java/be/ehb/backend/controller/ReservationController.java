package be.ehb.backend.controller;

import be.ehb.backend.model.Reservation;
import be.ehb.backend.service.ReservationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import be.ehb.backend.model.ReservationStatus;


import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    // Maakt een reservatie aan
    @PostMapping
    public ResponseEntity<?> createReservation(
            @RequestParam Long userId,
            @RequestParam Long bookId) {
        try {
            Reservation reservation =
                    reservationService.createReservation(userId, bookId);

            // Geeft alleen de nodige informatie terug
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
    // Haalt alle reservaties van een gebruiker op
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getReservationsByUser(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(
                    reservationService.getReservationsByUser(userId)
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

            // Geeft de bijgewerkte reservatiegegevens terug
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
}