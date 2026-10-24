package be.ehb.backend.controller;
/**
 * REST Controller voor het beheren van recensies en beoordelingen.
 * Biedt endpoints voor het indienen van reviews, opvragen per boek of overzicht,
 * en het beantwoorden van reviews door beheerders.
 */
import be.ehb.backend.model.Review;
import be.ehb.backend.model.User;
import be.ehb.backend.repository.UserRepository;
import be.ehb.backend.service.ReviewService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@Validated
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    public ReviewController(
            ReviewService reviewService,
            UserRepository userRepository) {
        this.reviewService = reviewService;
        this.userRepository = userRepository;
    }
    // Haalt alle beoordelingen op voor de beheerder
    @GetMapping
    public ResponseEntity<?> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }
    // Beantwoordt een beoordeling (alleen voor beheerders)
    @PutMapping("/{reviewId}/answer")
    public ResponseEntity<?> answerReview(
            @PathVariable Long reviewId,
            @RequestBody Map<String, String> body) {

        try {
            String antwoord = body.get("antwoord");

            Review review = reviewService.antwoordOpReview(reviewId, antwoord);

            return ResponseEntity.ok(review);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("fout", e.getMessage()));
        }
    }
    // Maakt een beoordeling voor een opgehaald boek
    @PostMapping
    public ResponseEntity<?> createReview(
            @RequestParam Long bookId,
            @RequestParam @NotNull @Min(1) @Max(5) Integer score,
            @RequestParam @NotBlank @Size(max = 1000) String tekst,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("fout", "Gebruiker niet gevonden"));
        }

        try {
            Review review = reviewService.createReview(
                    user.getId(), bookId, score, tekst);

            return ResponseEntity.status(HttpStatus.CREATED).body(review);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Haalt alle beoordelingen van een boek op
    @GetMapping("/book/{bookId}")
    public ResponseEntity<?> getReviewsByBook(
            @PathVariable Long bookId) {
        try {
            List<Review> reviews =
                    reviewService.getReviewsByBook(bookId);

            return ResponseEntity.ok(reviews);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}