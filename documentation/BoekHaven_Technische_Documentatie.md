# Technische documentatie — BoekHaven

## 1. Doel van de applicatie

BoekHaven is een webapplicatie voor een fictieve boekenwinkel. Bezoekers kunnen het boekenaanbod, de auteurs en beoordelingen bekijken. Gebruikers kunnen een account aanmaken, aanmelden, hun profiel beheren, boeken reserveren en beoordelingen schrijven voor boeken die ze hebben opgehaald. 
Beheerders kunnen boeken en auteurs beheren, gebruikers beheren, reserveringen opvolgen en antwoorden op beoordelingen beheren.

## 2. Technologieën

### Backend
- **Java JDK 25.0.3** — programmeertaal voor de serverlogica.
- **Java target version 21** — de doelversie die in pom.xml is ingesteld.
- **Spring Boot 4.1.1** — framework voor de backend.
- **Spring Web MVC** — verwerkt HTTP-aanvragen en API-antwoorden.
- **Spring Data JPA / Hibernate** — koppelt Java-entiteiten aan relationele databasegegevens.
- **Spring Security** — verzorgt authenticatie, sessiebeheer en toegangsregels.
- **Bean Validation** — valideert invoer, zoals verplichte velden en toegestane waarden.
- **Apache Maven 3.9.16** — beheert dependencies en de build van de backend.
- **MySQL Connector/J** — maakt de verbinding met MySQL mogelijk.

### Frontend
- **React 19** — bouwt de gebruikersinterface met componenten.
- **React Router 7** — verzorgt de navigatie tussen pagina's.
- **Vite** — ontwikkelserver en buildtool.
- **JavaScript en CSS** — implementeren de frontendlogica en vormgeving.

### Database
- **MySQL** — bewaart de gegevens van de applicatie.

## 3. Projectstructuur

De aangeleverde projectbestanden hebben de volgende hoofdstructuur:

```text
samiahaj-application-architecture-project/
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
│       │       └── application.properties
│       └── test/java/be/ehb/backend/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       └── pages/
│           ├── admin/
│           └── user/
|── planning/
|    └── ProjectPlanning.md
|── Documentation
    └── BoekHaven_Technische_Documentatie.md
    
```

## 4. Architectuur van de applicatie

De applicatie is opgesplitst in een React-frontend en een Spring Boot-backend. De frontend verstuurt HTTP-aanvragen naar de backend. Controllers ontvangen deze aanvragen, services voeren de toepassingslogica uit en repositories communiceren met de database via Spring Data JPA.

### 4.1 Controllers

Controllers vormen het HTTP-toegangspunt van de backend. Ze verwerken routeparameters, queryparameters en request bodies, roepen services aan en sturen een HTTP-statuscode met een antwoord terug.

De code bevat de volgende controllers:

- `BookController` — boeken ophalen, toevoegen, aanpassen en verwijderen, en auteurs aan boeken koppelen. Bij het aanmaken en aanpassen kunnen boekgegevens en een omslagafbeelding worden meegestuurd.
- `AuthorController` — auteurs ophalen, toevoegen, aanpassen en verwijderen.
- `UserController` — registratie, login, profiel- en wachtwoordbeheer, rolbeheer en het blokkeren of deblokkeren van gebruikersaccounts.
- `ReservationController` — reserveringen aanmaken en opvragen en reserveringsstatussen aanpassen.
- `ReviewController` — beoordelingen aanmaken en ophalen en antwoorden op beoordelingen opslaan.

### 4.2 Services

Services bevatten de toepassingslogica en controles.

- `BookService` beheert boeken, controleert onder meer op dubbele ISBN-nummers en verwerkt de koppeling met auteurs en eventuele boekafbeeldingen.
- `AuthorService` beheert auteurs.
- `UserService` verwerkt registratie, wachtwoordhashing, profielwijzigingen, wachtwoordwijzigingen en rolbeheer. De service kan ook gebruikersaccounts blokkeren en deblokkeren. De logincontroller controleert of een account actief is voordat de normale authenticatie wordt uitgevoerd.
- `ReservationService` controleert of de gebruiker en het boek bestaan, controleert de voorraad en bewaakt toegestane statusovergangen van reserveringen.
- `ReviewService` beheert beoordelingen en controleert onder meer of een gebruiker het boek heeft opgehaald en niet al een beoordeling voor hetzelfde boek heeft geschreven.
- `CustomUserDetailsService` laadt gebruikersgegevens op basis van het e-mailadres voor Spring Security.

### 4.3 Repositories

Repositories gebruiken Spring Data JPA om entiteiten op te halen, op te slaan, aan te passen en te verwijderen. Er zijn repositories voor boeken, auteurs, gebruikers, reserveringen en beoordelingen. Sommige repositories bevatten aanvullende zoekmethodes, bijvoorbeeld om een ISBN of een bestaande beoordeling te controleren.

### 4.4 Modellen / database-entiteiten

De belangrijkste entiteiten zijn:

- `Book`
- `Author`
- `User`
- `Reservation`
- `Review`

Daarnaast bevat het project `ReservationStatus`, een enum met de mogelijke statussen van een reservering, en `LoginRequest`, een DTO voor de gegevens van een loginverzoek.

De databasekolommen en relaties worden beschreven met JPA-annotaties. De configuratie `spring.jpa.hibernate.ddl-auto=update` laat Hibernate het databaseschema bijwerken op basis van de entiteiten. 

## 5. Datamodel

### 5.1 Boek (`books`)

Een boek bevat onder meer de volgende gegevens:

- `id` — automatisch gegenereerde primaire sleutel.
- `isbn` — verplicht en uniek.
- `titel` — verplichte titel.
- `omschrijving` — verplichte beschrijving.
- `prijs` — prijs van het boek; moet groter zijn dan nul.
- `voorraad` — beschikbare voorraad; mag niet negatief zijn.
- `imageUrl` — optionele verwijzing naar de boekafbeelding.
- `genres` — een lijst met één of meerdere genres die aan een boek gekoppeld zijn.
- `auteurs` — auteurs die aan het boek gekoppeld zijn.

De relatie tussen boeken en auteurs is many-to-many en gebruikt de tussentabel `book_authors`.

### 5.2 Auteur (`authors`)

Een auteur heeft een automatisch gegenereerd `id` en een verplichte `naam`. Een auteur kan aan meerdere boeken gekoppeld zijn.

### 5.3 Gebruiker (`users`)

Een gebruiker heeft de volgende gegevens:

- `id` — automatisch gegenereerde primaire sleutel.
- `naam` — verplichte naam.
- `email` — verplicht en uniek e-mailadres.
- `wachtwoord` — wachtwoord dat met BCrypt wordt gehasht.
- `rol` — gebruikersrol (`USER` of `ADMIN`).
- `actief` — geeft aan of het account actief of geblokkeerd is.

De standaardrol is `USER` en een nieuw account is standaard actief. Bij registratie stelt `UserService` de rol expliciet in op `USER`; een gebruiker kan zichzelf dus niet via het registratieformulier beheerder maken. Het wachtwoordveld is geconfigureerd als alleen schrijfbaar in JSON, zodat het niet via normale JSON-serialisatie wordt teruggestuurd.

Een beheerder kan een account blokkeren of deblokkeren. De logincontroller weigert een loginpoging wanneer het account als niet-actief is gemarkeerd.

### 5.4 Reservering (`reservations`)

Een reservering verwijst naar één gebruiker en één boek en bewaart onder meer het reservatietijdstip en de status.

De statussen in `ReservationStatus` zijn:

- `PENDING` — reservering aangemaakt.
- `READY` — klaar om opgehaald te worden.
- `COLLECTED` — opgehaald.
- `CANCELLED` — geannuleerd.

Bij het aanmaken van een reservering wordt de voorraad met één verminderd. Wanneer een reservering vanuit `PENDING` of `READY` wordt geannuleerd, wordt de voorraad opnieuw met één verhoogd.

### 5.5 Beoordeling (`reviews`)

Een beoordeling verwijst naar één gebruiker en één boek en bevat:

- een score van 1 tot en met 5;
- een tekst die verplicht is en maximaal 1000 tekens mag bevatten;
- een optioneel antwoord op de beoordeling, eveneens beperkt tot 1000 tekens volgens de servicevalidatie.

Een gebruiker mag volgens de toepassingslogica alleen een beoordeling schrijven voor een boek waarvoor die gebruiker een reservering met status `COLLECTED` heeft. De service voorkomt ook dat dezelfde gebruiker hetzelfde boek meer dan één keer beoordeelt.

## 6. Backend-API-endpoints

De frontend gebruikt als basisadres `http://localhost:8080`. De onderstaande endpoints zijn afgeleid van de mappings in de controllers en de beveiligingsregels in `SecurityConfig`. Tenzij anders vermeld, gebruikt de API queryparameters, formuliergegevens of JSON zoals aangegeven bij de betreffende endpoint.

### 6.1 Boeken — `/api/books`

| Methode | Endpoint | Functie | Toegang volgens huidige configuratie |
|---|---|---|---|
| `GET` | `/api/books` | Haalt alle boeken op. | Openbaar |
| `GET` | `/api/books/{id}` | Haalt één boek op via het id. | Openbaar |
| `POST` | `/api/books` | Maakt een boek aan, met boekgegevens en eventueel een afbeelding en auteur-id's. | Alleen `ADMIN` |
| `PUT` | `/api/books/{id}` | Past een boek aan en kan een afbeelding en auteur-id's ontvangen. | Alleen `ADMIN` |
| `DELETE` | `/api/books/{id}` | Verwijdert een boek. | Alleen `ADMIN` |
| `POST` | `/api/books/{bookId}/authors/{authorId}` | Koppelt een auteur aan een boek. | Alleen `ADMIN` |


De service controleert onder andere of een ISBN al bestaat. De validatie van boekvelden omvat verplichte waarden, een positieve prijs en een voorraad van nul of hoger.

### 6.2 Auteurs — `/api/authors`

| Methode | Endpoint | Functie | Toegang volgens huidige configuratie |
|---|---|---|---|
| `GET` | `/api/authors` | Haalt alle auteurs op. | Openbaar |
| `GET` | `/api/authors/{id}` | Haalt één auteur op. | Openbaar |
| `POST` | `/api/authors` | Maakt een auteur aan. | Alleen `ADMIN` |
| `PUT` | `/api/authors/{id}` | Past een auteur aan. | Alleen `ADMIN` |
| `DELETE` | `/api/authors/{id}` | Verwijdert een auteur. | Alleen `ADMIN` |

Bij het aanmaken of aanpassen van een auteur wordt validatie toegepast. De naam van een auteur mag niet leeg zijn. Wanneer een auteur niet wordt gevonden, kan de controller `404 Not Found` terugsturen.

### 6.3 Gebruikers — `/api/users`

| Methode | Endpoint | Functie | Toegang volgens huidige configuratie |
|---|---|---|---|
| `POST` | `/api/users/register` | Registreert een nieuwe gebruiker. | Openbaar |
| `POST` | `/api/users/login` | Controleert de login en maakt bij succes een sessie aan. | Openbaar |
| `GET` | `/api/users/profile` | Haalt het profiel van de ingelogde gebruiker op. | Ingelogd |
| `PUT` | `/api/users/profile` | Wijzigt de naam en het e-mailadres van de ingelogde gebruiker. | Ingelogd |
| `PUT` | `/api/users/password` | Wijzigt het wachtwoord van de ingelogde gebruiker. | Ingelogd |
| `GET` | `/api/users` | Haalt alle gebruikers op. | Alleen `ADMIN` |
| `PUT` | `/api/users/{id}/role` | Wijzigt de rol naar `USER` of `ADMIN`. | Alleen `ADMIN` |
| `PUT` | `/api/users/{id}/block` | Blokkeert een gebruikersaccount. | Alleen `ADMIN` |
| `PUT` | `/api/users/{id}/unblock` | Deblokkeert een gebruikersaccount. | Alleen `ADMIN` |

Bij registratie wordt gecontroleerd of het e-mailadres al bestaat. De rol wordt automatisch ingesteld op `USER` en het wachtwoord wordt met BCrypt gehasht. Het wachtwoord wordt niet opgenomen in de normale JSON-respons.

Voor een wachtwoordwijziging moet het huidige wachtwoord correct zijn en moet het nieuwe wachtwoord minstens acht tekens lang zijn. Bij het aanpassen van het profiel worden de naam en het e-mailadres gecontroleerd; een e-mailadres dat al door een andere gebruiker wordt gebruikt, wordt geweigerd.

Een beheerder kan gebruikersrollen wijzigen en gebruikersaccounts blokkeren of deblokkeren. Geblokkeerde gebruikers kunnen zich niet aanmelden en hebben geen toegang tot beveiligde functionaliteiten. De applicatie bevat geen functionaliteit om gebruikersaccounts te verwijderen.


### 6.4 Reserveringen — `/api/reservations`

| Methode | Endpoint | Functie | Toegang volgens huidige configuratie |
|---|---|---|---|
| `GET` | `/api/reservations` | Haalt alle reserveringen op. | Alleen toegankelijk voor`ADMIN` |
| `POST` | `/api/reservations?bookId={id}` | Maakt een reservering aan voor de ingelogde gebruiker. | Ingelogd |
| `GET` | `/api/reservations/user/{userId}` | Haalt de reserveringen van de ingelogde gebruiker op. | Ingelogd; eigen id vereist |
| `GET` | `/api/reservations/user/{userId}/collected` | Haalt de opgehaalde reserveringen van de ingelogde gebruiker op. | Ingelogd; eigen id vereist |
| `PUT` | `/api/reservations/{reservationId}/status?status={status}` | Wijzigt de status van een reservering. | Alleen toegankelijk voor `ADMIN`  |

De statusparameter gebruikt één van de waarden `PENDING`, `READY`, `COLLECTED` of `CANCELLED`.

Bij het aanmaken van een reservering controleert de service of de gebruiker en het boek bestaan en of er voorraad beschikbaar is. Daarna wordt de voorraad met één verminderd. Een annulering vanuit `PENDING` of `READY` verhoogt de voorraad opnieuw met één.

De toegestane statusovergangen zijn beperkt. `PENDING` kan naar `READY` of `CANCELLED`; `READY` kan naar `COLLECTED` of `CANCELLED`. Andere overgangen worden door de service geweigerd.

### 6.5 Beoordelingen — `/api/reviews`

| Methode | Endpoint | Functie | Toegang volgens huidige configuratie       |
|---|---|---|--------------------------------------------|
| `GET` | `/api/reviews/book/{bookId}` | Haalt beoordelingen voor één boek op. | Openbaar                                   |
| `POST` | `/api/reviews?bookId={id}&score={1-5}&tekst={tekst}` | Maakt een beoordeling aan voor een opgehaald boek. | Ingelogd                                   |
| `GET` | `/api/reviews` | Haalt alle beoordelingen op. | Alleen toegankelijk voor `ADMIN`           |
| `PUT` | `/api/reviews/{reviewId}/answer` | Slaat een antwoord op een beoordeling op. | Alleen toegankelijk voor `ADMIN` |

Bij het aanmaken van een beoordeling moet de score tussen 1 en 5 liggen. De tekst mag niet leeg zijn en mag maximaal 1000 tekens bevatten. De service controleert ook of de gebruiker het boek heeft opgehaald en nog geen beoordeling voor dat boek heeft geschreven.

## 7. Beveiliging en sessies

- Spring Security wordt geconfigureerd in `SecurityConfig`.
- De applicatie gebruikt sessiegebaseerde authenticatie. Bij een geslaagde login wordt de beveiligingscontext opgeslagen in de HTTP-sessie.
- De frontend gebruikt `credentials: 'include'` bij API-aanvragen, zodat de sessiecookie kan worden meegestuurd.
- De logout-route is `/logout`. Bij uitloggen wordt de HTTP-sessie ongeldig gemaakt en de cookie `JSESSIONID` verwijderd.
- Wachtwoorden worden met `BCryptPasswordEncoder` gehasht.
- De rollen `USER` en `ADMIN` worden gebruikt voor toegangscontrole.
- Boeken en auteurs kunnen via `GET` openbaar worden opgevraagd. Beoordelingen per boek zijn eveneens openbaar.
- De configuratie staat CORS-aanvragen toe vanaf `http://localhost:5173` en `http://localhost:5174`, met de methoden `GET`, `POST`, `PUT`, `DELETE` en `OPTIONS`. Credentials zijn toegestaan.
- De endpoints voor het blokkeren en deblokkeren van gebruikers zijn met `@PreAuthorize("hasRole('ADMIN')")` beveiligd. `@EnableMethodSecurity` is ingeschakeld in `SecurityConfig`.


## 8. Frontend

### 8.1 API-communicatie

`frontend/src/api/api.js` bevat de gedeelde functie `apiFetch`. Deze functie:

- stuurt aanvragen naar `http://localhost:8080`;
- gebruikt `credentials: 'include'` voor sessiebeheer;
- stelt waar nodig de JSON-header in;
- probeert foutmeldingen van de backend leesbaar door te geven;
- retourneert `null` voor antwoorden met status `204`.

De boekformulieren kunnen multipart-formuliergegevens versturen om boekgegevens, auteur-id's en optioneel een afbeelding aan de backend door te geven.Het boekbeheer ondersteunt meerdere genres per boek en laat beheerders nieuwe genres toevoegen. Op de openbare startpagina en de gebruikersstartpagina worden meerdere genres weergegeven en kunnen boeken op genre worden gefilterd.

### 8.2 Authenticatie en navigatie

De frontend bevat onder andere:

- `AuthContext.jsx` — beheert de authenticatiecontext aan de frontendzijde;
- `ProtectedRoute.jsx` — beschermt pagina's waarvoor een gebruiker moet zijn aangemeld of een bepaalde rol moet hebben;
- `SiteHeader.jsx` en `PageLayout.jsx` — gedeelde onderdelen van de gebruikersinterface.

De navigatie wordt verzorgd door React Router.

Frontendbeveiliging verbetert de gebruikerservaring, maar vervangt de autorisatiecontroles in de backend niet.

### 8.3 Pagina's

De frontend bevat pagina's voor:

- de startpagina en het boekenaanbod;
- inloggen en registreren;
- boekdetails en beoordelingen;
- het gebruikersprofiel, inclusief profiel- en wachtwoordwijzigingen;
- het beheerdersdashboard;
- boekbeheer;
- gebruikersbeheer, inclusief rolwijzigingen en het blokkeren en deblokkeren van accounts;
- reserveringsbeheer;
- beheer van reacties op beoordelingen.

De precieze vormgeving en formulierdetails kunnen veranderen tijdens de verdere ontwikkeling.

## 9. Validatie en foutafhandeling

De backend gebruikt Bean Validation-annotaties zoals `@NotBlank`, `@NotNull`, `@Email`, `@Positive`, `@PositiveOrZero`, `@Min`, `@Max` en `@Size`. Daarnaast voeren services toepassingscontroles uit.

Voorbeelden van controles zijn:

- voorkomen dat een e-mailadres dubbel wordt gebruikt;
- controleren of de gebruikersnaam en het e-mailadres zijn ingevuld;
- wachtwoorden hashen en bij wachtwoordwijziging het huidige wachtwoord controleren;
- nieuwe wachtwoorden van minstens acht tekens vereisen;
- voorkomen dat geblokkeerde gebruikers zich aanmelden;
- voorkomen dat de voorraad negatief wordt;
- weigeren van een reservering wanneer er geen voorraad is;
- weigeren van ongeldige reserveringsstatusovergangen;
- toestaan van beoordelingen alleen voor opgehaalde boeken;
- voorkomen dat dezelfde gebruiker hetzelfde boek meermaals beoordeelt;
- scores voor beoordelingen beperken tot 1 tot en met 5 en reviewteksten beperken tot maximaal 1000 tekens.

Afhankelijk van de situatie retourneren controllers bijvoorbeeld `200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden` of `404 Not Found`. De precieze foutinhoud verschilt per endpoint.

## 10. Tests

In de aangeleverde backendcode zijn testbestanden aanwezig voor:

- het opstarten van de Spring Boot-context (`BackendApplicationTests`);
- auteurs (`AuthorServiceTest`);
- boeken (`BookServiceTest`);
- boekvalidatie (`BookValidationTest`);
- reserveringen (`ReservationServiceTest`);
- beoordelingen (`ReviewServiceTest`);
- gebruikers (`UserServiceTest`).

De tests gebruiken onder andere JUnit en Mockito. De testbestanden bevatten testgevallen voor boek- en auteurbeheer, validatie, wachtwoordhashing, reserveringsvoorraad, toegestane reserveringsstatussen en voorwaarden voor het schrijven van beoordelingen.


Backendtests uitvoeren vanuit de map `backend`:

```bash
./mvnw test
```

Op Windows:

```powershell
.\mvnw.cmd test
```

## 11. Installatie en opstarten

### Vereisten

- JDK 21.
- Een draaiende MySQL-server.
- Node.js en npm.
- Een database die overeenkomt met de ingestelde databaseconfiguratie.

### 11.1 Database

De huidige configuratie gebruikt de database `bookstore` op `localhost:3306`.

Maak de database aan en configureer de databasegebruiker en het wachtwoord lokaal. De huidige waarden in `application.properties` zijn configuratievoorbeelden uit de aangeleverde code; gebruik geen echte geheimen in een publieke repository.

### 11.2 Backend

1. Open een terminal in de map `backend`.
2. Controleer of de database bereikbaar is en de instellingen overeenkomen met je lokale MySQL-configuratie.
3. Start de backend:

```bash
./mvnw spring-boot:run
```

Op Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

De server is geconfigureerd voor poort `8080`.

### 11.3 Frontend

1. Open een tweede terminal in de map `frontend`.
2. Installeer de dependencies:

```bash
npm install
```

3. Start de ontwikkelserver:

```bash
npm run dev
```

Vite toont vervolgens het lokale adres waarop de frontend bereikbaar is. De CORS-configuratie van de backend staat standaard de poorten `5173` en `5174` toe.

De opstartcommando's zijn afgeleid van de meegeleverde configuratie. Ze zijn niet in deze documentatieronde op een schone machine getest.




