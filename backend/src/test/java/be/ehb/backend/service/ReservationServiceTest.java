package be.ehb.backend.service;

import be.ehb.backend.model.Book;
import be.ehb.backend.model.Reservation;
import be.ehb.backend.model.User;
import be.ehb.backend.repository.BookRepository;
import be.ehb.backend.repository.ReservationRepository;
import be.ehb.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import be.ehb.backend.model.ReservationStatus;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReservationService reservationService;

    private User user;
    private Book book;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);

        book = new Book();
        book.setId(1L);
        book.setTitel("Testboek");
        book.setPrijs(new BigDecimal("20.00"));
        book.setVoorraad(5);
    }

    @Test
    void createReservation_whenUserAndBookExist_returnsReservation() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));

        Reservation reservation = new Reservation();
        reservation.setId(1L);
        when(reservationRepository.save(any(Reservation.class)))
                .thenAnswer(invocation -> {
                    Reservation saved = invocation.getArgument(0);
                    saved.setId(1L);
                    return saved;
                });

        Reservation result = reservationService.createReservation(1L, 1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(user, result.getGebruiker());
        assertEquals(book, result.getBoek());
        assertNotNull(result.getReservatieDatum());
        verify(reservationRepository).save(any(Reservation.class));
    }

    @Test
    void createReservation_whenUserDoesNotExist_throwsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> reservationService.createReservation(99L, 1L));

        verify(reservationRepository, never()).save(any());
    }

    @Test
    void createReservation_whenBookDoesNotExist_throwsException() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> reservationService.createReservation(1L, 99L));

        verify(reservationRepository, never()).save(any());
    }

    @Test
    void createReservation_whenStockIsEmpty_throwsException() {
        book.setVoorraad(0);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));

        assertThrows(IllegalArgumentException.class,
                () -> reservationService.createReservation(1L, 1L));

        verify(reservationRepository, never()).save(any());
    }
    @Test
    void updateReservationStatus_whenReservationExists_updatesStatus() {
        Reservation reservation = new Reservation();
        reservation.setId(1L);
        reservation.setStatus(ReservationStatus.PENDING);

        when(reservationRepository.findById(1L))
                .thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any(Reservation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Reservation result = reservationService.updateReservationStatus(
                1L, ReservationStatus.READY);

        assertEquals(ReservationStatus.READY, result.getStatus());
        verify(reservationRepository).save(reservation);
    }

    @Test
    void updateReservationStatus_whenReservationDoesNotExist_throwsException() {
        when(reservationRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> reservationService.updateReservationStatus(
                        99L, ReservationStatus.READY));

        verify(reservationRepository, never()).save(any(Reservation.class));
    }
}