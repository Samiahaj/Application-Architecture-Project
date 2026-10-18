package be.ehb.backend.service;

import be.ehb.backend.model.*;
import be.ehb.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private ReviewService reviewService;

    private User user;
    private Book book;
    private Reservation reservation;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);

        book = new Book();
        book.setId(1L);
        book.setTitel("Testboek");

        reservation = new Reservation();
        reservation.setId(1L);
        reservation.setGebruiker(user);
        reservation.setBoek(book);
        reservation.setStatus(ReservationStatus.COLLECTED);
    }

    @Test
    void createReview_whenBookCollected_savesReview() {
        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));
        when(bookRepository.findById(1L))
                .thenReturn(Optional.of(book));
        when(reservationRepository.findByGebruikerIdAndStatus(
                1L, ReservationStatus.COLLECTED))
                .thenReturn(List.of(reservation));
        when(reviewRepository.existsByGebruikerIdAndBoekId(1L, 1L))
                .thenReturn(false);
        when(reviewRepository.save(any(Review.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Review result = reviewService.createReview(
                1L, 1L, 5, "Zeer goed boek");

        assertEquals(5, result.getScore());
        assertEquals("Zeer goed boek", result.getTekst());
        assertEquals(user, result.getGebruiker());
        assertEquals(book, result.getBoek());

        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    void createReview_whenBookNotCollected_throwsException() {
        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));
        when(bookRepository.findById(1L))
                .thenReturn(Optional.of(book));
        when(reservationRepository.findByGebruikerIdAndStatus(
                1L, ReservationStatus.COLLECTED))
                .thenReturn(List.of());

        assertThrows(IllegalArgumentException.class, () ->
                reviewService.createReview(
                        1L, 1L, 5, "Zeer goed boek"));

        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    void createReview_whenReviewAlreadyExists_throwsException() {
        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));
        when(bookRepository.findById(1L))
                .thenReturn(Optional.of(book));
        when(reservationRepository.findByGebruikerIdAndStatus(
                1L, ReservationStatus.COLLECTED))
                .thenReturn(List.of(reservation));
        when(reviewRepository.existsByGebruikerIdAndBoekId(1L, 1L))
                .thenReturn(true);

        assertThrows(IllegalArgumentException.class, () ->
                reviewService.createReview(
                        1L, 1L, 5, "Zeer goed boek"));

        verify(reviewRepository, never()).save(any(Review.class));
    }
}