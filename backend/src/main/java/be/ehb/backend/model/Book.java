// Stelt een boek voor
package be.ehb.backend.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

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

    @NotBlank(message = "Omschrijving mag niet leeg zijn")
    @Column(nullable = false)
    private String omschrijving;

    @NotNull(message = "Prijs is verplicht")
    @Positive(message = "Prijs moet groter zijn dan nul")
    @Column(nullable = false)
    private BigDecimal prijs;

    @NotNull(message = "Voorraad is verplicht")
    @PositiveOrZero(message = "Voorraad mag niet negatief zijn")
    @Column(nullable = false)
    private Integer voorraad;

    public Book() {
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

    public Integer getVoorraad() {
        return voorraad;
    }

    public void setVoorraad(Integer voorraad) {
        this.voorraad = voorraad;
    }
}