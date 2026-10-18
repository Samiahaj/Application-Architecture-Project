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
import java.util.Optional;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import java.math.BigDecimal;


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
    @Test
    void updateReservationStatus_whenReservationIsCancelled_throwsException() {
        Reservation reservation = new Reservation();
        reservation.setId(1L);
        reservation.setStatus(ReservationStatus.CANCELLED);

        when(reservationRepository.findById(1L))
                .thenReturn(Optional.of(reservation));

        assertThrows(IllegalArgumentException.class,
                () -> reservationService.updateReservationStatus(
                        1L, ReservationStatus.READY));

        verify(reservationRepository, never()).save(any(Reservation.class));
    }

    @Test
    void updateReservationStatus_whenReservationIsCollected_throwsException() {
        Reservation reservation = new Reservation();
        reservation.setId(1L);
        reservation.setStatus(ReservationStatus.COLLECTED);

        when(reservationRepository.findById(1L))
                .thenReturn(Optional.of(reservation));

        assertThrows(IllegalArgumentException.class,
                () -> reservationService.updateReservationStatus(
                        1L, ReservationStatus.CANCELLED));

        verify(reservationRepository, never()).save(any(Reservation.class));
    }
    @Test
    void createReservation_decreasesBookStock() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(reservationRepository.save(any(Reservation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        int initialStock = book.getVoorraad();

        reservationService.createReservation(1L, 1L);

        assertEquals(initialStock - 1, book.getVoorraad());
        verify(bookRepository).save(book);
    }

    @Test
    void updateReservationStatus_whenCancelled_restoresBookStock() {
        book.setVoorraad(4);

        Reservation reservation = new Reservation();
        reservation.setId(1L);
        reservation.setGebruiker(user);
        reservation.setBoek(book);
        reservation.setStatus(ReservationStatus.READY);

        when(reservationRepository.findById(1L))
                .thenReturn(Optional.of(reservation));
        when(bookRepository.save(any(Book.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(reservationRepository.save(any(Reservation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        reservationService.updateReservationStatus(
                1L, ReservationStatus.CANCELLED);

        assertEquals(5, book.getVoorraad());
        verify(bookRepository).save(book);
    }

    @Test
    void getCollectedReservationsByUser_returnsOnlyCollectedReservations() {
        when(userRepository.existsById(1L)).thenReturn(true);

        Reservation reservation = new Reservation();
        reservation.setId(1L);
        reservation.setGebruiker(user);
        reservation.setBoek(book);
        reservation.setStatus(ReservationStatus.COLLECTED);

        when(reservationRepository.findByGebruikerIdAndStatus(
                1L, ReservationStatus.COLLECTED))
                .thenReturn(List.of(reservation));

        List<Reservation> result =
                reservationService.getCollectedReservationsByUser(1L);

        assertEquals(1, result.size());
        assertEquals(ReservationStatus.COLLECTED, result.get(0).getStatus());

        verify(reservationRepository).findByGebruikerIdAndStatus(
                1L, ReservationStatus.COLLECTED);
    }
}