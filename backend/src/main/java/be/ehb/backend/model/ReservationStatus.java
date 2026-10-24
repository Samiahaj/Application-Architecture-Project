package be.ehb.backend.model;
/**
 * Enumeratie voor de mogelijke statussen van een reservering.
 * Beheert de levenscyclus van een reservering (PENDING, READY, COLLECTED, CANCELLED).
 */
public enum ReservationStatus {
    PENDING,
    READY,
    COLLECTED,
    CANCELLED
}