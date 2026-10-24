package be.ehb.backend.service;
/**
 * Service-laag voor het beheren van recensies en beoordelingen.
 * Bevat de bedrijfslogica voor het valideren en aanmaken van reviews (inclusief controle op opgehaalde boeken),
 * het opvragen van reviews, en het opslaan van beheerdersantwoorden.
 */
import be.ehb.backend.model.Book;
import be.ehb.backend.model.Reservation;
import be.ehb.backend.model.ReservationStatus;
import be.ehb.backend.model.Review;
import be.ehb.backend.model.User;
import be.ehb.backend.repository.BookRepository;
import be.ehb.backend.repository.ReservationRepository;
import be.ehb.backend.repository.ReviewRepository;
import be.ehb.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final ReservationRepository reservationRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            UserRepository userRepository,
            BookRepository bookRepository,
            ReservationRepository reservationRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.reservationRepository = reservationRepository;
    }

    // Maakt een beoordeling voor een opgehaald boek
    @Transactional
    public Review createReview(Long userId, Long bookId, Integer score, String tekst) {

        // Controleert of de gebruiker bestaat
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Gebruiker niet gevonden"));

        // Controleert of het boek bestaat
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Boek niet gevonden"));

        // Controleert of de gebruiker het boek heeft opgehaald
        List<Reservation> reservations =
                reservationRepository.findByGebruikerIdAndStatus(
                        userId, ReservationStatus.COLLECTED);

        boolean bookCollected = reservations.stream()
                .anyMatch(reservation ->
                        reservation.getBoek().getId().equals(bookId));

        if (!bookCollected) {
            throw new IllegalArgumentException(
                    "Je kunt alleen een beoordeling schrijven voor een opgehaald boek");
        }

        // Controleert of de gebruiker al een beoordeling heeft geschreven
        if (reviewRepository.existsByGebruikerIdAndBoekId(userId, bookId)) {
            throw new IllegalArgumentException(
                    "Je hebt dit boek al beoordeeld");
        }

        // Controleert of de score geldig is
        if (score == null || score < 1 || score > 5) {
            throw new IllegalArgumentException(
                    "De score moet tussen 1 en 5 liggen");
        }

        // Controleert of de beoordelingstekst geldig is
        if (tekst == null || tekst.isBlank() || tekst.length() > 1000) {
            throw new IllegalArgumentException(
                    "De beoordeling moet tekst bevatten van maximaal 1000 tekens");
        }

        // Slaat de beoordeling op
        Review review = new Review();
        review.setGebruiker(user);
        review.setBoek(book);
        review.setScore(score);
        review.setTekst(tekst);

        return reviewRepository.save(review);
    }
    // Haalt alle beoordelingen op
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }
    // Slaat het antwoord van de beheerder op
    @Transactional
    public Review antwoordOpReview(Long reviewId, String antwoord) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Beoordeling niet gevonden"));

        if (antwoord == null || antwoord.isBlank() || antwoord.length() > 1000) {
            throw new IllegalArgumentException(
                    "Het antwoord moet tekst bevatten van maximaal 1000 tekens");
        }

        review.setAntwoord(antwoord.trim());

        return reviewRepository.save(review);
    }

    // Haalt alle beoordelingen van een boek op
    public List<Review> getReviewsByBook(Long bookId) {

        // Controleert of het boek bestaat
        if (!bookRepository.existsById(bookId)) {
            throw new IllegalArgumentException("Boek niet gevonden");
        }

        return reviewRepository.findByBoekId(bookId);
    }
}