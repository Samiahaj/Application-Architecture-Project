// Stelt een boek voor
package be.ehb.backend.model;
/**
 * Entiteit die een boek voorstelt in de database.
 * Bevat eigenschappen zoals ISBN, titel, omschrijving, prijs, voorraad, afbeelding
 * en een vele-op-vele relatie met auteurs.
 */
import jakarta.persistence.*;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "ISBN mag niet leeg zijn")
    @Column(nullable = false, unique = true)
    private String isbn;

    @NotBlank(message = "Titel mag niet leeg zijn")
    @Column(nullable = false)
    private String titel;

    @ElementCollection
    @CollectionTable(
            name = "book_genres",
            joinColumns = @JoinColumn(name = "book_id")
    )
    @Column(name = "genre", nullable = false, length = 50)
    private List<String> genres = new ArrayList<>();

    @NotBlank(message = "Omschrijving mag niet leeg zijn")
    @Column(nullable = false, columnDefinition = "TEXT")

    private String omschrijving;

    @NotNull(message = "Prijs is verplicht")
    @Positive(message = "Prijs moet groter zijn dan nul")
    @Column(nullable = false)
    private BigDecimal prijs;

    @NotNull(message = "Voorraad is verplicht")
    @PositiveOrZero(message = "Voorraad mag niet negatief zijn")
    @Column(nullable = false)
    private Integer voorraad;

    private String imageUrl;

    // Een boek kan meerdere auteurs hebben
    @ManyToMany
    @JoinTable(
            name = "book_authors",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "author_id")
    )
    private List<Author> auteurs = new ArrayList<>();

    public Book() {
    }
    public List<String> getGenres() {
        return genres;
    }

    public void setGenres(List<String> genres) {
        this.genres.clear();

        if (genres != null) {
            this.genres.addAll(
                    genres.stream()
                            .filter(genre -> genre != null && !genre.isBlank())
                            .map(String::trim)
                            .distinct()
                            .toList()
            );
        }
    }
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public String getTitel() {
        return titel;
    }

    public void setTitel(String titel) {
        this.titel = titel;
    }

    public String getOmschrijving() {
        return omschrijving;
    }

    public void setOmschrijving(String omschrijving) {
        this.omschrijving = omschrijving;
    }

    public BigDecimal getPrijs() {
        return prijs;
    }

    public void setPrijs(BigDecimal prijs) {
        this.prijs = prijs;
    }
    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    public Integer getVoorraad() {
        return voorraad;
    }

    public void setVoorraad(Integer voorraad) {
        this.voorraad = voorraad;
    }
    // Geeft de auteurs van het boek terug
    public List<Author> getAuteurs() {
        return auteurs;
    }

    // Hiermee kunnen we de auteurs van een boek aanpassen
    // Hiermee kunnen we de auteurs van een boek aanpassen
    public void setAuteurs(List<Author> auteurs) {
        this.auteurs.clear();
        if (auteurs != null) {
            this.auteurs.addAll(auteurs);
        }
    }
}