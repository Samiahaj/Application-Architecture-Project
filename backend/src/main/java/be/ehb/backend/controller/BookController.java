package be.ehb.backend.controller;
/**
 * REST Controller voor het beheren van boeken.
 * Biedt endpoints voor CRUD-operaties, bestandsuploads (boekomslagen)
 * en het koppelen van auteurs aan boeken.
 */
import be.ehb.backend.model.Book;
import be.ehb.backend.service.BookService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public List<Book> getAllBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        Optional<Book> book = bookService.getBookById(id);

        if (book.isPresent()) {
            return ResponseEntity.ok(book.get());
        }

        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> addBook(
            @RequestParam("titel") String titel,
            @RequestParam("isbn") String isbn,
            @RequestParam("omschrijving") String omschrijving,
            @RequestParam("prijs") BigDecimal prijs,
            @RequestParam("voorraad") Integer voorraad,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "auteurIds", required = false) List<Long> auteurIds) {
        try {
            Book book = new Book();
            book.setTitel(titel);
            book.setIsbn(isbn);
            book.setOmschrijving(omschrijving);
            book.setPrijs(prijs);
            book.setVoorraad(voorraad);

            Book newBook = bookService.addBookWithFile(book, imageFile, auteurIds);
            return ResponseEntity.status(HttpStatus.CREATED).body(newBook);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    java.util.Map.of("message", e.getMessage())
            );
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBook(
            @PathVariable Long id,
            @RequestParam("titel") String titel,
            @RequestParam("isbn") String isbn,
            @RequestParam("omschrijving") String omschrijving,
            @RequestParam("prijs") BigDecimal prijs,
            @RequestParam("voorraad") Integer voorraad,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "auteurIds", required = false) List<Long> auteurIds) {
        try {
            Book bookDetails = new Book();
            bookDetails.setTitel(titel);
            bookDetails.setIsbn(isbn);
            bookDetails.setOmschrijving(omschrijving);
            bookDetails.setPrijs(prijs);
            bookDetails.setVoorraad(voorraad);

            Book updatedBook = bookService.updateBookWithFile(id, bookDetails, imageFile, auteurIds);

            if (updatedBook == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(updatedBook);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    java.util.Map.of("message", e.getMessage())
            );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        boolean deleted = bookService.deleteBook(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

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