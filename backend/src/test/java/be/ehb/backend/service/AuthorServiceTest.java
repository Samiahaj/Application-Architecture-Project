package be.ehb.backend.service;

import be.ehb.backend.model.Author;
import be.ehb.backend.repository.AuthorRepository;
import be.ehb.backend.repository.BookRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
class AuthorServiceTest {

    @Mock
    private AuthorRepository authorRepository;

    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private AuthorService authorService;

    @Test
    void getAllAuthorsReturnsAuthors() {
        // Maakt een lijst met twee testautheurs
        List<Author> auteurs = List.of(
                new Author(),
                new Author()
        );

        // Geeft de auteurs terug
        when(authorRepository.findAll()).thenReturn(auteurs);

        // Haalt alle auteurs op
        List<Author> resultaat = authorService.getAllAuthors();

        // Controleert of er twee auteurs zijn
        assertEquals(2, resultaat.size());
    }

    @Test
    void addAuthorSavesAuthor() {
        // Maakt een testautheur
        Author auteur = new Author();
        auteur.setNaam("Test Auteur");

        // Geeft de auteur terug wanneer die opgeslagen wordt
        when(authorRepository.save(auteur)).thenReturn(auteur);

        // Voegt de auteur toe
        Author resultaat = authorService.addAuthor(auteur);

        // Controleert de naam
        assertEquals("Test Auteur", resultaat.getNaam());
    }

    @Test
    void deleteAuthorReturnsFalseWhenAuthorDoesNotExist() {
        // Geeft aan dat de auteur niet bestaat
        when(authorRepository.findById(999L))
                .thenReturn(Optional.empty());

        // Probeert de auteur te verwijderen
        boolean resultaat = authorService.deleteAuthor(999L);

        // Controleert of de verwijdering niet gelukt is
        assertFalse(resultaat);

        // Controleert of er niets verwijderd werd
        verify(authorRepository, never()).delete(
                org.mockito.ArgumentMatchers.any(Author.class)
        );
    }
}