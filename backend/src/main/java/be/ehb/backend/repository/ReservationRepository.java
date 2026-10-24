package be.ehb.backend.repository;
/**
 * Repository-interface voor reserveringsbeheer.
 * Biedt standaard CRUD-operaties en aangepaste zoekmethodes om reserveringen
 * op te halen per gebruiker, per boek of op basis van een specifieke status.
 */
import be.ehb.backend.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import be.ehb.backend.model.ReservationStatus;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // Haalt alle reservaties van een gebruiker op
    List<Reservation> findByGebruikerId(Long gebruikerId);

    // Haalt alle reservaties voor een boek op
    List<Reservation> findByBoekId(Long boekId);

    // Haalt alle opgehaalde reservaties van een gebruiker op
    List<Reservation> findByGebruikerIdAndStatus(
            Long gebruikerId,
            ReservationStatus status
    );
}