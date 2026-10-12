// Stelt een auteur voor
package be.ehb.backend.model;

import jakarta.persistence.*;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "authors")
public class Author {

    @Id
    //de database genereert automatisch een ID
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String naam;

    // Een auteur kan meerdere boeken hebben
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