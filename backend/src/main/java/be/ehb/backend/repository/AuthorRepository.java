// Beheert de databasebewerkingen voor auteurs
package be.ehb.backend.repository;

import be.ehb.backend.model.Author;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthorRepository extends JpaRepository<Author, Long> {
}