package be.ehb.backend.service;

import be.ehb.backend.model.Book;
import be.ehb.backend.repository.BookRepository;
import be.ehb.backend.repository.AuthorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    @Mock
    private BookRepository bookRepository;

    @Mock
    private AuthorRepository authorRepository;

    @InjectMocks
    private BookService bookService;

    @Test
    void getAllBooksReturnsBooks() {
        List<Book> boeken = List.of(new Book(), new Book());
        when(bookRepository.findAll()).thenReturn(boeken);

        List<Book> resultaat = bookService.getAllBooks();

        assertEquals(2, resultaat.size());
    }

    @Test
    void getAllBooksReturnsEmptyList() {
        when(bookRepository.findAll()).thenReturn(List.of());

        List<Book> resultaat = bookService.getAllBooks();

        assertEquals(0, resultaat.size());
    }

    @Test
    void getBookByIdReturnsBookWhenFound() {
        Book boek = new Book();
        boek.setId(1L);

        when(bookRepository.findById(1L)).thenReturn(Optional.of(boek));

        Optional<Book> resultaat = bookService.getBookById(1L);

        assertTrue(resultaat.isPresent());
        assertEquals(1L, resultaat.get().getId());
    }

    @Test
    void getBookByIdReturnsEmptyWhenBookNotFound() {
        when(bookRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Book> resultaat = bookService.getBookById(999L);

        assertTrue(resultaat.isEmpty());
    }

    @Test
    void addBookWithFileSavesBook() {
        Book boek = new Book();
        boek.setTitel("Testboek");

        when(bookRepository.save(any(Book.class))).thenReturn(boek);

        // Test de methode met null voor afbeelding en auteurs (indien niet verplicht)
        Book resultaat = bookService.addBookWithFile(boek, null, null);

        assertEquals("Testboek", resultaat.getTitel());
        verify(bookRepository).save(boek);
    }

    @Test
    void updateBookWithFileUpdatesExistingBook() {
        Book bestaandBoek = new Book();
        bestaandBoek.setId(1L);
        bestaandBoek.setTitel("Oude titel");

        Book nieuwBoekDetails = new Book();
        nieuwBoekDetails.setTitel("Nieuwe titel");

        when(bookRepository.findById(1L)).thenReturn(Optional.of(bestaandBoek));
        when(bookRepository.save(any(Book.class))).thenReturn(bestaandBoek);

        Book resultaat = bookService.updateBookWithFile(1L, nieuwBoekDetails, null, null);

        assertEquals("Nieuwe titel", resultaat.getTitel());
        verify(bookRepository).save(bestaandBoek);
    }

    @Test
    void deleteBookDeletesExistingBook() {
        when(bookRepository.existsById(1L)).thenReturn(true);
        doNothing().when(bookRepository).deleteById(1L);

        boolean resultaat = bookService.deleteBook(1L);

        assertTrue(resultaat);
        verify(bookRepository).existsById(1L);
        verify(bookRepository).deleteById(1L);
    }
}