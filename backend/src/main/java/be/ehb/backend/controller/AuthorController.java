// Beheert de HTTP-aanvragen voor auteurs
package be.ehb.backend.controller;

import be.ehb.backend.model.Author;
import be.ehb.backend.service.AuthorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/authors")
public class AuthorController {

    private final AuthorService authorService;

    // Spring levert de benodigde service aan de controller
    public AuthorController(AuthorService authorService) {
        this.authorService = authorService;
    }

    // Haalt alle auteurs op
    @GetMapping
    public List<Author> getAllAuthors() {
        return authorService.getAllAuthors();
    }

    // Zoekt een auteur op basis van het ID
    @GetMapping("/{id}")
    public ResponseEntity<Author> getAuthorById(@PathVariable Long id) {
        Optional<Author> author = authorService.getAuthorById(id);

        if (author.isPresent()) {
            return ResponseEntity.ok(author.get());
        }

        return ResponseEntity.notFound().build();
    }

    // Voegt een nieuwe auteur toe
    @PostMapping
    public Author addAuthor(@Valid @RequestBody Author author) {
        return authorService.addAuthor(author);
    }
}