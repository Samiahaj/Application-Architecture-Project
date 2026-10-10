// Service = businesslogica, controller blijft gescheiden van de databaseverwerking
package be.ehb.backend.service;

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
}