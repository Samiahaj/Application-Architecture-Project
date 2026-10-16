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
import java.math.BigDecimal;
import java.util.Optional;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

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
        // Maakt een lijst met twee testboeken
        List<Book> boeken = List.of(new Book(), new Book());

        // Geeft de testboeken terug
        when(bookRepository.findAll()).thenReturn(boeken);

        // Haalt alle boeken op
        List<Book> resultaat = bookService.getAllBooks();

        // Controleert of er twee boeken zijn
        assertEquals(2, resultaat.size());
    }
    @Test
    void getAllBooksReturnsEmptyList() {
        // Geeft een lege lijst terug
        when(bookRepository.findAll()).thenReturn(List.of());

        // Haalt alle boeken op
        List<Book> resultaat = bookService.getAllBooks();

        // Controleert of de lijst leeg is
        assertEquals(0, resultaat.size());
    }
    @Test
    void getBookByIdReturnsBookWhenFound() {
        // Maakt een testboek
        Book boek = new Book();
        boek.setId(1L);

        // Geeft het testboek terug voor ID 1
        when(bookRepository.findById(1L)).thenReturn(Optional.of(boek));

        // Haalt het boek op
        Optional<Book> resultaat = bookService.getBookById(1L);

// Controleert of het boek gevonden is
        assertEquals(true, resultaat.isPresent());

// Controleert of het juiste boek wordt teruggegeven
        assertEquals(1L, resultaat.get().getId());
    }
    @Test
    void getBookByIdReturnsEmptyWhenBookNotFound() {
        // Geeft aan dat het boek niet bestaat
        when(bookRepository.findById(999L)).thenReturn(Optional.empty());

        // Zoekt een boek dat niet bestaat
        Optional<Book> resultaat = bookService.getBookById(999L);

        // Controleert of er geen boek gevonden is
        assertEquals(true, resultaat.isEmpty());
    }
    @Test
    void addBookSavesBook() {
        // Maakt een testboek
        Book boek = new Book();
        boek.setTitel("Testboek");

        // Geeft het boek terug wanneer het wordt opgeslagen
        when(bookRepository.save(boek)).thenReturn(boek);

        // Voegt het boek toe
        Book resultaat = bookService.addBook(boek);

        // Controleert of het juiste boek wordt teruggegeven
        assertEquals("Testboek", resultaat.getTitel());
    }
    @Test
    void updateBookUpdatesExistingBook() {
        // Maakt een bestaand boek
        Book bestaandBoek = new Book();
        bestaandBoek.setId(1L);
        bestaandBoek.setTitel("Oude titel");

        // Maakt de nieuwe gegevens
        Book nieuwBoek = new Book();
        nieuwBoek.setTitel("Nieuwe titel");

        // Geeft het bestaande boek terug
        when(bookRepository.findById(1L))
                .thenReturn(Optional.of(bestaandBoek));

        when(bookRepository.save(bestaandBoek))
                .thenReturn(bestaandBoek);

        // Past het boek aan
        Book resultaat = bookService.updateBook(1L, nieuwBoek);

        // Controleert of de titel aangepast is
        assertEquals("Nieuwe titel", resultaat.getTitel());
    }
    @Test
    void deleteBookDeletesExistingBook() {
        // Maakt een bestaand boek
        Book boek = new Book();
        boek.setId(1L);

        // Geeft het boek terug
        when(bookRepository.findById(1L))
                .thenReturn(Optional.of(boek));

        // Verwijdert het boek
        bookService.deleteBook(1L);

        // Controleert of het boek verwijderd werd
        verify(bookRepository).delete(boek);
    }

}