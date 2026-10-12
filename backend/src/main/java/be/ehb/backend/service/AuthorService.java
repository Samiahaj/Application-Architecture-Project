// Beheert de logica voor auteurs
package be.ehb.backend.service;

import be.ehb.backend.model.Author;
import be.ehb.backend.repository.AuthorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;

    // Spring levert de benodigde repository aan de service
    public AuthorService(AuthorRepository authorRepository) {
        this.authorRepository = authorRepository;
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
}