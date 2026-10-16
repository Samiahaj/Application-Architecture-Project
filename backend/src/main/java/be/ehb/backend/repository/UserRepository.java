package be.ehb.backend.repository;

import be.ehb.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    // Zoekt een gebruiker op basis van het e-mailadres
    boolean existsByEmail(String email);

    // Zoekt een gebruiker om later te kunnen inloggen
    User findByEmail(String email);
}