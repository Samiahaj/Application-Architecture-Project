package be.ehb.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @Email(message = "Vul een geldig e-mailadres in")
    @NotBlank(message = "E-mailadres mag niet leeg zijn")
    private String email;

    @NotBlank(message = "Wachtwoord mag niet leeg zijn")
    private String wachtwoord;

    public LoginRequest() {
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
}
