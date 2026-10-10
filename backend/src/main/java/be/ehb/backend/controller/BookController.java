package be.ehb.backend.controller;

import be.ehb.backend.model.Book;
import be.ehb.backend.service.BookService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}