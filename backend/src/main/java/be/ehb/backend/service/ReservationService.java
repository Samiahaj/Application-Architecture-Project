package be.ehb.backend.service;

import be.ehb.backend.model.Book;
import be.ehb.backend.model.Reservation;
import be.ehb.backend.model.ReservationStatus;
import be.ehb.backend.model.User;
import be.ehb.backend.repository.BookRepository;
import be.ehb.backend.repository.ReservationRepository;
import be.ehb.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;


import java.time.LocalDateTime;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public ReservationService(
            ReservationRepository reservationRepository,
            BookRepository bookRepository,
            UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    // Maakt een reservatie voor een gebruiker
    @Transactional
    public Reservation createReservation(Long userId, Long bookId) {

        // Controleert of de gebruiker bestaat
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Gebruiker niet gevonden"));

        // Controleert of het boek bestaat
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Boek niet gevonden"));

        // Controleert of er nog boeken beschikbaar zijn
        if (book.getVoorraad() == null || book.getVoorraad() <= 0) {
            throw new IllegalArgumentException("Geen voorraad beschikbaar");
        }

        Reservation reservation = new Reservation();
        reservation.setGebruiker(user);
        reservation.setBoek(book);
        reservation.setReservatieDatum(LocalDateTime.now());
        reservation.setStatus(ReservationStatus.PENDING);

        return reservationRepository.save(reservation);
    }

    // Haalt alle reservaties van een gebruiker op
    public List<Reservation> getReservationsByUser(Long userId) {
        // Controleert of de gebruiker bestaat
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("Gebruiker niet gevonden");
        }

        return reservationRepository.findByGebruikerId(userId);
    }

    // Wijzigt de status van een reservatie
    public Reservation updateReservationStatus(Long reservationId,
                                               ReservationStatus newStatus) {
        // Zoekt de reservatie op
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Reservatie niet gevonden"));

        // Wijzigt de status
        reservation.setStatus(newStatus);

        return reservationRepository.save(reservation);
    }
}