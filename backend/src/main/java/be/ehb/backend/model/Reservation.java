package be.ehb.backend.model;
/**
 * Entiteit die een reservering voorstelt in de database.
 * Koppelt een gebruiker aan een gereserveerd boek en houdt de reserveringsdatum en actuele status bij.
 */
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // De gebruiker die het boek reserveert
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User gebruiker;

    // Het gereserveerde boek
    @ManyToOne(optional = false)
    @JoinColumn(name = "book_id", nullable = false)
    private Book boek;

    // De datum waarop de reservatie werd gemaakt
    @Column(nullable = false)
    private LocalDateTime reservatieDatum;

    // De status van de reservatie
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status;

    public Reservation() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getGebruiker() {
        return gebruiker;
    }

    public void setGebruiker(User gebruiker) {
        this.gebruiker = gebruiker;
    }

    public Book getBoek() {
        return boek;
    }

    public void setBoek(Book boek) {
        this.boek = boek;
    }

    public LocalDateTime getReservatieDatum() {
        return reservatieDatum;
    }

    public void setReservatieDatum(LocalDateTime reservatieDatum) {
        this.reservatieDatum = reservatieDatum;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }


}