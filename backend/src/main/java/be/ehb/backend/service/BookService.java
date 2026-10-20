// Service = businesslogica, controller blijft gescheiden van de databaseverwerking
package be.ehb.backend.service;
import java.util.Optional;
import be.ehb.backend.model.Book;
import be.ehb.backend.repository.BookRepository;
import org.springframework.stereotype.Service;
import be.ehb.backend.model.Author;
import be.ehb.backend.repository.AuthorRepository;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;
//Deze annotatie vertelt aan Spring dat BookService een servicecomponent is die Spring moet beheren.
@Service
public class BookService {
//Boeken uit database afhallen
private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
// Spring levert de benodigde repositories aan de service
public BookService(BookRepository bookRepository, AuthorRepository authorRepository) {
    this.bookRepository = bookRepository;
    this.authorRepository = authorRepository;
}
// alle boeken ophalen
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }
//dient om entiteit in database op te slaan
public Book addBook(Book book) {
    if (bookRepository.existsByIsbn(book.getIsbn())) {
        throw new IllegalArgumentException(
                "Dit ISBN is al in gebruik. Kies een ander ISBN."
        );
    }

    book.setAuteurs(laadAuteurs(book.getAuteurs()));

    try {
        return bookRepository.save(book);
    } catch (DataIntegrityViolationException e) {
        throw new IllegalArgumentException(
                "Dit ISBN is al in gebruik. Kies een ander ISBN."
        );
    }
}
    // Een boek ophalen op basis van het ID
    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }

    // Een bestaand boek aanpassen
    public Book updateBook(Long id, Book updatedBook) {
        Optional<Book> existingBook = bookRepository.findById(id);

        if (existingBook.isEmpty()) {
            return null;
        }

        String isbn = updatedBook.getIsbn();

        if (isbn != null && bookRepository.existsByIsbn(isbn)) {
            boolean isbnUtiliseParUnAutreLivre = bookRepository.findAll().stream()
                    .anyMatch(book ->
                            book.getIsbn().equals(isbn)
                                    && !book.getId().equals(id)
                    );

            if (isbnUtiliseParUnAutreLivre) {
                throw new IllegalArgumentException(
                        "Dit ISBN is al in gebruik. Kies een ander ISBN."
                );
            }
        }

        Book book = existingBook.get();

        book.setIsbn(updatedBook.getIsbn());
        book.setTitel(updatedBook.getTitel());
        book.setOmschrijving(updatedBook.getOmschrijving());
        book.setPrijs(updatedBook.getPrijs());
        book.setVoorraad(updatedBook.getVoorraad());
        book.setAuteurs(laadAuteurs(updatedBook.getAuteurs()));

        return bookRepository.save(book);
    }
    // Een boek verwijderen op basis van het ID
    public boolean deleteBook(Long id) {
        Optional<Book> book = bookRepository.findById(id);

        if (book.isPresent()) {
            bookRepository.delete(book.get());
            return true;
        }

        return false;
    }

    // Voegt een auteur toe aan een boek
    public Book addAuthorToBook(Long bookId, Long authorId) {
        Optional<Book> existingBook = bookRepository.findById(bookId);
        Optional<Author> existingAuthor = authorRepository.findById(authorId);

        if (existingBook.isEmpty() || existingAuthor.isEmpty()) {
            return null;
        }

        Book book = existingBook.get();
        Author author = existingAuthor.get();

        if (!book.getAuteurs().contains(author)) {
            book.getAuteurs().add(author);
        }

        return bookRepository.save(book);
    }
    private List<Author> laadAuteurs(List<Author> auteurs) {
        if (auteurs == null || auteurs.isEmpty()) {
            return new java.util.ArrayList<>();
        }

        return auteurs.stream()
                .map(auteur -> authorRepository.findById(auteur.getId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Auteur niet gevonden: " + auteur.getId()
                                )
                        ))
                .distinct()
                .toList();
    }
}