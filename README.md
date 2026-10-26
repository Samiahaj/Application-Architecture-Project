# Application Architecture Project

## Boekenwinkel

BoekHaven is een webapplicatie voor een fictieve boekenwinkel. De applicatie laat bezoekers toe om het boekenaanbod, de auteurs en beoordelingen te bekijken.

Gebruikers kunnen zich registreren en aanmelden, hun profiel beheren, boeken reserveren en beoordelingen schrijven voor boeken die ze hebben opgehaald.

Beheerders kunnen boeken en auteurs beheren, gebruikersaccounts beheren, reserveringen opvolgen en antwoorden op beoordelingen beheren.


## Technologieën

### Backend
- Java JDK 25.0.3
- Java target version 21
- Spring Boot
- Spring Security
- Spring Data JPA/ Hibernate
- Maven

### Frontend
- React
- JavaScript
- React Router
- Vite
- CSS

### Database
- MySQL

## Functionaliteiten

- Boeken en auteurs bekijken. 
- Gebruikers registreren en aanmelden. 
- Een gebruikersprofiel en wachtwoord beheren. 
- Boeken reserveren en de beschikbare voorraad opvolgen. 
- Reserveringen beheren en statussen aanpassen. 
- Beoordelingen schrijven voor opgehaalde boeken. 
- Antwoorden op beoordelingen beheren. 
- Gebruikersrollen beheren en accounts blokkeren of deblokkeren. 
- Toegang tot functionaliteiten beveiligen op basis van gebruikersrollen.
## Projectstructuur

```text
Application-Architecture-Project/
├── README.md
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/be/ehb/backend/
│       │   │   ├── config/
│       │   │   ├── controller/
│       │   │   ├── dto/
│       │   │   ├── model/
│       │   │   ├── repository/
│       │   │   └── service/
│       │   └── resources/
│       └── test/
├── frontend/
│   ├── package.json
│   └── src/
├── documentation/
│   └── BoekHaven_Technische_Documentatie.md
└── planning/
    └── ProjectPlanning.md
   ```

## Architectuur en design patterns

De applicatie bestaat uit een aparte frontend en backend. De frontend communiceert met de backend via HTTP-aanvragen naar de REST API.

De backend is onderverdeeld in verschillende lagen:

- **Controller:** verwerkt HTTP-aanvragen en stuurt antwoorden terug naar de frontend.
- **Service:** bevat de bedrijfslogica en voert controles uit.
- **Repository:** verzorgt de communicatie met de database.
- **Model:** stelt de gegevensstructuren en database-entiteiten voor.
- **DTO:** wordt gebruikt om gegevens tussen de frontend en backend uit te wisselen.
- **Config:** bevat configuratie, waaronder beveiligingsinstellingen.

Deze structuur past het principe van *separation of concerns* toe. Daarnaast wordt gebruikgemaakt van een service layer, het repository/DAO-patroon en een MVC-achtige architectuur.

De frontend en backend zijn afzonderlijke projecten. De backend bestaat uit één Spring Boot-applicatie met meerdere interne services en is dus geen afzonderlijke microservicesarchitectuur.
## Documentatie

Raadpleeg de map documentation/ voor de technische documentatie, inclusief de installatie- en opstartinstructies. 
De projectplanning bevindt zich in de map planning/.

## Installatie en lokaal opstarten

Alle informatie over de installatie en configuratie van de applicatie, het instellen van de MySQL-database en het lokaal opstarten van de frontend en backend vind je in de technische documentatie:

`documentation/BoekHaven_Technische_Documentatie.md`

Raadpleeg dit document voordat je het project uitvoert.

## Tests

De backendtests bevinden zich in:

`backend/src/test/java/`

De tests behandelen onder andere functionaliteiten met betrekking tot boeken, auteurs, gebruikers, reserveringen en reviews.

Voer de tests uit vanuit de backendmap met Maven:

```bash
mvn test
```

Belangrijke testscenario's zijn:

1. Controleren of de voorraad correct wordt aangepast na een reservering.
2. Controleren of een reservering wordt geweigerd wanneer er onvoldoende voorraad is.
3. Controleren of gebruikersgegevens correct worden verwerkt.
4. Controleren of reviews voldoen aan de voorwaarden.
5. Controleren of gebruikers alleen toegang hebben tot toegestane functionaliteiten.

## Status

Het project is afgerond. De applicatie bevat de beschreven functionaliteiten voor het bekijken en beheren van boeken, gebruikers, reserveringen en beoordelingen.

## Bronnen en AI-gebruik

Bij het uitwerken van dit project heb ik gebruikgemaakt van ChatGPT (OpenAI) als hulpmiddel en ter begeleiding. 
ChatGPT heeft mij geholpen bij de verschillende stappen van het project, onder andere bij het structureren van mijn ideeën, het begrijpen van bepaalde onderwerpen en het oplossen van problemen tijdens het programmeren. 
Daarnaast heb ik ChatGPT gebruikt om uitleg te krijgen over de code en om hulp te krijgen bij het opsporen en verbeteren van fouten. 
ChatGPT diende hierbij als ondersteunend hulpmiddel tijdens mijn eigen werk aan het project.
- OpenAI — ChatGPT: https://chatgpt.com/