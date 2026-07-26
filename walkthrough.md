# NestJS Books API Walkthrough

I've successfully created the simple CRUD Books API from scratch using NestJS.

## What was built

1. **Project Scaffolded:** A fresh NestJS project was generated directly in `d:\Dev\Backend\book-app`.
2. **Database Configured:** We set up an SQLite database using TypeORM. The database file (`database.sqlite`) will automatically be created when you start the server for the first time. The database will also automatically seed 5 default books if it's empty!
3. **Books Module (`src/books`):**
   *   **Entity:** Created the `Book` entity with `id`, `title`, `author`, and `publicationYear`.
   *   **DTOs:** Created `CreateBookDto` and `UpdateBookDto` using `class-validator` to ensure users send valid data (e.g., `title` must be a non-empty string).
   *   **Service & Controller:** Implemented all the standard CRUD logic to interact with the database.
4. **Global Validation:** Enabled `ValidationPipe` globally in `main.ts` so the DTOs automatically validate incoming requests.
5. **Swagger Integration:** Integrated `@nestjs/swagger` into `main.ts` using the Nest CLI compiler plugin.

## How to test it

Open a terminal in `d:\Dev\Backend\book-app` and start the development server:

```bash
npm run start:dev
```

The server will start on `http://localhost:8080`. 

### 1. Register a User
```bash
curl -X POST http://localhost:8080/auth/register \
-H "Content-Type: application/json" \
-d '{"name": "John Doe", "email": "john@example.com", "password": "password123"}'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/auth/login \
-H "Content-Type: application/json" \
-d '{"email": "john@example.com", "password": "password123"}'
```
*Copy the `accessToken` from the response.*

### 3. Get Authenticated User Profile
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" http://localhost:8080/auth/profile
```

### 4. Access Protected Books Endpoints
All `/books` endpoints are now protected and require the `accessToken` you got from logging in.

#### Get all Books
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" http://localhost:8080/books
```

#### Create a new Book
```bash
curl -X POST http://localhost:8080/books \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{"title": "The Hitchhiker'\''s Guide to the Galaxy", "author": "Douglas Adams", "publicationYear": 1979}'
```

### 4. Refresh Token
When your access token expires, use the `refreshToken` you got during login to get a new one:
```bash
curl -X POST http://localhost:8080/auth/refresh \
-H "Content-Type: application/json" \
-d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

## OpenAPI / Swagger Documentation

Because we are now using the official NestJS Swagger CLI plugin, you don't need to run any manual generation scripts. 

Simply start the server:
```bash
npm run start:dev
```

And visit the interactive Swagger UI directly in your browser:
**[http://localhost:8080/api-docs](http://localhost:8080/api-docs)**

*(If you strictly need the raw JSON, it is served automatically at `http://localhost:8080/api-docs-json`)*
