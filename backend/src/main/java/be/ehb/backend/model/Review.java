package be.ehb.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // De gebruiker die de beoordeling schrijft
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User gebruiker;

    // Het beoordeelde boek
    @ManyToOne(optional = false)
    @JoinColumn(name = "book_id", nullable = false)
    private Book boek;

    // De score van de beoordeling
    @NotNull
    @Min(1)
    @Max(5)
    @Column(nullable = false)
    private Integer score;

    // De tekst van de beoordeling
    @NotBlank
    @Size(max = 1000)
    @Column(nullable = false, length = 1000)
    private String tekst;
    // Antwoord van de beheerder
    @Size(max = 1000)
    @Column(length = 1000)
    private String antwoord;

    public Review() {
    }
    public String getAntwoord() {
        return antwoord;
    }

    public void setAntwoord(String antwoord) {
        this.antwoord = antwoord;
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

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getTekst() {
        return tekst;
    }

    public void setTekst(String tekst) {
        this.tekst = tekst;
    }
}
