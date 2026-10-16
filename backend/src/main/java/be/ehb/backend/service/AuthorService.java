// Beheert de logica voor auteurs
package be.ehb.backend.service;

import be.ehb.backend.model.Author;
import be.ehb.backend.repository.AuthorRepository;
import org.springframework.stereotype.Service;
import be.ehb.backend.model.Book;
import org.springframework.transaction.annotation.Transactional;
import be.ehb.backend.repository.BookRepository;

import java.util.List;
import java.util.Optional;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;
    private final BookRepository bookRepository;

    // Spring levert de benodigde repository aan de service
    public AuthorService(AuthorRepository authorRepository, BookRepository bookRepository) {
        this.authorRepository = authorRepository;
        this.bookRepository = bookRepository;
    }

    // Haalt alle auteurs op
    public List<Author> getAllAuthors() {
        return authorRepository.findAll();
    }

    // Zoekt een auteur op basis van het ID
    public Optional<Author> getAuthorById(Long id) {
        return authorRepository.findById(id);
    }

    // Slaat een auteur op in de database
    public Author addAuthor(Author author) {
        return authorRepository.save(author);
    }

    // Past een bestaande auteur aan
    public Author updateAuthor(Long id, Author updatedAuthor) {
        Optional<Author> existingAuthor = authorRepository.findById(id);

        if (existingAuthor.isPresent()) {
            Author author = existingAuthor.get();
            author.setNaam(updatedAuthor.getNaam());

            return authorRepository.save(author);
        }

        return null;
    }

    // Verwijdert een auteur op basis van het ID
    @Transactional
    public boolean deleteAuthor(Long id) {
        Optional<Author> existingAuthor = authorRepository.findById(id);

        if (existingAuthor.isEmpty()) {
            return false;
        }

        Author author = existingAuthor.get();

        // Verwijdert eerst de auteur uit alle boeken
        for (Book book : author.getBoeken()) {
            book.getAuteurs().removeIf(a -> a.getId().equals(id));
            bookRepository.save(book);
        }

        // Verwijdert daarna de auteur
        authorRepository.delete(author);
        return true;
    }
}