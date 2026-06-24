# Feature Enrichment — Attempt 2

Generated: 2026-06-24

Each section is one LLM call (~5–8K tokens). The instruction tells the generator how all files in the feature interact and what contracts they must honour.

---

## Shared Backend Core

**Name:** `shared-backend-core`  
**Type:** SHARED  
**Change required:** true

**Files in this feature:**
- `backend/src/main/java/com/filamentbarbaner/model/User.java` — MODEL layer - Defines the User data structure for persistence in the database, including fields for authentication (email, password) and authorization (role).
- `backend/src/main/java/com/filamentbarbaner/model/Role.java` — MODEL layer - A standalone enum defining the authorization roles (ADMIN, CUSTOMER) used by the User entity and Spring Security configuration.
- `backend/src/main/java/com/filamentbarbaner/repository/UserRepository.java` — REPOSITORY layer - Provides data access methods for the User entity. Its primary public method is findByEmail(String): Optional<User>, used by the UserService for authentication.
- `backend/src/main/java/com/filamentbarbaner/service/UserService.java` — SERVICE layer - Implements Spring Security's UserDetailsService to integrate user data with the authentication manager. Its core method is loadUserByUsername(String email): UserDetails.
- `backend/src/main/java/com/filamentbarbaner/config/AdminInitializer.java` — CONFIG layer - A CommandLineRunner that ensures a default ADMIN user exists on startup, creating one from environment variables (${admin.email}, ${admin.password}) if the database is empty.
- `backend/src/main/java/com/filamentbarbaner/exception/GlobalExceptionHandler.java` — EXCEPTION layer - A @RestControllerAdvice class that catches exceptions across all controllers and formats them into a consistent ErrorResponse DTO for the client.
- `backend/src/main/java/com/filamentbarbaner/dto/ErrorResponse.java` — DTO layer - A record defining the standard JSON structure for all API error responses, used by the GlobalExceptionHandler.

**Feature Instruction:**

This feature instruction covers the foundational components for the backend application, including user management, authentication support, and global exception handling. Implement all files as described below, ensuring they interact correctly.

### 1. Data Models (`Role.java`, `User.java`)

**`Role.java`**
- This is a public enum named `Role`.
- It defines two values: `ADMIN` and `CUSTOMER`.

**`User.java`**
- This is a JPA entity class annotated with `@Entity`, `@Table(name = "users")`, `@Data`, `@Builder`, `@NoArgsConstructor`, and `@AllArgsConstructor`.
- It must implement the `UserDetails` interface from Spring Security.
- **Fields:**
  - `id`: `UUID`. Annotated with `@Id` and `@GeneratedValue(strategy = GenerationType.AUTO)`. This is the primary key.
  - `email`: `String`. Annotated with `@Column(unique = true, nullable = false)`. This will be used as the username.
  - `passwordHash`: `String`. Annotated with `@Column(nullable = false)`. This stores the BCrypt-hashed password.
  - `role`: `Role`. Annotated with `@Enumerated(EnumType.STRING)` and `@Column(nullable = false)`.
- **`UserDetails` Implementation:**
  - `getAuthorities()`: Returns a `Collection` containing a single `SimpleGrantedAuthority` with the user's role name (e.g., `"ROLE_ADMIN"`).
  - `getPassword()`: Returns `passwordHash`.
  - `getUsername()`: Returns `email`.
  - `isAccountNonExpired()`, `isAccountNonLocked()`, `isCredentialsNonExpired()`, `isEnabled()`: All should return `true`.

### 2. Data Access Layer (`UserRepository.java`)

**`UserRepository.java`**
- This is an interface that extends `JpaRepository<User, UUID>`.
- It must contain the following method signature:
  - `Optional<User> findByEmail(String email);`

### 3. Service Layer (`UserService.java`)

**`UserService.java`**
- This class is a Spring `@Service`.
- It must implement the `UserDetailsService` interface from Spring Security.
- **Dependencies:**
  - Inject `UserRepository` via constructor injection.
- **Public Methods:**
  - **`@Override public UserDetails loadUserByUsername(String email)`**
    - **Logic:**
      1. Call `userRepository.findByEmail(email)` to find the user.
      2. If the `Optional<User>` is empty, throw a `UsernameNotFoundException` with the message "User not found with email: " + email.
      3. If the user is found, return the `User` object. (Since `User` implements `UserDetails`, it can be returned directly).

### 4. Configuration (`AdminInitializer.java`)

**`AdminInitializer.java`**
- This class is a Spring `@Component` and implements `CommandLineRunner`.
- **Dependencies:**
  - Inject `UserRepository` and `PasswordEncoder` via constructor injection.
- **Properties:**
  - Use `@Value("${admin.email}")` to inject the admin email into a `String` field.
  - Use `@Value("${admin.password}")` to inject the admin password into a `String` field.
- **Public Methods:**
  - **`@Override public void run(String... args)`**
    - **Logic:**
      1. Call `userRepository.findByEmail()` with the injected admin email.
      2. If a user is already present (the returned `Optional` is not empty), log a message that the admin user already exists and terminate the method.
      3. If no user is found, create a new `User` object using its builder.
      4. Set the user's `email` to the injected admin email.
      5. Set the user's `passwordHash` by encoding the injected admin password using the `passwordEncoder.encode()` method.
      6. Set the user's `role` to `Role.ADMIN`.
      7. Save the new admin user to the database by calling `userRepository.save()`.
      8. Log a message indicating that the default admin user has been created.

### 5. Exception Handling (`ErrorResponse.java`, `GlobalExceptionHandler.java`)

**`ErrorResponse.java`**
- This is a public record or data class.
- **Fields:**
  - `timestamp`: `LocalDateTime`
  - `status`: `int`
  - `error`: `String`
  - `message`: `String`
  - `path`: `String`

**`GlobalExceptionHandler.java`**
- This class is annotated with `@RestControllerAdvice`.
- It should contain `@ExceptionHandler` methods to catch exceptions and return a standardized `ErrorResponse`.
- **Example Handler (for generic exceptions):**
  - **`handleAllExceptions(Exception ex, WebRequest request)`**
    - Annotate with `@ExceptionHandler(Exception.class)`.
    - **Logic:**
      1. Create a new `ErrorResponse` object.
      2. Populate its fields:
         - `timestamp`: `LocalDateTime.now()`
         - `status`: `HttpStatus.INTERNAL_SERVER_ERROR.value()` (500)
         - `error`: `HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase()`
         - `message`: `ex.getMessage()`
         - `path`: `((ServletWebRequest)request).getRequest().getRequestURI()`
      3. Return a `ResponseEntity<ErrorResponse>` with the `ErrorResponse` object as the body and `HttpStatus.INTERNAL_SERVER_ERROR` as the status.
- **Add another handler for `UsernameNotFoundException`:**
  - **`handleUsernameNotFoundException(UsernameNotFoundException ex, WebRequest request)`**
    - Annotate with `@ExceptionHandler(UsernameNotFoundException.class)`.
    - Follow the same logic as above, but use `HttpStatus.NOT_FOUND` (404) for the status and error fields.

### Inter-File and Cross-Feature Wiring

- `UserService` injects `UserRepository` to fetch user data.
- `AdminInitializer` injects `UserRepository` to check for and create the admin user. It also injects `PasswordEncoder` (which will be defined as a bean in the `shared-backend-auth` feature's `SecurityConfig`).
- `User` entity uses the `Role` enum.
- `GlobalExceptionHandler` constructs and returns `ErrorResponse` DTOs.
- The `UserService` (specifically its implementation of `UserDetailsService`) will be consumed by the Spring Security configuration (`SecurityConfig` from the `shared-backend-auth` feature) to manage authentication.

---

## Shared Backend Authentication

**Name:** `shared-backend-auth`  
**Type:** SHARED  
**Change required:** true

**Files in this feature:**
- `backend/src/main/java/com/filamentbarbaner/controller/AuthController.java` — CONTROLLER layer - Exposes the public authentication endpoint. Its primary method login(AuthRequest) handles POST /api/v1/auth/login requests.
- `backend/src/main/java/com/filamentbarbaner/dto/AuthRequest.java` — DTO layer - A record defining the request body for the login endpoint, with @NotBlank and @Email validation annotations.
- `backend/src/main/java/com/filamentbarbaner/dto/AuthResponse.java` — DTO layer - A record defining the successful JSON response for the login endpoint, containing the JWT and user metadata.
- `backend/src/main/java/com/filamentbarbaner/util/JwtUtil.java` — UTIL layer - Provides stateless, static methods for JWT management. Key public methods are generateToken(UserDetails), validateToken(String, UserDetails), and extractEmail(String).
- `backend/src/main/java/com/filamentbarbaner/security/JwtAuthFilter.java` — CONFIG layer - A Spring Security OncePerRequestFilter that validates the 'Authorization: Bearer' token on incoming requests and sets the SecurityContextHolder.
- `backend/src/main/java/com/filamentbarbaner/config/SecurityConfig.java` — CONFIG layer - Defines the core security policy, including public routes (GET /api/v1/**, POST /api/v1/auth/login, POST /api/v1/reservations), protected admin routes (/api/v1/admin/**), and registers the JwtAuthFilter.

**Feature Instruction:**

This feature implements the core authentication and authorization layer for the Filament Bar backend using Spring Security and JSON Web Tokens (JWT). It includes a login endpoint, JWT generation/validation utilities, a request filter to process tokens, and the main security configuration.

### 1. Data Transfer Objects (DTOs)

**`AuthRequest.java`**
- A `record` located in `com.filamentbarbaner.dto`.
- Fields:
  - `String email`: Add `@Email` and `@NotBlank` validation annotations.
  - `String password`: Add `@NotBlank` validation annotation.

**`AuthResponse.java`**
- A `record` located in `com.filamentbarbaner.dto`.
- Fields:
  - `String token`: The JWT.
  - `String role`: The user's role (e.g., "ROLE_ADMIN").
  - `long expiresAt`: The token's expiration timestamp in epoch milliseconds.

### 2. JWT Utility (`JwtUtil.java`)

- A class in `com.filamentbarbaner.util` annotated with `@Component`.
- It will manage JWT creation and validation.
- **Configuration Properties:**
  - Inject two properties from `application.properties`:
    - `@Value("${jwt.secret}") private String secretKey;`
    - `@Value("${jwt.expiration}") private long jwtExpiration;`
- **Public Methods:**
  - **`public String generateToken(UserDetails userDetails)`**
    1. Create a `Map<String, Object> claims`.
    2. Extract the user's role from `userDetails.getAuthorities()` and add it to the claims map under the key "role".
    3. Use `io.jsonwebtoken.Jwts.builder()` to construct the token.
    4. Set claims, subject (`userDetails.getUsername()`), issued at date (`new Date(System.currentTimeMillis())`), and expiration date (`new Date(System.currentTimeMillis() + jwtExpiration)`).
    5. Sign the token with `secretKey` using `SignatureAlgorithm.HS256`.
    6. Return the compacted token string.

  - **`public boolean validateToken(String token, UserDetails userDetails)`**
    1. Extract the email from the token using `extractEmail(token)`.
    2. Return `true` if the extracted email equals `userDetails.getUsername()` and the token is not expired (use a private helper method `isTokenExpired`). Otherwise, return `false`.

  - **`public String extractEmail(String token)`**
    1. This is a convenience method for `extractClaim(token, Claims::getSubject)`.

- **Private Helper Methods:**
  - `private Claims extractAllClaims(String token)`: Parses the token with the `secretKey` and returns the claims body.
  - `public <T> T extractClaim(String token, Function<Claims, T> claimsResolver)`: A generic method to extract a specific claim using the provided resolver function.
  - `private Date extractExpiration(String token)`: Extracts the expiration date claim.
  - `private boolean isTokenExpired(String token)`: Checks if the token's expiration date is before the current date.

### 3. Authentication Controller (`AuthController.java`)

- A class in `com.filamentbarbaner.controller` annotated with `@RestController` and `@RequestMapping("/api/v1/auth")`.
- **Dependencies:**
  - Inject `AuthenticationManager`, `JwtUtil`, and `UserDetailsService` (from `shared-backend-core`).
- **API Endpoint:**
  - **`@PostMapping("/login")`
    `public ResponseEntity<AuthResponse> login(@RequestBody @Valid AuthRequest authRequest)`**
    1. **Authentication:**
       - Try to authenticate the user by calling `authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authRequest.email(), authRequest.password()))`.
       - If authentication fails, catch `BadCredentialsException` and return `ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()`.
    2. **Token Generation:**
       - If authentication succeeds, load the `UserDetails` by calling `userDetailsService.loadUserByUsername(authRequest.email())`.
       - Generate a JWT by calling `jwtUtil.generateToken(userDetails)`.
    3. **Response Construction:**
       - Extract the user's role from `userDetails.getAuthorities()`. Take the first authority and get its string representation (e.g., "ROLE_ADMIN").
       - Calculate the expiration timestamp: `System.currentTimeMillis() + jwtExpiration` (get `jwtExpiration` from `JwtUtil` or inject it here as well).
       - Create a new `AuthResponse` with the token, role, and expiration timestamp.
       - Return the `AuthResponse` object with an `OK` status: `ResponseEntity.ok(authResponse)`.

### 4. JWT Authentication Filter (`JwtAuthFilter.java`)

- A class in `com.filamentbarbaner.security` that extends `OncePerRequestFilter` and is annotated with `@Component`.
- **Dependencies:**
  - Inject `JwtUtil` and `UserDetailsService` (from `shared-backend-core`, provided by `UserService`).
- **Core Logic (`doFilterInternal` method):**
  1. Get the `Authorization` header from the `HttpServletRequest`.
  2. Check if the header is `null` or does not start with `"Bearer "`. If so, call `filterChain.doFilter` and return.
  3. Extract the JWT from the header by removing the "Bearer " prefix.
  4. Extract the user's email from the token using `jwtUtil.extractEmail(jwt)`.
  5. If the email is not `null` and `SecurityContextHolder.getContext().getAuthentication()` is `null` (meaning the user is not yet authenticated for this request):
     a. Load `UserDetails` using `userDetailsService.loadUserByUsername(email)`.
     b. Validate the token using `jwtUtil.validateToken(jwt, userDetails)`.
     c. If the token is valid, create a `UsernamePasswordAuthenticationToken` with `userDetails`, `null` for credentials, and `userDetails.getAuthorities()`.
     d. Set the request details on the token: `token.setDetails(new WebAuthenticationDetailsSource().buildDetails(request))`.
     e. Set the authentication object in the security context: `SecurityContextHolder.getContext().setAuthentication(token)`.
  6. Call `filterChain.doFilter(request, response)` to continue the filter chain.

### 5. Spring Security Configuration (`SecurityConfig.java`)

- A class in `com.filamentbarbaner.config` annotated with `@Configuration` and `@EnableWebSecurity`.
- **Dependencies:**
  - Inject `JwtAuthFilter` and `UserDetailsService` (`UserService`).
- **Bean Definitions:**
  - **`@Bean public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception`**
    1. Disable CSRF: `http.csrf(AbstractHttpConfigurer::disable)`.
    2. Configure CORS (a default permissive configuration is acceptable for now).
    3. Configure authorization rules: `http.authorizeHttpRequests(auth -> auth ...)`
       - Permit `POST /api/v1/auth/login`.
       - Permit `POST /api/v1/reservations`.
       - Permit all `GET` requests to `/api/v1/**` (for public content like menu, events).
       - Restrict `/api/v1/admin/**` to users with the `"ADMIN"` role.
       - Require authentication for any other request: `.anyRequest().authenticated()`.
    4. Configure session management to be stateless: `http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))`.
    5. Set the custom authentication provider: `http.authenticationProvider(authenticationProvider())`.
    6. Add the `JwtAuthFilter` before the standard `UsernamePasswordAuthenticationFilter`: `http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)`.
    7. Return `http.build()`.

  - **`@Bean public AuthenticationProvider authenticationProvider()`**
    1. Create a `DaoAuthenticationProvider` instance.
    2. Set the `UserDetailsService` on it.
    3. Set the `PasswordEncoder` on it (by calling the `passwordEncoder()` bean method).
    4. Return the provider.

  - **`@Bean public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception`**
    1. Return `config.getAuthenticationManager()`.

  - **`@Bean public PasswordEncoder passwordEncoder()`**
    1. Return a new `BCryptPasswordEncoder()`.

---

## Menu Management (Core)

**Name:** `menu-management-core`  
**Type:** BACKEND  
**Change required:** true

**Files in this feature:**
- `backend/src/main/java/com/filamentbarbaner/model/MenuItem.java` — MODEL layer - Defines the MenuItem data structure for persistence, including fields like name, price, and category. It imports the MenuItemCategory enum.
- `backend/src/main/java/com/filamentbarbaner/model/MenuItemCategory.java` — MODEL layer - A standalone enum defining the categories for menu items, used by the MenuItem entity to classify products.
- `backend/src/main/java/com/filamentbarbaner/repository/MenuItemRepository.java` — REPOSITORY layer - Provides data access methods for MenuItem entities, including standard CRUD and a custom findByCategory(MenuItemCategory) method.
- `backend/src/main/java/com/filamentbarbaner/service/MenuService.java` — SERVICE layer - Implements business logic for menu management. Key public methods are getAllMenuItems(...), createMenuItem(MenuItemDto), updateMenuItem(UUID, MenuItemDto), and deleteMenuItem(UUID).

**Feature Instruction:**

This feature, `menu-management-core`, establishes the foundational backend logic for managing menu items at Filament Bar. It includes the data model, repository for database interaction, and the service layer for business logic. This feature does not expose any API endpoints itself but provides the service layer for the `menu-management-api` feature.

### 1. Data Model

#### `MenuItemCategory.java`
This file defines the possible categories for a menu item.
- **Package**: `com.filamentbarbaner.model`
- **Type**: `public enum MenuItemCategory`
- **Enum Constants**: Define the following values:
  - `COCKTAILS`
  - `MOCKTAILS`
  - `APPETIZERS`
  - `MAIN_COURSE`

#### `MenuItem.java`
This file defines the JPA entity for a menu item.
- **Package**: `com.filamentbarbaner.model`
- **Annotations**: Annotate the class with `@Entity` and `@Table(name = "menu_items")`.
- **Fields**: Implement the following fields with appropriate JPA annotations. Ensure standard getters, setters, and a no-argument constructor are present.
  - `id`: `private UUID id;`
    - Annotations: `@Id`, `@GeneratedValue(strategy = GenerationType.AUTO)`
  - `name`: `private String name;`
    - Annotation: `@Column(nullable = false, length = 255)`
  - `description`: `private String description;`
    - Annotation: `@Column(columnDefinition = "TEXT")`
  - `price`: `private BigDecimal price;`
    - Annotation: `@Column(nullable = false)`
  - `category`: `private MenuItemCategory category;`
    - Annotations: `@Enumerated(EnumType.STRING)`, `@Column(nullable = false)`
  - `imageUrl`: `private String imageUrl;`
  - `isAvailable`: `private boolean isAvailable = true;`
    - Annotation: `@Column(nullable = false)`

### 2. Repository Layer

#### `MenuItemRepository.java`
This is the Spring Data JPA repository for `MenuItem` entities.
- **Package**: `com.filamentbarbaner.repository`
- **Type**: `public interface MenuItemRepository`
- **Annotation**: `@Repository`
- **Inheritance**: Extend `JpaRepository<MenuItem, UUID>`.
- **Public Methods**:
  - `List<MenuItem> findByCategory(MenuItemCategory category);`
    - This method will be implemented automatically by Spring Data JPA based on its name. It retrieves all menu items matching the given category.

### 3. Service Layer

#### `MenuService.java`
This service contains the business logic for managing menu items. It acts as the bridge between the controllers (from `menu-management-api`) and the repository.

- **Package**: `com.filamentbarbaner.service`
- **Annotation**: `@Service`
- **Dependencies**:
  - Inject `MenuItemRepository` via constructor injection: `private final MenuItemRepository menuItemRepository;`

- **Note on DTOs**: This service operates on `MenuItemDto`, which is defined in another feature. Assume `MenuItemDto` exists in `com.filamentbarbaner.dto` with fields mirroring the `MenuItem` entity (`id`, `name`, `description`, `price`, `category`, `imageUrl`, `isAvailable`). You will need to implement private mapping methods to convert between the entity and the DTO.

- **Mapping Logic**: Create the following private helper methods:
  - `private MenuItemDto toDto(MenuItem menuItem)`: Converts a `MenuItem` entity to a `MenuItemDto`.
  - `private MenuItem toEntity(MenuItemDto menuItemDto)`: Converts a `MenuItemDto` to a `MenuItem` entity.

- **Public Methods**:

  - **`public List<MenuItemDto> getAllMenuItems(Optional<MenuItemCategory> category)`**
    1.  Declare a `List<MenuItem>` named `menuItems`.
    2.  Check if the `category` optional is present.
    3.  If `category.isPresent()`, call `menuItemRepository.findByCategory(category.get())` and assign the result to `menuItems`.
    4.  Otherwise, call `menuItemRepository.findAll()` and assign the result to `menuItems`.
    5.  Map the `menuItems` list to a `List<MenuItemDto>` by streaming it and calling `toDto()` on each element.
    6.  Return the resulting list of DTOs.

  - **`public MenuItemDto createMenuItem(MenuItemDto menuItemDto)`**
    1.  Convert the incoming `menuItemDto` to a `MenuItem` entity using your `toEntity()` helper. Ensure the ID is not set, so it can be generated by the database.
    2.  Save the new entity using `menuItemRepository.save(newMenuItem)`.
    3.  Convert the returned, persisted entity (which now includes the generated ID) back to a `MenuItemDto` using `toDto()`.
    4.  Return the new `MenuItemDto`.

  - **`public Optional<MenuItemDto> updateMenuItem(UUID id, MenuItemDto menuItemDto)`**
    1.  Fetch the existing entity using `menuItemRepository.findById(id)`.
    2.  If the returned `Optional` is empty, return `Optional.empty()` immediately.
    3.  If the entity exists, retrieve it from the `Optional`.
    4.  Update all its fields (`name`, `description`, `price`, `category`, `imageUrl`, `isAvailable`) with the values from the incoming `menuItemDto`.
    5.  Save the updated entity using `menuItemRepository.save(existingMenuItem)`.
    6.  Convert the saved entity to a `MenuItemDto` using `toDto()`.
    7.  Return an `Optional` containing the updated DTO.

  - **`public void deleteMenuItem(UUID id)`**
    1.  Call `menuItemRepository.deleteById(id)`. This method is void and does not throw an exception if the ID is not found.

### Inter-File Wiring
- `MenuService` injects and uses `MenuItemRepository` for all database operations.
- `MenuItemRepository` is a JPA repository for the `MenuItem` entity.
- The `MenuItem` entity uses the `MenuItemCategory` enum for its `category` field.

---

## Menu Management (API)

**Name:** `menu-management-api`  
**Type:** BACKEND  
**Change required:** true

**Files in this feature:**
- `backend/src/main/java/com/filamentbarbaner/controller/MenuController.java` — CONTROLLER layer - Exposes the public, read-only menu API. Its primary method getMenuItems(...) handles GET /api/v1/menu-items requests.
- `backend/src/main/java/com/filamentbarbaner/controller/AdminMenuController.java` — CONTROLLER layer - Exposes the protected CRUD endpoints for menu management under /api/v1/admin/menu-items. All methods are secured with @PreAuthorize("hasRole('ADMIN')").
- `backend/src/main/java/com/filamentbarbaner/dto/MenuItemDto.java` — DTO layer - A record defining the data transfer object for MenuItem, used as the request and response body for both public and admin menu controllers.

**Feature Instruction:**

This feature implements the API for managing the menu at Filament Bar. It consists of a public-facing controller for viewing the menu and a secured admin controller for CRUD operations. It also defines the Data Transfer Object (DTO) used for all menu item interactions.

### 1. MenuItemDto.java

This file defines the `MenuItemDto`, a Java `record` that serves as the data contract for all menu-related API endpoints. It is used as both a request body for creating/updating items and a response body for all menu endpoints.

**File Path:** `backend/src/main/java/com/filamentbarbaner/dto/MenuItemDto.java`

**Implementation Details:**
- Define this as a public `record` named `MenuItemDto`.
- It should have the following components:
  - `UUID id`: The unique identifier. Can be null when creating a new item.
  - `String name`: The name of the menu item. Add `@NotBlank` validation.
  - `String description`: A description of the item.
  - `BigDecimal price`: The price. Add `@NotNull` and `@Positive` validation.
  - `MenuItemCategory category`: The category of the item (e.g., COCKTAILS, APPETIZERS). Add `@NotNull` validation. This type is imported from `com.filamentbarbaner.model.MenuItemCategory`.
  - `String imageUrl`: A URL pointing to an image of the item.
  - `boolean isAvailable`: The availability status of the item.
- Ensure necessary imports for `java.util.UUID`, `java.math.BigDecimal`, `jakarta.validation.constraints.*`, and `com.filamentbarbaner.model.MenuItemCategory`.

### 2. MenuController.java

This is the public-facing REST controller for fetching menu items. It provides a read-only view of the menu.

**File Path:** `backend/src/main/java/com/filamentbarbaner/controller/MenuController.java`

**Implementation Details:**
- Annotate the class with `@RestController` and `@RequestMapping("/api/v1/menu-items")`.
- Inject `MenuService` from the `menu-management-core` feature using constructor injection. The field should be `private final MenuService menuService;`.

**Public Methods:**

- **`getMenuItems(Optional<MenuItemCategory> category)`**
  - **Signature:** `public ResponseEntity<List<MenuItemDto>> getMenuItems(@RequestParam(required = false) Optional<MenuItemCategory> category)`
  - **Mapping:** `@GetMapping`
  - **Logic:**
    1. Call `menuService.getAllMenuItems(category)`. The `category` parameter is an optional query parameter (e.g., `/api/v1/menu-items?category=COCKTAILS`).
    2. The service will return a `List<MenuItemDto>`.
    3. Wrap the list in a `ResponseEntity` with an HTTP 200 OK status using `ResponseEntity.ok()`.

### 3. AdminMenuController.java

This is the admin-only REST controller for creating, updating, and deleting menu items. All endpoints under this controller must be secured and accessible only to users with the 'ADMIN' role.

**File Path:** `backend/src/main/java/com/filamentbarbaner/controller/AdminMenuController.java`

**Implementation Details:**
- Annotate the class with `@RestController` and `@RequestMapping("/api/v1/admin/menu-items")`.
- Secure the entire controller by adding the `@PreAuthorize("hasRole('ADMIN')")` annotation at the class level.
- Inject `MenuService` from the `menu-management-core` feature using constructor injection. The field should be `private final MenuService menuService;`.

**Public Methods:**

- **`createMenuItem(MenuItemDto menuItemDto)`**
  - **Signature:** `public ResponseEntity<MenuItemDto> createMenuItem(@Valid @RequestBody MenuItemDto menuItemDto)`
  - **Mapping:** `@PostMapping`
  - **Logic:**
    1. The `menuItemDto` from the request body is validated using `@Valid`.
    2. Call `menuService.createMenuItem(menuItemDto)` to persist the new menu item.
    3. The service returns the created `MenuItemDto` (including the generated ID).
    4. Return the created DTO in a `ResponseEntity` with an HTTP 201 Created status.

- **`updateMenuItem(UUID id, MenuItemDto menuItemDto)`**
  - **Signature:** `public ResponseEntity<MenuItemDto> updateMenuItem(@PathVariable UUID id, @Valid @RequestBody MenuItemDto menuItemDto)`
  - **Mapping:** `@PutMapping("/{id}")`
  - **Logic:**
    1. The `menuItemDto` from the request body is validated using `@Valid`.
    2. Call `menuService.updateMenuItem(id, menuItemDto)`.
    3. The service returns an `Optional<MenuItemDto>`.
    4. If the `Optional` contains a value, return it in a `ResponseEntity` with an HTTP 200 OK status.
    5. If the `Optional` is empty (meaning no menu item was found for the given `id`), return a `ResponseEntity` with an HTTP 404 Not Found status.

- **`deleteMenuItem(UUID id)`**
  - **Signature:** `public ResponseEntity<Void> deleteMenuItem(@PathVariable UUID id)`
  - **Mapping:** `@DeleteMapping("/{id}")`
  - **Logic:**
    1. Call `menuService.deleteMenuItem(id)`.
    2. The service method returns `void` and will throw an exception if the item doesn't exist, which will be handled by a global exception handler. Assuming successful deletion, proceed to the next step.
    3. Return a `ResponseEntity` with an HTTP 204 No Content status using `ResponseEntity.noContent().build()`.

### Inter-Feature Wiring

- `MenuController` and `AdminMenuController` both inject and call methods on `MenuService`, which is defined in the `menu-management-core` feature.
- The method signatures from `MenuService` that you will call are:
  - `List<MenuItemDto> getAllMenuItems(Optional<MenuItemCategory> category)`
  - `MenuItemDto createMenuItem(MenuItemDto menuItemDto)`
  - `Optional<MenuItemDto> updateMenuItem(UUID id, MenuItemDto menuItemDto)`
  - `void deleteMenuItem(UUID id)`
- All three files in this feature (`MenuController`, `AdminMenuController`, `MenuItemDto`) use or reference types from other features or packages, specifically `MenuItemDto` itself and the `MenuItemCategory` enum from `com.filamentbarbaner.model`.

---

## Reservation System (Core)

**Name:** `reservation-system-core`  
**Type:** BACKEND  
**Change required:** true

**Files in this feature:**
- `backend/src/main/java/com/filamentbarbaner/model/Reservation.java` — MODEL layer - Defines the Reservation data structure for persistence, including customer details, time, and status. It imports the ReservationStatus enum.
- `backend/src/main/java/com/filamentbarbaner/model/ReservationStatus.java` — MODEL layer - A standalone enum defining the lifecycle statuses for a reservation, used by the Reservation entity.
- `backend/src/main/java/com/filamentbarbaner/repository/ReservationRepository.java` — REPOSITORY layer - Provides data access methods for Reservation entities, including standard CRUD and a custom findByReservationTimeBetween(...) method for querying by date.
- `backend/src/main/java/com/filamentbarbaner/service/ReservationService.java` — SERVICE layer - Implements business logic for reservations. Key methods include createReservation(CreateReservationRequest), getAllReservations(), and updateReservationStatus(UUID, ReservationStatus).

**Feature Instruction:**

This feature instruction outlines the implementation of the core reservation system for Filament Bar (Baner). It covers the data model, repository, and service layer for creating and managing reservations.

### 1. Data Transfer Objects (DTOs)

Before implementing the service, create the following DTO classes in the `backend/src/main/java/com/filamentbarbaner/dto/` directory. These are required by the `ReservationService`.

**`CreateReservationRequest.java`**
- A simple POJO with the following fields for incoming reservation requests. Use validation annotations.
- `String customerName` (@NotBlank)
- `String customerEmail` (@NotBlank, @Email)
- `String customerPhone` (@NotBlank)
- `LocalDateTime reservationTime` (@NotNull, @Future)
- `int numberOfGuests` (@Min(1))
- `String specialRequests` (optional, can be null)

**`ReservationResponse.java`**
- A simple POJO to represent reservation data sent back to clients.
- `UUID id`
- `String customerName`
- `String customerEmail`
- `String customerPhone`
- `LocalDateTime reservationTime`
- `int numberOfGuests`
- `ReservationStatus status`
- `String specialRequests`

### 2. Enumeration: ReservationStatus

**File: `backend/src/main/java/com/filamentbarbaner/model/ReservationStatus.java`**

- Create a public enum `ReservationStatus`.
- Define the following enum constants:
  - `PENDING`
  - `CONFIRMED`
  - `CANCELLED`
  - `COMPLETED`

### 3. Entity: Reservation

**File: `backend/src/main/java/com/filamentbarbaner/model/Reservation.java`**

- This class is a JPA entity representing a reservation.
- Annotate the class with `@Entity` and `@Table(name = "reservations")`.
- Use Lombok annotations for boilerplate code: `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`.
- Define the following fields with appropriate JPA annotations:
  - `id`: `UUID`. Annotate with `@Id` and `@GeneratedValue(strategy = GenerationType.AUTO)`. This will be the primary key.
  - `customerName`: `String`. Annotate with `@Column(nullable = false)`.
  - `customerEmail`: `String`. Annotate with `@Column(nullable = false)`.
  - `customerPhone`: `String`. Annotate with `@Column(nullable = false)`.
  - `reservationTime`: `LocalDateTime`. Annotate with `@Column(nullable = false)`.
  - `numberOfGuests`: `int`. Annotate with `@Column(nullable = false)`.
  - `status`: `ReservationStatus`. Annotate with `@Enumerated(EnumType.STRING)` and `@Column(nullable = false)`.
  - `specialRequests`: `String`. This field is optional.

### 4. Repository: ReservationRepository

**File: `backend/src/main/java/com/filamentbarbaner/repository/ReservationRepository.java`**

- Create a public interface `ReservationRepository` that extends `JpaRepository<Reservation, UUID>`.
- Add the following method signature. Spring Data JPA will automatically provide the implementation.
  - `List<Reservation> findByReservationTimeBetween(LocalDateTime start, LocalDateTime end);`

### 5. Service: ReservationService

**File: `backend/src/main/java/com/filamentbarbaner/service/ReservationService.java`**

- Annotate the class with `@Service`.
- Inject `ReservationRepository` via constructor injection.
- Implement a private helper method `toReservationResponse(Reservation reservation)` to map a `Reservation` entity to a `ReservationResponse` DTO. You will also need a helper method `fromRequest(CreateReservationRequest request)` or similar mapping logic.

**Public Method Implementations:**

**`public ReservationResponse createReservation(CreateReservationRequest request)`**
1.  Create a new `Reservation` entity instance.
2.  Map all fields from the `request` DTO to the new entity.
3.  Set the `status` of the new reservation to `ReservationStatus.PENDING`.
4.  Save the entity using `reservationRepository.save(reservation)`.
5.  Map the saved entity (which now has a generated ID) to a `ReservationResponse` DTO using your helper method.
6.  Return the `ReservationResponse` DTO.

**`public List<ReservationResponse> getAllReservations()`**
1.  Call `reservationRepository.findAll()` to retrieve all `Reservation` entities.
2.  Use a stream to map each `Reservation` entity in the list to a `ReservationResponse` DTO.
3.  Collect the results into a `List<ReservationResponse>`.
4.  Return the list.

**`public Optional<ReservationResponse> updateReservationStatus(UUID id, ReservationStatus status)`**
1.  Find the reservation using `reservationRepository.findById(id)`.
2.  If the returned `Optional<Reservation>` is empty, return `Optional.empty()` immediately.
3.  If the reservation is found, get the `Reservation` entity from the Optional.
4.  Update its status using `reservation.setStatus(status)`.
5.  Save the updated entity using `reservationRepository.save(reservation)`.
6.  Map the updated entity to a `ReservationResponse` DTO.
7.  Wrap the DTO in an `Optional` and return it (`Optional.of(responseDto)`).

### Inter-File Wiring

- `ReservationService` depends on and injects `ReservationRepository`.
- `ReservationService` uses `CreateReservationRequest` and `ReservationResponse` DTOs for its public method contracts.
- `ReservationRepository` is an interface for the `Reservation` entity.
- The `Reservation` entity uses the `ReservationStatus` enum for its `status` field.

---

## Reservation System (API)

**Name:** `reservation-system-api`  
**Type:** BACKEND  
**Change required:** true

**Files in this feature:**
- `backend/src/main/java/com/filamentbarbaner/controller/ReservationController.java` — CONTROLLER layer - Exposes the public endpoint for creating reservations. Its primary method submitReservation(...) handles POST /api/v1/reservations requests.
- `backend/src/main/java/com/filamentbarbaner/controller/AdminReservationController.java` — CONTROLLER layer - Exposes protected endpoints for viewing and managing reservations under /api/v1/admin/reservations. All methods are secured with @PreAuthorize("hasRole('ADMIN')").
- `backend/src/main/java/com/filamentbarbaner/dto/CreateReservationRequest.java` — DTO layer - A record defining the request body for the public reservation creation endpoint, with validation annotations for all fields.
- `backend/src/main/java/com/filamentbarbaner/dto/ReservationResponse.java` — DTO layer - A record defining the JSON response for reservation-related endpoints, providing a safe representation of the Reservation entity.

**Feature Instruction:**

This feature implements the API layer for the reservation system, providing public endpoints for creating reservations and admin-only endpoints for managing them. It consists of two controllers and two DTOs. The controllers will delegate all business logic to the `ReservationService` from the `reservation-system-core` feature.

### Data Transfer Objects (DTOs)

**1. `CreateReservationRequest.java`**
This file defines the request body for creating a new reservation.
- Implement this as a Java `record`.
- It must have the following fields with Jakarta Validation annotations:
  - `String customerName`: Must be annotated with `@NotBlank`.
  - `String customerEmail`: Must be annotated with `@NotBlank` and `@Email`.
  - `String customerPhone`: Must be annotated with `@NotBlank`.
  - `LocalDateTime reservationTime`: Must be annotated with `@NotNull` and `@Future`.
  - `int numberOfGuests`: Must be annotated with `@Min(1)`.
  - `String specialRequests`: Optional, no validation needed.

**2. `ReservationResponse.java`**
This file defines the standard JSON response for reservation-related endpoints.
- Implement this as a Java `record`.
- It must have the following fields:
  - `UUID id`
  - `String customerName`
  - `String customerEmail`
  - `String customerPhone`
  - `LocalDateTime reservationTime`
  - `int numberOfGuests`
  - `ReservationStatus status`: This is an enum from `com.filamentbarbaner.model.ReservationStatus` (defined in the `reservation-system-core` feature).
  - `String specialRequests`

### Controllers

**3. `ReservationController.java`**
This controller handles public-facing reservation creation.
- Annotate the class with `@RestController` and `@RequestMapping("/api/v1/reservations")`.
- Inject `ReservationService` from the `com.filamentbarbaner.service` package via constructor injection.
  - `private final ReservationService reservationService;`
- Implement the following method:
  - **`public ResponseEntity<ReservationResponse> submitReservation(@Valid @RequestBody CreateReservationRequest request)`**
    - Annotate this method with `@PostMapping`.
    - **Logic:**
      1. Call `reservationService.createReservation(request)`.
      2. Wrap the returned `ReservationResponse` object in a `ResponseEntity` with HTTP status `201 CREATED`.
    - **Error Handling:** The `@Valid` annotation will automatically trigger validation on the request body. Spring Boot's default exception handler will catch `MethodArgumentNotValidException` and return an HTTP `400 Bad Request` response.

**4. `AdminReservationController.java`**
This controller handles protected, admin-only actions for managing reservations.
- Annotate the class with `@RestController`, `@RequestMapping("/api/v1/admin/reservations")`, and `@PreAuthorize("hasRole('ADMIN')")` to secure all endpoints within it.
- Inject `ReservationService` from the `com.filamentbarbaner.service` package via constructor injection.
  - `private final ReservationService reservationService;`
- To handle the status update request body, define a private static record inside the `AdminReservationController` class: `private static record UpdateStatusRequest(ReservationStatus status) {}`.
- Implement the following methods:
  - **`public ResponseEntity<List<ReservationResponse>> getAllReservations()`**
    - Annotate this method with `@GetMapping`.
    - **Logic:**
      1. Call `reservationService.getAllReservations()`.
      2. Return the resulting `List<ReservationResponse>` in a `ResponseEntity` with HTTP status `200 OK`.

  - **`public ResponseEntity<ReservationResponse> updateReservationStatus(@PathVariable("id") UUID id, @RequestBody UpdateStatusRequest request)`**
    - Annotate this method with `@PutMapping("/{id}/status")`.
    - **Logic:**
      1. Call `reservationService.updateReservationStatus(id, request.status())`. This method from the service returns an `Optional<ReservationResponse>`.
      2. If the `Optional` contains a value, return it in a `ResponseEntity` with HTTP status `200 OK`.
      3. If the `Optional` is empty (indicating the reservation was not found), return an empty `ResponseEntity` with HTTP status `404 Not Found`.

### Cross-Feature Interaction
- Both `ReservationController` and `AdminReservationController` depend on `ReservationService` from the `reservation-system-core` feature.
- Ensure you are calling the correct `ReservationService` methods with the following exact signatures:
  - `ReservationResponse createReservation(CreateReservationRequest request)`
  - `List<ReservationResponse> getAllReservations()`
  - `Optional<ReservationResponse> updateReservationStatus(UUID id, ReservationStatus status)`

---

## Event Management

**Name:** `event-management`  
**Type:** BACKEND  
**Change required:** true

**Files in this feature:**
- `backend/src/main/java/com/filamentbarbaner/model/Event.java` — MODEL layer - Defines the Event data structure for persistence, including fields for the event's name, date, time, and description.
- `backend/src/main/java/com/filamentbarbaner/repository/EventRepository.java` — REPOSITORY layer - Provides data access methods for Event entities, including a custom findAllByEventDateAfter(LocalDate) method to fetch upcoming events.
- `backend/src/main/java/com/filamentbarbaner/service/EventService.java` — SERVICE layer - Implements business logic for events. Key methods are getUpcomingEvents(), createEvent(EventDto), updateEvent(UUID, EventDto), and deleteEvent(UUID).
- `backend/src/main/java/com/filamentbarbaner/controller/EventController.java` — CONTROLLER layer - Exposes the public, read-only events API. Its primary method getUpcomingEvents() handles GET /api/v1/events requests.
- `backend/src/main/java/com/filamentbarbaner/controller/AdminEventController.java` — CONTROLLER layer - Exposes protected CRUD endpoints for event management under /api/v1/admin/events. All methods are secured with @PreAuthorize("hasRole('ADMIN')").
- `backend/src/main/java/com/filamentbarbaner/dto/EventDto.java` — DTO layer - A record defining the data transfer object for Event, used as the request and response body for both public and admin event controllers.

**Feature Instruction:**

This feature implements the full lifecycle for managing events at Filament Bar. It includes a public-facing read-only API for upcoming events and a separate, secured admin API for creating, updating, and deleting events.

### Data Model and DTO

**1. `Event.java` (Entity)**
This is the JPA entity representing an event. Annotate it with `@Entity` and `@Table(name = "events")`. Use Lombok's `@Data`, `@NoArgsConstructor`, and `@AllArgsConstructor` for boilerplate code.

- **`id` (UUID):** The primary key. Annotate with `@Id` and `@GeneratedValue(strategy = GenerationType.AUTO)`.
- **`name` (String):** The event name. Annotate with `@Column(nullable = false)`.
- **`description` (String):** A detailed description. Annotate with `@Column(columnDefinition = "TEXT", nullable = false)`.
- **`eventDate` (LocalDate):** The date of the event. Annotate with `@Column(nullable = false)`.
- **`startTime` (LocalTime):** The start time. Annotate with `@Column(nullable = false)`.
- **`imageUrl` (String):** An optional URL for a promotional image.

**2. `EventDto.java` (Data Transfer Object)**
This is a Java `record` used for API communication. It will contain validation annotations.

- **`id` (UUID):** The event's unique identifier.
- **`name` (String):** Annotate with `@NotBlank`.
- **`description` (String):** Annotate with `@NotBlank`.
- **`eventDate` (LocalDate):** Annotate with `@NotNull` and `@FutureOrPresent`.
- **`startTime` (LocalTime):** Annotate with `@NotNull`.
- **`imageUrl` (String):** Optional image URL.

### Data Access Layer

**3. `EventRepository.java` (Repository)**
This interface handles database operations for the `Event` entity.

- It must extend `JpaRepository<Event, UUID>`.
- Define the following method signature. Spring Data JPA will provide the implementation based on the method name.
  - `List<Event> findAllByEventDateAfter(LocalDate date);`

### Business Logic Layer

**4. `EventService.java` (Service)**
This class contains the core business logic for events. Annotate it with `@Service`.

- **Dependencies:** Inject `EventRepository` via constructor injection.
- **Mapping Logic:** Implement private helper methods to map between `Event` entities and `EventDto` records.
  - `private EventDto toDto(Event event)`
  - `private Event toEntity(EventDto eventDto)`

- **Public Methods:**

  - **`List<EventDto> getUpcomingEvents()`**
    1. Get the current date minus one day to include today's events: `LocalDate.now().minusDays(1)`.
    2. Call `eventRepository.findAllByEventDateAfter()` with this date.
    3. Map the resulting `List<Event>` to a `List<EventDto>` using the `toDto` helper.
    4. Return the list of DTOs.

  - **`EventDto createEvent(EventDto eventDto)`**
    1. Map the incoming `eventDto` to an `Event` entity using the `toEntity` helper.
    2. Save the entity using `eventRepository.save(event)`.
    3. Map the returned (and persisted) `Event` entity back to an `EventDto`.
    4. Return the new `EventDto`.

  - **`Optional<EventDto> updateEvent(UUID id, EventDto eventDto)`**
    1. Find the existing event using `eventRepository.findById(id)`.
    2. If no event is found, return `Optional.empty()`.
    3. If an event is found, update its properties (`name`, `description`, `eventDate`, `startTime`, `imageUrl`) from the `eventDto`.
    4. Save the updated entity using `eventRepository.save()`.
    5. Map the saved entity to an `EventDto` and return it wrapped in `Optional.of()`.

  - **`void deleteEvent(UUID id)`**
    1. Check if an event exists with the given `id` using `eventRepository.existsById(id)`.
    2. If it does not exist, throw a `RuntimeException` (e.g., `EntityNotFoundException`) with a message like "Event not found with id: {id}".
    3. If it exists, call `eventRepository.deleteById(id)`.

### API Layer

**5. `EventController.java` (Public API)**
This controller exposes the public endpoint for fetching events. Annotate with `@RestController` and `@RequestMapping("/api/v1/events")`.

- **Dependencies:** Inject `EventService`.
- **Endpoint:**
  - **`ResponseEntity<List<EventDto>> getUpcomingEvents()`**
    1. Annotate with `@GetMapping`.
    2. Call `eventService.getUpcomingEvents()`.
    3. Return the result with an HTTP 200 OK status using `ResponseEntity.ok()`.

**6. `AdminEventController.java` (Admin API)**
This controller exposes secured endpoints for managing events. Annotate with `@RestController` and `@RequestMapping("/api/v1/admin/events")`.

- **Dependencies:** Inject `EventService`.
- **Security:** Annotate each method with `@PreAuthorize("hasRole('ADMIN')")`.

- **Endpoints:**

  - **`ResponseEntity<EventDto> createEvent(@Valid @RequestBody EventDto eventDto)`**
    1. Annotate with `@PostMapping`.
    2. Call `eventService.createEvent(eventDto)`.
    3. Return the created `EventDto` with an HTTP 201 Created status using `ResponseEntity.status(HttpStatus.CREATED).body(createdEvent)`.

  - **`ResponseEntity<EventDto> updateEvent(@PathVariable UUID id, @Valid @RequestBody EventDto eventDto)`**
    1. Annotate with `@PutMapping("/{id}")`.
    2. Call `eventService.updateEvent(id, eventDto)`.
    3. If the result is present, return it with `ResponseEntity.ok()`.
    4. If the result is empty (event not found), return `ResponseEntity.notFound().build()`.

  - **`ResponseEntity<Void> deleteEvent(@PathVariable UUID id)`**
    1. Annotate with `@DeleteMapping("/{id}")`.
    2. Call `eventService.deleteEvent(id)`.
    3. Return an HTTP 204 No Content status using `ResponseEntity.noContent().build()`.
    4. **Error Handling:** Create a `@ControllerAdvice` or use an existing one to handle the `EntityNotFoundException` thrown by the service, returning an HTTP 404 Not Found response.

---

## Core UI

**Name:** `core-ui`  
**Type:** FRONTEND  
**Change required:** true

**Files in this feature:**
- `frontend/src/api/client.ts` — SERVICE layer - Creates and exports a singleton Axios instance. It configures the baseURL from VITE_API_URL and adds an interceptor to inject the JWT 'Authorization' header.
- `frontend/src/App.tsx` — PAGE layer - The application's entry point, responsible for setting up the main context providers (QueryClientProvider, AuthProvider) and defining all application routes using react-router-dom.
- `frontend/src/components/Layout.tsx` — COMPONENT layer - Provides the consistent page structure for the application, rendering the Header, Footer, and an SEO component around the main page content.
- `frontend/src/components/Header.tsx` — COMPONENT layer - Renders the site-wide navigation bar, including the logo and links to Home, Menu, Events, and Reservations. Implements mobile-first responsive behavior for the navigation menu.
- `frontend/src/components/Footer.tsx` — COMPONENT layer - Renders the site-wide footer, containing contact information, address, social media links, and copyright notice.
- `frontend/src/components/Seo.tsx` — COMPONENT layer - Implements the 'Schema Markup for Local Business SEO' feature by rendering a <script type="application/ld+json"> tag with structured data about the bar.
- `frontend/src/pages/HomePage.tsx` — PAGE layer - The main landing page, structured with a sophisticated dark hero section, a grid of featured items, and a call-to-action for reservations, reflecting the design direction.
- `frontend/src/pages/ContactPage.tsx` — PAGE layer - Displays contact information and implements the 'Click-to-Call' and 'Google Maps Integration' features.

**Feature Instruction:**

### Feature: Core UI

This feature establishes the foundational user interface for the Filament Bar application. It includes the main application shell, layout components (header, footer), core pages (Home, Contact), API client configuration, and the primary routing structure.

#### File: `frontend/src/api/client.ts`

This file configures and exports a singleton Axios instance for all API communication.

**Variable: `apiClient`**
- **Type**: `AxiosInstance`
- **Logic**:
  1. Create an Axios instance using `axios.create()`.
  2. Configure the `baseURL` by reading the `VITE_API_URL` environment variable from `import.meta.env`.
  3. Add a request interceptor to the instance.
  4. Inside the interceptor's success callback, retrieve the JWT token from `localStorage.getItem('authToken')`.
  5. If a token exists, add an `Authorization` header to the request config: `config.headers.Authorization = `Bearer ${token}`;`.
  6. Return the modified config.
  7. Export the configured instance as `apiClient`.

#### File: `frontend/src/components/Seo.tsx`

This component injects LocalBusiness schema.org JSON-LD markup for SEO purposes.

**Component: `Seo`**
- **Signature**: `(): JSX.Element`
- **Logic**:
  1. Define a JavaScript object `schemaData` with the following structure and content for "Filament Bar (Baner)":
     ```

json
     {
       "@context": "https://schema.org",
       "@type": "BarOrPub",
       "name": "Filament Bar (Baner)",
       "address": {
         "@type": "PostalAddress",
         "streetAddress": "123 High Street, Baner",
         "addressLocality": "Pune",
         "postalCode": "411045",
         "addressRegion": "MH",
         "addressCountry": "IN"
       },
       "telephone": "+91-9876543210",
       "email": "contact@filamentbar.com",
       "url": "https://www.filamentbar.com",
       "image": "/path/to/logo-or-hero-image.jpg",
       "priceRange": "₹₹",
       "servesCuisine": "Cocktails, Continental",
       "openingHoursSpecification": [
         {
           "@type": "OpeningHoursSpecification",
           "dayOfWeek": [
             "Monday",
             "Tuesday",
             "Wednesday",
             "Thursday",
             "Sunday"
           ],
           "opens": "18:00",
           "closes": "23:59"
         },
         {
           "@type": "OpeningHoursSpecification",
           "dayOfWeek": [
             "Friday",
             "Saturday"
           ],
           "opens": "18:00",
           "closes": "01:30"
         }
       ]
     }
     

```
  2. Render a `<script>` tag of type `application/ld+json`.
  3. Use `dangerouslySetInnerHTML` on the script tag to inject the `schemaData` object after converting it to a JSON string with `JSON.stringify()`.
  4. The component should return `null` or be wrapped in a fragment as it produces no visible output.

#### File: `frontend/src/components/Header.tsx`

This component renders the main navigation bar for the application.

**Component: `Header`**
- **Signature**: `(): JSX.Element`
- **Styling**:
  - The header element should have a dark background: `bg-[#1A1A1A]`.
  - All text links should be `text-[#F5F5F5]`.
  - Use `react-router-dom`'s `NavLink` component for navigation links.
  - The active `NavLink` should have the accent color `text-[#FFB800]`.
- **Structure & Logic**:
  1. Create a state variable `isMenuOpen` (boolean, default `false`) to manage the mobile menu visibility.
  2. The main container should be a `<header>` tag with `bg-[#1A1A1A]` and padding.
  3. Inside, use a flex container to align items: the logo on the left, navigation in the center, and a mobile menu button on the right.
  4. **Logo**: Display "Filament" as text or an SVG logo, linking to the home page (`/`).
  5. **Desktop Navigation**: For screen sizes `md` and above, display a list of `NavLink` components for: `Home (/)`, `Menu (/menu)`, `Events (/events)`, `Reservations (/reservations)`, `Contact (/contact)`.
  6. **Mobile Menu Button**: For screen sizes below `md`, display a hamburger menu icon button. Its `onClick` handler should toggle the `isMenuOpen` state.
  7. **Mobile Navigation Menu**: Render this section conditionally based on `isMenuOpen`. It should be a full-width dropdown or overlay below the header, displaying the same navigation links as the desktop version, stacked vertically.

#### File: `frontend/src/components/Footer.tsx`

This component renders the site-wide footer.

**Component: `Footer`**
- **Signature**: `(): JSX.Element`
- **Styling**:
  - The footer element should have a dark background `bg-[#1A1A1A]` and light text `text-[#F5F5F5]`.
- **Structure & Logic**:
  1. The main container is a `<footer>` tag with `bg-[#1A1A1A]` and appropriate padding.
  2. Use a grid or flexbox layout to create three columns.
  3. **Column 1: Contact Info**
     - Heading: "Contact Us"
     - Address: "123 High Street, Baner, Pune, 411045"
     - Phone: "+91-9876543210"
     - Email: "contact@filamentbar.com"
  4. **Column 2: Quick Links**
     - Heading: "Navigate"
     - A list of links to the main pages: Home, Menu, Events, Reservations, Contact.
  5. **Column 3: Social Media**
     - Heading: "Follow Us"
     - A row of social media icons (e.g., from `react-icons`) for Facebook, Instagram, and Twitter, each wrapped in an `<a>` tag pointing to a placeholder URL.
  6. Below the columns, add a full-width section with a horizontal rule and the copyright notice: "© {new Date().getFullYear()} Filament Bar. All rights reserved."

#### File: `frontend/src/components/Layout.tsx`

This component provides a consistent page structure by wrapping page content with the `Header` and `Footer`.

**Component: `Layout`**
- **Signature**: `({ children: React.ReactNode }): JSX.Element`
- **Logic**:
  1. Render a `<div>` as the root container.
  2. Render the `<Seo />` component.
  3. Render the `<Header />` component.
  4. Render a `<main>` element that contains the `children` prop.
  5. Render the `<Footer />` component.

#### File: `frontend/src/pages/HomePage.tsx`

This is the main landing page for Filament Bar.

**Component: `HomePage`**
- **Signature**: `(): JSX.Element`
- **Logic**:
  1. Wrap the entire page content in the `<Layout>` component.
  2. **Hero Section**:
     - A full-width section with a dark, high-quality background image of a cocktail or the bar's interior.
     - An overlay with `bg-black/60` for text readability.
     - A central content block with:
       - `h1` heading: "Experience the Spark." with `text-[#F5F5F5]`.
       - `p` subheading: "Craft Cocktails & Live Music in the Heart of Baner." with `text-[#F5F5F5]`.
       - A call-to-action button styled with `bg-[#FFB800]` and `text-[#1A1A1A]`, reading "Book Your Table", which navigates to `/reservations`.
  3. **Featured Cocktails Section**:
     - A section with a heading `h2`: "Our Signature Creations".
     - A grid layout displaying 3-4 placeholder cocktail cards. Each card should have:
       - An image of a cocktail.
       - A name (e.g., "The Filament", "Electric Elixir").
       - A brief description.
  4. **Upcoming Events Preview Section**:
     - A section with a heading `h2`: "This Week at Filament".
     - A paragraph inviting users to see the full schedule: "From live jazz to DJ nights, there's always a vibe. Check our events page for the latest lineup."
     - A button styled with `border border-[#FFB800]` and `text-[#FFB800]` reading "See All Events", which navigates to `/events`.

#### File: `frontend/src/pages/ContactPage.tsx`

This page displays contact information and a map.

**Component: `ContactPage`**
- **Signature**: `(): JSX.Element`
- **Logic**:
  1. Wrap the entire page content in the `<Layout>` component.
  2. Create a main container with a heading `h1`: "Get In Touch".
  3. Use a two-column layout.
  4. **Left Column: Contact Details**
     - **Address**: Display the full address.
     - **Phone**: Display the phone number inside an `<a>` tag with `href="tel:+919876543210"`. This enables the click-to-call feature. Add text like "(Click to Call)".
     - **Email**: Display the email address.
     - **Opening Hours**: List the opening hours for each day of the week.
  5. **Right Column: Google Map**
     - Embed a Google Map using an `<iframe>`. The `src` should point to the location of Filament Bar (Baner). Use a placeholder URL if the exact one is not available.

#### File: `frontend/src/App.tsx`

This is the root component of the application, responsible for setting up providers and routing.

**Component: `App`**
- **Signature**: `(): JSX.Element`
- **Logic**:
  1. Import necessary components: `BrowserRouter`, `Routes`, `Route` from `react-router-dom`; `QueryClient`, `QueryClientProvider` from `@tanstack/react-query`; `AuthProvider` from `frontend/src/context/AuthContext.tsx`; `ProtectedRoute` from `frontend/src/components/ProtectedRoute.tsx`; and all page components.
  2. Instantiate a new `QueryClient`.
  3. The top-level component should be `BrowserRouter`.
  4. Inside `BrowserRouter`, wrap the application with `QueryClientProvider`, passing the client instance.
  5. Inside `QueryClientProvider`, wrap the application with `AuthProvider` (imported from the `auth-ui` feature).
  6. Inside `AuthProvider`, define the application's routes using the `Routes` component.
  7. **Route Definitions**:
     - `<Route path="/" element={<HomePage />} />`
     - `<Route path="/menu" element={<MenuPage />} />` (from `menu-ui`)
     - `<Route path="/reservations" element={<ReservationPage />} />` (from `reservation-booking`)
     - `<Route path="/events" element={<EventsPage />} />` (from `events-calendar`)
     - `<Route path="/contact" element={<ContactPage />} />`
     - `<Route path="/login" element={<LoginPage />} />` (from `auth-ui`)
     - `<Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />` (from `auth-ui`)

---

## Authentication UI

**Name:** `auth-ui`  
**Type:** FRONTEND  
**Change required:** true

**Files in this feature:**
- `frontend/src/context/AuthContext.tsx` — CONTEXT layer - Manages global authentication state (token, role) using localStorage and provides functions like login, logout, isAuthenticated, and isAdmin to the entire application.
- `frontend/src/hooks/useAuth.ts` — HOOK layer - A simple custom hook that provides a clean interface for components to consume the AuthContext via `const auth = useAuth()`.
- `frontend/src/services/authService.ts` — SERVICE layer - Handles HTTP communication for authentication. Its primary public function is login(credentials): Promise<AuthResponse>, which calls the POST /api/v1/auth/login endpoint.
- `frontend/src/components/ProtectedRoute.tsx` — COMPONENT layer - A route wrapper that uses the useAuth hook to check for authentication. If the user is not authenticated, it redirects to '/login'.
- `frontend/src/pages/LoginPage.tsx` — PAGE layer - Provides the UI for admin login. It uses react-hook-form and zod for validation and calls the login function from the useAuth hook on submission.
- `frontend/src/pages/AdminDashboardPage.tsx` — PAGE layer - The central hub for the admin portal, featuring a sidebar with navigation links to /admin/menu, /admin/reservations, and /admin/events.

**Feature Instruction:**

This feature implements the complete frontend authentication flow for the Filament Bar admin portal. It includes a login page, a protected admin dashboard, and the underlying services and context for managing authentication state.

### Shared Data Types

First, define these shared types, likely in a `frontend/src/types/auth.ts` file or directly within the files that use them.

**`AuthRequest`**: Represents the credentials sent to the login endpoint.
```

typescript
export interface AuthRequest {
  email: string;
  password: string;
}


```

**`AuthResponse`**: Represents the data received from the backend upon successful login.
```

typescript
export interface AuthResponse {
  token: string;
  role: string;
}


```

**`AuthContextType`**: Defines the shape of the authentication context provided to the application.
```

typescript
export interface AuthContextType {
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: AuthRequest) => Promise<void>;
  logout: () => void;
}


```

--- 

### 1. Service Layer: `frontend/src/services/authService.ts`

This file handles communication with the backend authentication API.

**Dependencies:**
- Import `apiClient` from `frontend/src/api/client.ts`.
- Import `AuthRequest` and `AuthResponse` types.

**Public Functions:**

**`login(credentials: AuthRequest): Promise<AuthResponse>`**
1.  Make a POST request to the backend API endpoint `/api/v1/auth/login` using the `apiClient`.
2.  Pass the `credentials` object as the request body.
3.  The `apiClient` is expected to handle standard HTTP errors.
4.  On a successful response (HTTP 200), return the response data which will be of type `AuthResponse`.

### 2. Context Layer: `frontend/src/context/AuthContext.tsx`

This file creates and manages the global authentication state.

**Dependencies:**
- `React`, `createContext`, `useState`, `useEffect`, `useMemo`.
- `authService` from `frontend/src/services/authService.ts`.
- `AuthRequest`, `AuthResponse`, `AuthContextType` types.

**Implementation Details:**
1.  Create a `AuthContext` using `createContext<AuthContextType | undefined>(undefined)`.

2.  **`AuthProvider({ children: React.ReactNode }): JSX.Element`**
    -   **State Management:**
        -   `const [token, setToken] = useState<string | null>(null);`
        -   `const [role, setRole] = useState<string | null>(null);`
        -   `const [isLoading, setIsLoading] = useState<boolean>(true);` // Start as true to check localStorage

    -   **Initialization `useEffect`:**
        -   Create a `useEffect` hook that runs once on component mount (`[]` dependency array).
        -   Inside, try to retrieve `'token'` and `'role'` from `localStorage`.
        -   If a token is found, set the `token` and `role` state with these values.
        -   Set `isLoading` to `false` after checking `localStorage`.

    -   **`login` function:**
        -   `async function login(credentials: AuthRequest): Promise<void>`
        -   **Logic:**
            1.  Set `isLoading(true)`.
            2.  Wrap the API call in a `try...catch...finally` block.
            3.  **`try`**: Call `authService.login(credentials)`.
            4.  On success, destructure `token` and `role` from the response.
            5.  Update state: `setToken(token)` and `setRole(role)`.
            6.  Persist to storage: `localStorage.setItem('token', token)` and `localStorage.setItem('role', role)`.
            7.  **`catch`**: If an error occurs, log it and re-throw it so the UI layer can handle it.
            8.  **`finally`**: Set `isLoading(false)`.

    -   **`logout` function:**
        -   `function logout(): void`
        -   **Logic:**
            1.  Set state to null: `setToken(null)` and `setRole(null)`.
            2.  Clear from storage: `localStorage.removeItem('token')` and `localStorage.removeItem('role')`.

    -   **Derived State with `useMemo`:**
        -   `const isAuthenticated = useMemo(() => !!token, [token]);`
        -   `const isAdmin = useMemo(() => isAuthenticated && role === 'ADMIN', [isAuthenticated, role]);`

    -   **Context Provider Value:**
        -   Create a `value` object containing `token`, `role`, `isAuthenticated`, `isAdmin`, `isLoading`, `login`, and `logout`.
        -   Return `<AuthContext.Provider value={value}>{children}</AuthContext.Provider>`.

### 3. Hook Layer: `frontend/src/hooks/useAuth.ts`

This custom hook simplifies access to the `AuthContext`.

**Dependencies:**
- `useContext` from `React`.
- `AuthContext` from `frontend/src/context/AuthContext.tsx`.

**Public Functions:**

**`useAuth(): AuthContextType`**
1.  Get the context using `const context = useContext(AuthContext);`.
2.  If `context` is `undefined`, throw an error: `'useAuth must be used within an AuthProvider'`.
3.  Return the `context`.

### 4. Component Layer: `frontend/src/components/ProtectedRoute.tsx`

This component guards routes that require authentication.

**Dependencies:**
- `Navigate`, `useLocation` from `react-router-dom`.
- `useAuth` from `frontend/src/hooks/useAuth.ts`.

**Public Functions:**

**`ProtectedRoute({ children: JSX.Element }): JSX.Element`**
1.  Get authentication state using `const { isAuthenticated, isLoading } = useAuth();`.
2.  Get the current location: `const location = useLocation();`.
3.  If `isLoading` is `true`, return a loading spinner or null to prevent rendering before auth state is confirmed.
4.  If `isAuthenticated` is `false`, return `<Navigate to="/login" state={{ from: location }} replace />`.
5.  If `isAuthenticated` is `true`, render the `children`.

### 5. Page Layer: `frontend/src/pages/LoginPage.tsx`

This page provides the user interface for admin login.

**Dependencies:**
- `useAuth` from `frontend/src/hooks/useAuth.ts`.
- `useNavigate` from `react-router-dom`.
- `useForm` from `react-hook-form`.
- `zod` and `zodResolver` for validation.
- `useState` for handling login errors.

**Implementation Details:**
1.  **Form Schema:** Define a Zod schema for validation:
    ```

typescript
    const loginSchema = z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required'),
    });
    type LoginFormValues = z.infer<typeof loginSchema>;
    

```
2.  **Component Logic:**
    -   `const { login, isAuthenticated } = useAuth();`
    -   `const navigate = useNavigate();`
    -   `const [loginError, setLoginError] = useState<string | null>(null);`
    -   Initialize `react-hook-form` using `zodResolver(loginSchema)`.
    -   If `isAuthenticated` is true, use `useEffect` to `navigate('/admin/dashboard', { replace: true });`.
3.  **Submit Handler `onSubmit(data: LoginFormValues)`:**
    -   Set `loginError(null)`.
    -   Call `await login(data)`.
    -   After successful login, `react-router-dom` will automatically redirect from the `ProtectedRoute` or you can navigate manually to `/admin/dashboard`.
    -   In a `catch` block, set `setLoginError('Invalid email or password. Please try again.');`.
4.  **UI (JSX):**
    -   The page should have a dark background: `bg-[#1A1A1A] text-[#F5F5F5]`.
    -   Render a centered form container.
    -   Use a heading like `<h1>Filament Bar Admin Login</h1>`.
    -   The form should contain two controlled input fields for `email` and `password` registered with `react-hook-form`.
    -   Display validation errors for each field.
    -   Display the `loginError` message if it exists.
    -   The submit button should say "Log In" and have an accent background: `bg-[#FFB800] text-[#1A1A1A]`.
    -   Disable the button while the form is submitting (`formState.isSubmitting`).

### 6. Page Layer: `frontend/src/pages/AdminDashboardPage.tsx`

This is the main hub for authenticated administrators.

**Dependencies:**
- `Link` from `react-router-dom`.
- `useAuth` from `frontend/src/hooks/useAuth.ts`.

**Public Functions:**

**`AdminDashboardPage(): JSX.Element`**
1.  Get the `logout` function: `const { logout } = useAuth();`
2.  **Layout:**
    -   Use a two-column layout (e.g., using Flexbox or Grid).
    -   The main container should have a dark background: `bg-[#1A1A1A] text-[#F5F5F5]`.
    -   **Sidebar (Left Column):**
        -   A vertical navigation menu with a slightly darker background.
        -   Include `Link` components for navigation:
            -   `<Link to="/admin/menu">Manage Menu</Link>`
            -   `<Link to="/admin/reservations">Manage Reservations</Link>`
            -   `<Link to="/admin/events">Manage Events</Link>`
        -   Style links with hover effects, e.g., `hover:text-[#FFB800]`.
        -   Include a "Logout" button at the bottom of the sidebar that calls the `logout` function on click.
    -   **Main Content (Right Column):**
        -   Display a welcome heading: `<h1>Admin Dashboard</h1>`.
        -   Include placeholder text: `Welcome to the Filament Bar administration panel. Select an option from the sidebar to get started.`

### Integration

To make this feature work, the main application component (`App.tsx` from `core-ui`) must be updated:
1.  Wrap the entire application's routes within the `<AuthProvider>`.
2.  Define the admin routes (e.g., `/admin/dashboard`, `/admin/menu`, etc.) and wrap each of them with the `<ProtectedRoute>` component.

Example Route Structure in `App.tsx`:
```

jsx
<AuthProvider>
  <Routes>
    {/* Public Routes */}
    <Route path="/login" element={<LoginPage />} />

    {/* Protected Admin Routes */}
    <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
    {/* ... other admin routes ... */}
  </Routes>
</AuthProvider>


```

---

## Menu UI

**Name:** `menu-ui`  
**Type:** FRONTEND  
**Change required:** true

**Files in this feature:**
- `frontend/src/pages/MenuPage.tsx` — PAGE layer - The customer-facing menu page. It uses the useMenu hook to fetch and display menu items, providing UI for category filtering and showing loading/error states.
- `frontend/src/hooks/useMenu.ts` — HOOK layer - Abstracts data fetching and state management for the menu. Its primary export is useMenuItems(category?), which calls the menuService and manages state via @tanstack/react-query.
- `frontend/src/services/menuService.ts` — SERVICE layer - Handles public HTTP communication for the menu. Its primary function is getMenuItems(category?): Promise<MenuItemDto[]>, which calls the GET /api/v1/menu-items endpoint.
- `frontend/src/pages/AdminMenuPage.tsx` — PAGE layer - Provides the admin UI for menu management, including a table of all items and forms (in modals) for creating and editing items, with client-side validation using zod.
- `frontend/src/services/adminMenuService.ts` — SERVICE layer - Handles protected HTTP communication for menu management. It provides createMenuItem, updateMenuItem, and deleteMenuItem functions that call the corresponding admin endpoints.

**Feature Instruction:**

### Feature: Menu UI

This feature implements the user interface for both the public-facing menu and the administrative menu management dashboard for Filament Bar. It includes services for API communication, a React Query hook for data fetching, and two page components.

#### **1. Shared Types**

First, create a new file `frontend/src/types/menu.ts` to define shared types for this feature. This will ensure consistency.

**`frontend/src/types/menu.ts`**
```

typescript
export enum MenuItemCategory {
  COCKTAIL = 'COCKTAIL',
  MOCKTAIL = 'MOCKTAIL',
  SMALL_PLATE = 'SMALL_PLATE',
  MAIN_COURSE = 'MAIN_COURSE',
  DESSERT = 'DESSERT',
}

export interface MenuItemDto {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuItemCategory;
  imageUrl: string;
}


```

--- 

### **Part A: Public Menu Display**

This part covers fetching and displaying the menu for customers.

#### **2. `frontend/src/services/menuService.ts`**

This service handles public API calls to fetch menu data.

- **Dependencies:** Import the `apiClient` from `frontend/src/api/client.ts` and `MenuItemDto` from `frontend/src/types/menu.ts`.

- **`getMenuItems(category?: string): Promise<MenuItemDto[]>`**
  1.  Make a GET request to `/api/v1/menu-items` using the `apiClient`.
  2.  If the `category` parameter is provided, pass it as a URL query parameter (e.g., `/api/v1/menu-items?category=COCKTAIL`).
  3.  The request will return a list of `MenuItemDto` objects.
  4.  Return the `data` property from the axios response.

#### **3. `frontend/src/hooks/useMenu.ts`**

This custom hook abstracts the menu data fetching logic using React Query.

- **Dependencies:** Import `useQuery` from `@tanstack/react-query` and `getMenuItems` from `frontend/src/services/menuService.ts`.

- **`useMenuItems(category?: string): { data, isLoading, isError }`**
  1.  Call `useQuery` from `@tanstack/react-query`.
  2.  Set the `queryKey` to `['menuItems', category || 'all']`. This ensures that queries are cached separately for each category.
  3.  Set the `queryFn` to an anonymous function that calls `getMenuItems(category)`.
  4.  Return the object `{ data, isLoading, isError }` provided by `useQuery`.

#### **4. `frontend/src/pages/MenuPage.tsx`**

This page component renders the public-facing menu.

- **Dependencies:** Import `React`, `useState` from 'react', `Layout` from `frontend/src/components/Layout.tsx`, `useMenuItems` from `frontend/src/hooks/useMenu.ts`, and `MenuItemCategory` from `frontend/src/types/menu.ts`.

- **Component: `MenuPage(): JSX.Element`**
  1.  Use `useState<MenuItemCategory | undefined>(undefined)` to manage the currently selected category filter. Let's call the state `selectedCategory` and setter `setSelectedCategory`.
  2.  Call `const { data: menuItems, isLoading, isError } = useMenuItems(selectedCategory);` to fetch the menu items.
  3.  Wrap the entire page content in the `<Layout>` component.
  4.  **Design & Content:** The page should have a sophisticated, dark theme.
      - **Main Container:** Use `className="bg-[#1A1A1A] text-[#F5F5F5] min-h-screen"`.
      - **Header Section:** Inside a `py-16 text-center` container, add:
          - `h1` with text "Our Menu" and a subheading `p` with text "Crafted Cocktails & Culinary Delights for the Discerning Palate."
      - **Category Filters:**
          - Render a `div` containing filter buttons for each value in `MenuItemCategory`, plus an "All" button.
          - The active button should have styles like `bg-[#FFB800] text-[#1A1A1A]`. Inactive buttons should have `border border-[#FFB800] text-[#FFB800]`.
          - The `onClick` handler for each button should call `setSelectedCategory` with the corresponding category value (or `undefined` for "All").
      - **Menu Grid:**
          - If `isLoading`, display a loading spinner or skeleton loaders.
          - If `isError`, display an error message: "Could not load the menu at this time. Please try again later."
          - If `menuItems` is available, render a responsive grid (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`).
          - Map over the `menuItems` array and render a card for each item.
      - **Menu Item Card:**
          - A `div` with `bg-[#1c1c1e] rounded-lg overflow-hidden shadow-lg`.
          - An `img` tag for `item.imageUrl` with `className="w-full h-48 object-cover"`.
          - A `div` for content with padding.
          - `h3` for `item.name` with `className="text-xl font-bold text-[#FFB800]"`.
          - `p` for `item.description` with `className="text-sm text-gray-300 mt-2"`.
          - `p` for `item.price` formatted as `₹{item.price.toFixed(2)}` with `className="text-lg font-semibold text-[#00A9FF] mt-4"`.

--- 

### **Part B: Admin Menu Management**

This part covers the admin dashboard for CRUD operations on menu items.

#### **5. `frontend/src/services/adminMenuService.ts`**

This service handles authenticated API calls for menu management.

- **Dependencies:** Import `apiClient` and `MenuItemDto`.

- **`createMenuItem(item: MenuItemDto): Promise<MenuItemDto>`**
  1.  Makes a `POST` request to `/api/v1/admin/menu-items` with `item` as the request body.
  2.  Returns the created `MenuItemDto` from the response data.

- **`updateMenuItem(id: string, item: MenuItemDto): Promise<MenuItemDto>`**
  1.  Makes a `PUT` request to `/api/v1/admin/menu-items/{id}` with `item` as the request body.
  2.  Returns the updated `MenuItemDto` from the response data.

- **`deleteMenuItem(id: string): Promise<void>`**
  1.  Makes a `DELETE` request to `/api/v1/admin/menu-items/{id}`.
  2.  Returns `void`.

#### **6. `frontend/src/pages/AdminMenuPage.tsx`**

This page provides the UI for admins to manage the menu.

- **Dependencies:** Import React hooks (`useState`, `useEffect`), React Query hooks (`useQueryClient`, `useMutation`), `useMenuItems` from `frontend/src/hooks/useMenu.ts`, all functions from `frontend/src/services/adminMenuService.ts`, and `MenuItemDto` and `MenuItemCategory` types.

- **Component: `AdminMenuPage(): JSX.Element`**
  1.  **Data Fetching:**
      - Use `const { data: menuItems, isLoading } = useMenuItems();` to fetch all menu items.
      - Get the `queryClient` instance using `useQueryClient()`.
  2.  **State Management:**
      - Use `useState` to manage the state of a modal for creating/editing items (e.g., `isModalOpen`).
      - Use `useState` to hold the menu item currently being edited (e.g., `editingItem: MenuItemDto | null`).
  3.  **Mutations:**
      - **Create:** `const createMutation = useMutation({ mutationFn: createMenuItem, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menuItems'] }) });`
      - **Update:** `const updateMutation = useMutation({ mutationFn: (variables: { id: string; item: MenuItemDto }) => updateMenuItem(variables.id, variables.item), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menuItems'] }) });`
      - **Delete:** `const deleteMutation = useMutation({ mutationFn: deleteMenuItem, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menuItems'] }) });`
  4.  **UI Structure:**
      - The page should be wrapped in an admin layout or the standard `Layout`.
      - Display a heading: "Menu Management".
      - A "Create New Item" button that opens the modal for creation (`setEditingItem(null); setIsModalOpen(true);`).
      - Display a data table (e.g., using `@tanstack/react-table`) of `menuItems`.
      - **Table Columns:** Name, Category, Price, Actions.
      - **Actions Column:** Should contain an "Edit" button and a "Delete" button for each row.
          - **Edit Button:** `onClick` should open the modal with the form pre-filled for that item (`setEditingItem(item); setIsModalOpen(true);`).
          - **Delete Button:** `onClick` should call `deleteMutation.mutate(item.id)`, preferably after a confirmation dialog.
  5.  **Create/Edit Modal Form:**
      - Use a library like `react-hook-form` with `zod` for validation.
      - The form should have input fields for `name` (text), `description` (textarea), `price` (number), `imageUrl` (text), and a `<select>` dropdown for `category` populated from `MenuItemCategory` enum.
      - The form's `onSubmit` handler should check if `editingItem` exists.
          - If it exists, call `updateMutation.mutate({ id: editingItem.id, item: formData })`.
          - If not, call `createMutation.mutate(formData)`.
      - On successful submission, close the modal.

### **Wiring Summary**

- **Public Flow:** `MenuPage` calls `useMenuItems`, which calls `getMenuItems` in `menuService`, which makes a `GET` request to `/api/v1/menu-items`.
- **Admin Flow:** `AdminMenuPage` calls `useMenuItems` for data. Its buttons trigger `useMutation` hooks that call functions in `adminMenuService` (`createMenuItem`, `updateMenuItem`, `deleteMenuItem`), which in turn make `POST`, `PUT`, and `DELETE` requests to `/api/v1/admin/menu-items`.

---

## Reservation Booking UI

**Name:** `reservation-booking`  
**Type:** FRONTEND  
**Change required:** true

**Files in this feature:**
- `frontend/src/pages/ReservationPage.tsx` — PAGE layer - The customer-facing reservation page. It provides a form for booking a table and uses the createReservation mutation from the useReservations hook to submit the data.
- `frontend/src/hooks/useReservations.ts` — HOOK layer - Abstracts the logic for creating a reservation. Its primary export is useCreateReservation(), which returns a mutation function from @tanstack/react-query that calls the reservationService.
- `frontend/src/services/reservationService.ts` — SERVICE layer - Handles public HTTP communication for reservations. Its primary function is createReservation(data): Promise<ReservationResponse>, which calls the POST /api/v1/reservations endpoint.
- `frontend/src/pages/AdminReservationsPage.tsx` — PAGE layer - Provides the admin UI for reservation management, including a data table of all reservations and controls to update the status of each (e.g., from PENDING to CONFIRMED).
- `frontend/src/services/adminReservationService.ts` — SERVICE layer - Handles protected HTTP communication for reservation management. Provides getAllReservations() and updateReservationStatus(id, status) functions that call the corresponding admin endpoints.

**Feature Instruction:**

This feature implements the complete reservation booking experience for Filament Bar, including a public-facing booking form and an admin-only management dashboard.

### Shared Data Structures

First, let's define the core data types that will be used across the feature. These should be defined in a central types file (e.g., `frontend/src/types/reservation.ts`) or at the top of the service files where they are first used.

```

typescript
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface CreateReservationRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  reservationTime: string; // ISO 8601 format (e.g., '2024-09-15T19:30:00')
  partySize: number;
  specialRequests?: string;
}

export interface ReservationResponse {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  reservationTime: string; // ISO 8601 format
  partySize: number;
  status: ReservationStatus;
  specialRequests?: string;
}


```

--- 

### Part 1: Public Reservation Booking Flow

This flow allows customers to submit a reservation request through a public form.

#### `frontend/src/services/reservationService.ts`

This service handles communication with the public reservation API.

- **Imports**: Import the pre-configured `apiClient` from `frontend/src/api/client.ts`.
- **`createReservation(data: CreateReservationRequest): Promise<ReservationResponse>`**: 
  1. This asynchronous function takes one argument, `data`, which is an object conforming to the `CreateReservationRequest` interface.
  2. It makes a `POST` request to the `/api/v1/reservations` endpoint using the `apiClient`.
  3. The `data` object is sent as the request body.
  4. It returns the promise resolved with the server's response, which should conform to the `ReservationResponse` interface.
  5. Handle potential API errors gracefully.

#### `frontend/src/hooks/useReservations.ts`

This custom hook abstracts the state management for creating a reservation using `@tanstack/react-query`.

- **Imports**: Import `useMutation`, `UseMutationResult` from `@tanstack/react-query` and `createReservation` from `reservationService.ts`.
- **`useCreateReservation(): UseMutationResult<ReservationResponse, Error, CreateReservationRequest>`**: 
  1. This function takes no arguments.
  2. It calls `useMutation` from `@tanstack/react-query`.
  3. The `mutationFn` for `useMutation` should be the `createReservation` function from the service layer.
  4. Return the result of the `useMutation` call. This provides the component with `mutate`, `isPending`, `isSuccess`, `isError`, etc.

#### `frontend/src/pages/ReservationPage.tsx`

This page provides the customer-facing UI for booking a table.

- **Component**: `ReservationPage(): JSX.Element`.
- **Imports**: Import `React`, `Layout` from `frontend/src/components/Layout.tsx`, and `useCreateReservation` from `frontend/src/hooks/useReservations.ts`. Also import `useForm` from `react-hook-form`, `zodResolver` from `@hookform/resolvers/zod`, and `z` from `zod`.
- **Layout & Styling**:
  1. The entire page content should be wrapped in the `<Layout>` component.
  2. The page should have a dark theme with a background color of `bg-[#1A1A1A]` and text color of `text-[#F5F5F5]`.
  3. A main heading should read "Reserve Your Experience at Filament" in a large, sophisticated font.
- **Form Implementation**:
  1. Define a Zod schema that validates an object matching the `CreateReservationRequest` interface. Ensure `partySize` is a positive number and `reservationTime` is a valid date in the future.
  2. Use the `useForm` hook with the `zodResolver` to manage form state and validation.
  3. The form should contain controlled input fields for: `customerName` (text), `customerEmail` (email), `customerPhone` (tel), `partySize` (number), `reservationTime` (datetime-local), and `specialRequests` (textarea, optional).
  4. Style inputs with dark backgrounds, light text, and focus rings using the accent color, e.g., `focus:ring-[#FFB800]`.
  5. Display validation errors for each field.
- **Submission Logic**:
  1. Use the `useCreateReservation` hook to get the mutation function and its state.
  2. The form's `onSubmit` handler should call `mutate(data)` with the validated form data.
  3. While `isPending` is true, disable the submit button and show a loading indicator (e.g., a spinner).
  4. The submit button should be styled prominently with `bg-[#FFB800]` and `text-[#1A1A1A]` and have text like "Confirm Your Spot".
- **User Feedback**:
  1. If `isSuccess` is true, hide the form and display a success message: "Thank you! Your reservation request has been received. We will confirm with you shortly."
  2. If `isError` is true, display a user-friendly error message below the form, e.g., "Sorry, we couldn't process your reservation. Please try again later."

--- 

### Part 2: Admin Reservation Management

This flow provides an admin interface to view all reservations and manage their status.

#### `frontend/src/services/adminReservationService.ts`

This service handles communication with the protected admin reservation API.

- **Imports**: Import `apiClient` from `frontend/src/api/client.ts`.
- **`getAllReservations(): Promise<ReservationResponse[]>`**:
  1. This asynchronous function takes no arguments.
  2. It makes a `GET` request to `/api/v1/admin/reservations`.
  3. It returns the promise resolved with the array of all reservations.
- **`updateReservationStatus(id: string, status: string): Promise<ReservationResponse>`**:
  1. This asynchronous function takes a reservation `id` (string) and a new `status` (string, should be one of `ReservationStatus` values).
  2. It makes a `PUT` request to `/api/v1/admin/reservations/${id}/status`.
  3. The request body must be a JSON object: `{ "status": status }`.
  4. It returns the promise resolved with the updated reservation object.

#### `frontend/src/pages/AdminReservationsPage.tsx`

This page provides the admin UI for managing reservations.

- **Component**: `AdminReservationsPage(): JSX.Element`.
- **Imports**: Import `React`, `useQuery`, `useMutation`, `useQueryClient` from `@tanstack/react-query`, and the service functions from `adminReservationService.ts`.
- **Data Fetching**:
  1. Use the `useQuery` hook to fetch all reservations. The query key should be `['reservations']` and the query function should be `getAllReservations`.
  2. Handle the `isLoading` state by showing a loading spinner and the `isError` state by showing an error message.
- **Data Display**:
  1. The page should have a heading: "Manage Reservations".
  2. Render the fetched reservation data in a table with a dark theme.
  3. Table columns should include: Customer Name, Email, Phone, Party Size, Reservation Time (formatted for readability), Status, and Actions.
  4. The `Status` column should display a styled badge based on the status value (e.g., yellow for PENDING, blue for CONFIRMED, red for CANCELLED).
- **Status Update Logic**:
  1. Get the `queryClient` instance using `useQueryClient()`.
  2. Use the `useMutation` hook for updating the status. The mutation function will be a wrapper that calls `updateReservationStatus(id, status)`.
  3. In the `onSuccess` callback of `useMutation`, invalidate the `['reservations']` query using `queryClient.invalidateQueries({ queryKey: ['reservations'] })` to automatically refetch the list and update the UI.
  4. The `Actions` column in the table should contain a dropdown or buttons for each reservation.
  5. For a 'PENDING' reservation, show 'Confirm' and 'Cancel' buttons. For a 'CONFIRMED' reservation, show a 'Cancel' button.
  6. Clicking an action button should call the `mutate` function from the `useMutation` hook with the corresponding reservation `id` and the new `status`.

---

## Events Calendar UI

**Name:** `events-calendar`  
**Type:** FRONTEND  
**Change required:** true

**Files in this feature:**
- `frontend/src/pages/EventsPage.tsx` — PAGE layer - The customer-facing events page. It uses the useEvents hook to fetch and display a list of upcoming events in a visually appealing card layout.
- `frontend/src/hooks/useEvents.ts` — HOOK layer - Abstracts data fetching for events. Its primary export is useEvents(), which calls the eventService and manages state via @tanstack/react-query.
- `frontend/src/services/eventService.ts` — SERVICE layer - Handles public HTTP communication for events. Its primary function is getEvents(): Promise<EventDto[]>, which calls the GET /api/v1/events endpoint.
- `frontend/src/pages/AdminEventsPage.tsx` — PAGE layer - Provides the admin UI for event management, including a table of all events and forms (in modals) for creating and editing events, with client-side validation using zod.
- `frontend/src/services/adminEventService.ts` — SERVICE layer - Handles protected HTTP communication for event management. It provides createEvent, updateEvent, and deleteEvent functions that call the corresponding admin endpoints.

**Feature Instruction:**

### Feature: Events Calendar UI

This feature implements the user-facing events page and the corresponding administrative interface for managing events at Filament Bar. It involves creating services to communicate with the backend, custom hooks for data fetching with React Query, and two main page components: one for public viewing and one for admin CRUD operations.

#### Shared Data Model and Types

Across this feature, you will use a consistent data transfer object for events. Create a type definition that can be shared or defined where needed.

**`EventDto` Interface:**
```

typescript
export interface EventDto {
  id?: string; // UUID, optional for new events
  name: string;
  description: string;
  eventDate: string; // ISO 8601 date-time string
  imageUrl?: string;
}


```

--- 

### File Implementation Details

#### 1. Public-Facing Event Services & Hooks

**File: `frontend/src/services/eventService.ts`**

This service handles fetching public event data.

- **Imports**: Import the `api` client from `frontend/src/api/client.ts`.
- **`getEvents()` function:**
  - **Signature**: `getEvents(): Promise<EventDto[]>`
  - **Logic**:
    1. Make a GET request to `/api/v1/events` using the imported `api` client.
    2. The endpoint is defined in the `event-management` feature and returns a `List<EventDto>`.
    3. Return the `data` property from the API response, which will be an array of events.
    4. Handle potential errors at the hook level, not here.

**File: `frontend/src/hooks/useEvents.ts`**

This custom hook abstracts the data fetching logic for events using `@tanstack/react-query`.

- **Imports**: Import `useQuery` from `@tanstack/react-query` and `getEvents` from `../services/eventService.ts`.
- **`useEvents()` function:**
  - **Signature**: `useEvents(): { data, isLoading, isError }` (or more specifically, `UseQueryResult<EventDto[], Error>`)
  - **Logic**:
    1. Call `useQuery` from `@tanstack/react-query`.
    2. Use the query key `['events']`.
    3. Provide `getEvents` as the query function.
    4. Return the object returned by `useQuery`, which includes `data`, `isLoading`, `isError`, and other query state properties.

#### 2. Public-Facing Events Page

**File: `frontend/src/pages/EventsPage.tsx`**

This page displays upcoming events to the public, reflecting the sophisticated and energetic brand identity of Filament Bar.

- **Imports**: `React`, `Layout` from `frontend/src/components/Layout.tsx`, and `useEvents` from `frontend/src/hooks/useEvents.ts`.
- **`EventsPage()` component:**
  - **Signature**: `EventsPage(): JSX.Element`
  - **Logic**:
    1. Call `const { data: events, isLoading, isError } = useEvents();` to fetch event data.
    2. Render the main component within the `Layout` component.
    3. **Design & Layout**:
        - The main container should have a dark background: `bg-[#1A1A1A]` and default text color `text-[#F5F5F5]`.
        - Add a main heading with the text "Upcoming Events at Filament". Style it with a sophisticated font and use the accent color for emphasis, e.g., a bottom border or a highlight word in `text-[#FFB800]`.
    4. **Conditional Rendering**:
        - If `isLoading` is true, display a loading spinner or a skeleton loader for 3-4 event cards.
        - If `isError` is true, display a user-friendly error message like "Could not load events. Please try again later."
        - If `events` is successfully loaded:
            - If `events` is empty, display a message: "No upcoming events scheduled. Follow us on social media for the latest updates!"
            - If `events` has items, render a grid of event cards. Use a responsive grid layout (e.g., `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`).
    5. **Event Card (sub-component)**:
        - For each event in the `events` array, render a card component.
        - The card should have a slightly lighter dark background than the page.
        - Display the `event.imageUrl` if it exists, with `object-cover` styling.
        - Display the event `name` as a prominent heading with `text-[#FFB800]`.
        - Display the `eventDate`, formatted for readability (e.g., `new Date(event.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })`).
        - Display the event `description`.

--- 

#### 3. Admin Event Services

**File: `frontend/src/services/adminEventService.ts`**

This service provides functions for admin-level CRUD operations on events. It will call protected API endpoints.

- **Imports**: Import the `api` client from `frontend/src/api/client.ts`. Assume the client is configured with an interceptor to add the JWT authentication token to requests.
- **`createEvent()` function:**
  - **Signature**: `createEvent(event: EventDto): Promise<EventDto>`
  - **Logic**: Makes a `POST` request to `/api/v1/admin/events` with the `event` object as the request body. Returns the response data.
- **`updateEvent()` function:**
  - **Signature**: `updateEvent(id: string, event: EventDto): Promise<EventDto>`
  - **Logic**: Makes a `PUT` request to `/api/v1/admin/events/${id}` with the `event` object as the request body. Returns the response data.
- **`deleteEvent()` function:**
  - **Signature**: `deleteEvent(id: string): Promise<void>`
  - **Logic**: Makes a `DELETE` request to `/api/v1/admin/events/${id}`. Returns nothing.

#### 4. Admin Events Management Page

**File: `frontend/src/pages/AdminEventsPage.tsx`**

This page provides a UI for administrators to create, update, and delete events.

- **Imports**: `React`, `useState`, `@tanstack/react-query` hooks (`useQueryClient`, `useMutation`), `react-hook-form`, `zod`, `zodResolver`, `useEvents` hook, and functions from `adminEventService`.
- **Component State**:
  - Use `useState` to manage the visibility of the create/edit modal (e.g., `isModalOpen`).
  - Use `useState` to hold the event currently being edited (e.g., `editingEvent: EventDto | null`).
- **Data Fetching**: Use `const { data: events, isLoading } = useEvents();` to get the list of events to display.
- **Zod Schema for Validation**:
  ```

typescript
  import { z } from 'zod';

  const eventSchema = z.object({
    name: z.string().min(1, 'Event name is required'),
    description: z.string().min(1, 'Description is required'),
    eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' }),
    imageUrl: z.string().url().optional().or(z.literal(''))
  });
  

```
- **Form Handling**: Use `react-hook-form` with `zodResolver(eventSchema)` for the create/edit form.
- **Mutations**: Set up mutations for CRUD operations.
  - `const queryClient = useQueryClient();`
  - **Create**: `const createMutation = useMutation({ mutationFn: createEvent, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }) });`
  - **Update**: `const updateMutation = useMutation({ mutationFn: (data: { id: string, event: EventDto }) => updateEvent(data.id, data.event), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }) });`
  - **Delete**: `const deleteMutation = useMutation({ mutationFn: deleteEvent, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }) });`
- **`AdminEventsPage()` Component Logic**:
  1. **Main Layout**: Render a main heading "Manage Events" and a "Create New Event" button. This button sets `isModalOpen(true)` and `setEditingEvent(null)`.
  2. **Events Table**: Display the `events` data in a table with columns: Name, Date, Description, and Actions.
     - The "Actions" column for each row should contain an "Edit" button and a "Delete" button.
     - **Edit Button**: On click, it sets the current event to state (`setEditingEvent(event)`) and opens the modal (`setIsModalOpen(true)`).
     - **Delete Button**: On click, it shows a confirmation dialog (`window.confirm`). If confirmed, it calls `deleteMutation.mutate(eventId)`.
  3. **Create/Edit Modal**:
     - The modal's visibility is controlled by `isModalOpen`.
     - It contains a form managed by `react-hook-form`.
     - When the modal opens for editing, use `form.reset(editingEvent)` to populate the fields.
     - The form should have inputs for `name`, `description`, `eventDate` (use `type="datetime-local"`), and `imageUrl`.
     - **Submit Logic (`onSubmit`)**:
       - If `editingEvent` exists, call `updateMutation.mutate({ id: editingEvent.id, event: formData })`.
       - Otherwise, call `createMutation.mutate(formData)`.
       - On successful mutation, close the modal and clear the form.

### Inter-File Wiring Summary

- **Public Flow**: `EventsPage.tsx` uses the `useEvents` hook. `useEvents.ts` calls `getEvents` from `eventService.ts`. `eventService.ts` makes the API call.
- **Admin Flow**: `AdminEventsPage.tsx` uses the `useEvents` hook for reading data. For writing data, it directly calls mutation hooks that wrap functions from `adminEventService.ts` (`createEvent`, `updateEvent`, `deleteEvent`).
- **API Client**: Both `eventService.ts` and `adminEventService.ts` depend on the shared `api` client from `frontend/src/api/client.ts` to communicate with the backend.

---

## Infrastructure

**Name:** `infrastructure`  
**Type:** INFRA  
**Change required:** true

**Files in this feature:**
- `Dockerfile` — INFRA layer - Defines the containerization recipe for the Java backend, enabling consistent builds and deployments.
- `docker-compose.yml` — INFRA layer - Orchestrates local development environment containers, linking the backend service with a PostgreSQL database service.
- `.env.example` — CONFIG layer - Provides a template for required environment variables, ensuring developers know what configuration is needed to run the application.
- `.gitignore` — CONFIG layer - Specifies intentionally untracked files to ignore in Git, such as build artifacts, dependency folders, and environment-specific files.

**Feature Instruction:**

_Not enriched (INFRA or skipped)._

---

