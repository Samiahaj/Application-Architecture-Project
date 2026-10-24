package be.ehb.backend.repository;
/**
 * Repository-interface voor recensies en beoordelingen.
 * Biedt databankoperaties voor reviews en handige controlefuncties,
 * zoals het ophalen per boek en verifiëren of een gebruiker al een review heeft geplaatst.
 */
import be.ehb.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Haalt alle beoordelingen van een boek op
    List<Review> findByBoekId(Long boekId);

    // Controleert of een gebruiker al een beoordeling voor een boek heeft geschreven
    boolean existsByGebruikerIdAndBoekId(Long gebruikerId, Long boekId);
}