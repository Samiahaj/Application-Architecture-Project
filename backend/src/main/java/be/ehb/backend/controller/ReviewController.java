package be.ehb.backend.controller;

import be.ehb.backend.model.Review;
import be.ehb.backend.service.ReviewService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@Validated
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // Maakt een beoordeling voor een opgehaald boek
    @PostMapping
    public ResponseEntity<?> createReview(
            @RequestParam Long userId,
            @RequestParam Long bookId,
            @RequestParam @NotNull @Min(1) @Max(5) Integer score,
            @RequestParam @NotBlank @Size(max = 1000) String tekst) {
        try {
            Review review = reviewService.createReview(
                    userId, bookId, score, tekst);

            return ResponseEntity.status(HttpStatus.CREATED).body(review);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Haalt alle beoordelingen van een boek op
    @GetMapping("/book/{bookId}")
    public ResponseEntity<?> getReviewsByBook(@PathVariable Long bookId) {
        try {
            List<Review> reviews = reviewService.getReviewsByBook(bookId);
            return ResponseEntity.ok(reviews);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}