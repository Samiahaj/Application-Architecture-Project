package be.ehb.backend.model;
/**
 * Entiteit die een gebruiker voorstelt in de database.
 * Bevat persoonsgegevens, beveiligd wachtwoord, gebruikersrol (USER/ADMIN)
 * en een actieve statusvlag voor accountblokkering.
 */
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Naam mag niet leeg zijn")
    @Column(nullable = false)
    private String naam;

    @Email(message = "Vul een geldig e-mailadres in")
    @NotBlank(message = "E-mailadres mag niet leeg zijn")
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Wachtwoord mag niet leeg zijn")
    @Size(min = 8, message = "Wachtwoord moet minstens 8 tekens bevatten")
    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String wachtwoord;

    @Column(nullable = false)
    private String rol = "USER";

    @Column(nullable = false)
    private boolean actief = true;

    public User() {
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public String getNaam() {
        return naam;
    }

    public void setNaam(String naam) {
        this.naam = naam;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getWachtwoord() {
        return wachtwoord;
    }

    public void setWachtwoord(String wachtwoord) {
        this.wachtwoord = wachtwoord;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }
    public boolean isActief() {
        return actief;
    }

    public void setActief(boolean actief) {
        this.actief = actief;
    }

}