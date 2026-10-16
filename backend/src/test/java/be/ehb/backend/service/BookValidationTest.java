package be.ehb.backend.service;

import be.ehb.backend.model.Book;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertFalse;

class BookValidationTest {

    private final Validator validator =
            Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void invalidBookHasValidationErrors() {
        // Maakt een boek met ongeldige gegevens
        Book boek = new Book();
        boek.setIsbn("");
        boek.setTitel("");
        boek.setOmschrijving("");
        boek.setPrijs(new BigDecimal("-10"));
        boek.setVoorraad(-1);

        // Controleert de validatie
        assertFalse(validator.validate(boek).isEmpty());
    }
}