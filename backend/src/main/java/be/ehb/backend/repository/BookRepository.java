//Werkt met de database
package be.ehb.backend.repository;
/**
 * Repository-interface voor boekenbeheer.
 * Biedt standaard CRUD-operaties en extra zoekfunctionaliteiten
 * zoals het controleren of een ISBN-nummer al bestaat in de databank.
 */
import be.ehb.backend.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book, Long> {
    boolean existsByIsbn(String isbn);
}