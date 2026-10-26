package be.ehb.backend.service;
/**
 * Service-laag voor het beheren van boeken.
 * Bevat de bedrijfslogica voor CRUD-operaties, het opslaan en verwerken van boekomslagen (bestandsuploads),
 * en het koppelen van auteurs aan boeken.
 */
import be.ehb.backend.model.Author;
import be.ehb.backend.model.Book;
import be.ehb.backend.repository.AuthorRepository;
import be.ehb.backend.repository.BookRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;


    private final String UPLOAD_DIR = "uploads/";

    public BookService(BookRepository bookRepository, AuthorRepository authorRepository) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }

    public Book addBookWithFile(Book book, MultipartFile imageFile, List<Long> authorIds) {
        handleImageUpload(book, imageFile);
        handleAuthors(book, authorIds);
        return bookRepository.save(book);
    }

    public Book updateBookWithFile(Long id, Book bookDetails, MultipartFile imageFile, List<Long> authorIds) {
        Optional<Book> optionalBook = bookRepository.findById(id);
        if (optionalBook.isEmpty()) {
            return null;
        }

        Book book = optionalBook.get();
        book.setTitel(bookDetails.getTitel());
        book.setIsbn(bookDetails.getIsbn());
        book.setOmschrijving(bookDetails.getOmschrijving());

        book.setGenres(bookDetails.getGenres());

        book.setPrijs(bookDetails.getPrijs());
        book.setVoorraad(bookDetails.getVoorraad());


        if (imageFile != null && !imageFile.isEmpty()) {
            handleImageUpload(book, imageFile);
        }

        handleAuthors(book, authorIds);
        return bookRepository.save(book);
    }

    public boolean deleteBook(Long id) {
        if (bookRepository.existsById(id)) {
            bookRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Book addAuthorToBook(Long bookId, Long authorId) {
        Optional<Book> bookOpt = bookRepository.findById(bookId);
        Optional<Author> authorOpt = authorRepository.findById(authorId);

        if (bookOpt.isPresent() && authorOpt.isPresent()) {
            Book book = bookOpt.get();
            Author author = authorOpt.get();
            if (!book.getAuteurs().contains(author)) {
                book.getAuteurs().add(author);
                return bookRepository.save(book);
            }
            return book;
        }
        return null;
    }


    private void handleImageUpload(Book book, MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }


                String fileName = UUID.randomUUID().toString() + "_" + imageFile.getOriginalFilename();
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);


                book.setImageUrl("http://localhost:8080/uploads/" + fileName);
            } catch (IOException e) {
                throw new RuntimeException("Fout bij het opslaan van de afbeelding: " + e.getMessage());
            }
        }
    }


    private void handleAuthors(Book book, List<Long> authorIds) {
        if (authorIds != null) {
            List<Author> auteurs = authorRepository.findAllById(authorIds);
            book.getAuteurs().clear();
            book.getAuteurs().addAll(auteurs);
        }
    }
}