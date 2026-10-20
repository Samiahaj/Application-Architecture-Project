// De Controller ontvangt HTTP-aanvragen, roept de juiste methode van de Service aan en stuurt een antwoord terug naar de gebruiker.
package be.ehb.backend.controller;

import be.ehb.backend.model.Book;
import be.ehb.backend.service.BookService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;
import java.util.Optional;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.http.HttpStatus;

import java.util.List;
// Vertelt aan Spring dat deze klasse HTTP-aanvragen behandelt en resultaten terugstuurt
@RestController
//Bepaalt het basispad van deze Controller.
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public List<Book> getAllBooks() {
        //De Controller vraagt de Service om alle boeken op te halen. De Service gebruikt daarvoor de Repository.
        return bookService.getAllBooks();
    }
    // Een boek ophalen op basis van het ID
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        Optional<Book> book = bookService.getBookById(id);

        if (book.isPresent()) {
            return ResponseEntity.ok(book.get());
        }

        return ResponseEntity.notFound().build();
    }
    @PostMapping
    public ResponseEntity<?> addBook(@Valid @RequestBody Book book) {
        try {
            Book newBook = bookService.addBook(book);
            return ResponseEntity.status(HttpStatus.CREATED).body(newBook);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    java.util.Map.of("message", e.getMessage())
            );
        }
    }
    // Een bestaand boek aanpassen
    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody Book book) {

        Book updatedBook = bookService.updateBook(id, book);

        if (updatedBook == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedBook);
    }
    // Een boek verwijderen
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        boolean deleted = bookService.deleteBook(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    // Voegt een auteur toe aan een boek
    @PostMapping("/{bookId}/authors/{authorId}")
    public ResponseEntity<Book> addAuthorToBook(
            @PathVariable Long bookId,
            @PathVariable Long authorId) {

        Book book = bookService.addAuthorToBook(bookId, authorId);

        if (book == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(book);
    }
}