// Stelt een auteur voor
package be.ehb.backend.model;
/**
 * Entiteit die een auteur voorstelt in de database.
 * Bevat de naam van de auteur en een gekoppelde lijst van boeken
 * via een vele-op-vele relatie (ManyToMany).
 */
import jakarta.persistence.*;
import java.util.List;
import java.util.ArrayList;
import jakarta.validation.constraints.NotBlank;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "authors")
public class Author {

    @Id
    //de database genereert automatisch een ID
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // De naam van de auteur mag niet leeg zijn
    @NotBlank(message = "Naam mag niet leeg zijn")
    @Column(nullable = false)
    private String naam;
    // Een auteur kan meerdere boeken hebben
    @JsonIgnore
    @ManyToMany(mappedBy = "auteurs")
    private List<Book> boeken = new ArrayList<>();

    public Author() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNaam() {
        return naam;
    }

    public void setNaam(String naam) {
        this.naam = naam;
    }
    // Geeft de boeken van de auteur terug
    public List<Book> getBoeken() {
        return boeken;
    }

    // Hiermee kunnen we de boeken van een auteur aanpassen
    public void setBoeken(List<Book> boeken) {
        this.boeken = boeken;
    }
}