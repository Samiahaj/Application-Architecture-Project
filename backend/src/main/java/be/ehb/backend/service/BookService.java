// Service = businesslogica, controller blijft gescheiden van de databaseverwerking
package be.ehb.backend.service;
import java.util.Optional;
import be.ehb.backend.model.Book;
import be.ehb.backend.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.List;
//Deze annotatie vertelt aan Spring dat BookService een servicecomponent is die Spring moet beheren.
@Service
public class BookService {
//Boeken uit database afhallen
    private final BookRepository bookRepository;
//spring levert benodigde bookrepository aan de service
    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }
// alle boeken ophalen
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }
//dient om entiteit in database op te slaan
    public Book addBook(Book book) {
        return bookRepository.save(book);
    }
    // Een boek ophalen op basis van het ID
    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }

    // Een bestaand boek aanpassen
    public Book updateBook(Long id, Book updatedBook) {
        Optional<Book> existingBook = bookRepository.findById(id);

        if (existingBook.isPresent()) {
            Book book = existingBook.get();

            book.setIsbn(updatedBook.getIsbn());
            book.setTitel(updatedBook.getTitel());
            book.setOmschrijving(updatedBook.getOmschrijving());
            book.setPrijs(updatedBook.getPrijs());
            book.setVoorraad(updatedBook.getVoorraad());

            return bookRepository.save(book);
        }

        return null;
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
}