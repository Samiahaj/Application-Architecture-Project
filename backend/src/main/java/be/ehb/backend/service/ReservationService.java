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
        // Vermindert de voorraad bij een reservatie
        book.setVoorraad(book.getVoorraad() - 1);
        bookRepository.save(book);

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
    // Haalt alle opgehaalde reservaties van een gebruiker op
    public List<Reservation> getCollectedReservationsByUser(Long userId) {

        // Controleert of de gebruiker bestaat
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("Gebruiker niet gevonden");
        }

        // Haalt alleen de opgehaalde reservaties op
        return reservationRepository.findByGebruikerIdAndStatus(
                userId,
                ReservationStatus.COLLECTED
        );
    }
    // Wijzigt de status van een reservatie
    @Transactional
    public Reservation updateReservationStatus(
            Long reservationId,
            ReservationStatus newStatus) {

        // Zoekt de reservatie op
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Reservatie niet gevonden"));

        ReservationStatus currentStatus = reservation.getStatus();

        // Controleert of de status gewijzigd mag worden
        boolean validTransition =
                (currentStatus == ReservationStatus.PENDING
                        && (newStatus == ReservationStatus.READY
                        || newStatus == ReservationStatus.CANCELLED))
                        || (currentStatus == ReservationStatus.READY
                        && (newStatus == ReservationStatus.COLLECTED
                        || newStatus == ReservationStatus.CANCELLED));

        if (!validTransition) {
            throw new IllegalArgumentException(
                    "Ongeldige statusovergang: "
                            + currentStatus + " naar " + newStatus);
        }

        // Herstelt de voorraad wanneer een reservatie wordt geannuleerd
        if (newStatus == ReservationStatus.CANCELLED) {
            Book book = reservation.getBoek();
            book.setVoorraad(book.getVoorraad() + 1);
            bookRepository.save(book);
        }

// Slaat de nieuwe status op
        reservation.setStatus(newStatus);

        return reservationRepository.save(reservation);
    }
}