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
6. **File Uploads:** Configured Multer to accept `multipart/form-data` uploads for book covers, automatically storing them in the `uploads/books` folder and returning the static URL.
7. **Multi-Method Authentication:** Flexible auth endpoints that support both **Cookie-auth** and **localStorage (Bearer) auth** seamlessly depending on the frontend's request header (`x-auth-method`).

## Live Deployment

The API has been deployed to production via Render using PostgreSQL and Cloudinary for image hosting.

*   **Production Base URL:** `https://book-app-ptl2.onrender.com`
*   **Interactive Swagger Docs:** [https://book-app-ptl2.onrender.com/api-docs](https://book-app-ptl2.onrender.com/api-docs)
*   **Swagger Collection JSON:** `https://book-app-ptl2.onrender.com/api-docs-json`

## How to test it locally

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

### 2. Login (Bearer Token / localStorage approach)
```bash
curl -X POST http://localhost:8080/auth/login \
-H "Content-Type: application/json" \
-d '{"email": "john@example.com", "password": "password123"}'
```
*Copy the `accessToken` from the JSON response.*

### 2b. Login (Cookie Auth approach)
```bash
curl -X POST http://localhost:8080/auth/login \
-H "Content-Type: application/json" \
-H "x-auth-method: cookie" \
-d '{"email": "john@example.com", "password": "password123"}' -v
```
*Notice the `Set-Cookie` headers in the response. The token is now managed by the browser.*

### 3. Get Authenticated User Profile (Bearer Token)
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" http://localhost:8080/auth/profile
```

### 3b. Get Authenticated User Profile (Cookie Auth)
```bash
curl -b "accessToken=YOUR_ACCESS_TOKEN" http://localhost:8080/auth/profile
```
*(In a real browser, the `Cookie` header is sent automatically!)*

### 4. Access Protected Books Endpoints
All `/books` endpoints are now protected and require the `accessToken` you got from logging in.

#### Get all Books
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" http://localhost:8080/books
```

#### Create a new Book (JSON)
```bash
curl -X POST http://localhost:8080/books \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{"title": "The Hitchhiker'\''s Guide to the Galaxy", "author": "Douglas Adams", "publicationYear": 1979}'
```

#### Create a new Book (with Cover Image)
```bash
curl -X POST http://localhost:8080/books \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-F "title=Dune" \
-F "author=Frank Herbert" \
-F "publicationYear=1965" \
-F "coverImage=@/path/to/your/image.jpg"
```

### 5. Refresh Token
When your access token expires, use the `refreshToken` you got during login to get a new one (if using Bearer auth):
```bash
curl -X POST http://localhost:8080/auth/refresh \
-H "Content-Type: application/json" \
-d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

If using **Cookie auth**, simply call the endpoint with the `x-auth-method: cookie` header, and the refresh token cookie is automatically read:
```bash
curl -X POST http://localhost:8080/auth/refresh \
-H "x-auth-method: cookie" \
-b "refreshToken=YOUR_REFRESH_TOKEN" -v
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

## Static File Serving (Book Covers)

Whenever you create a book with a cover image, the API stores the physical file in the local `uploads/books/` directory and saves the URL path string into the `coverImage` column of your SQLite database. 

Because we configured the NestJS application as an Express server serving static assets, any image uploaded is instantly available in the browser via the `/uploads/...` URL route.

For example, if the API returns a book with `"coverImage": "/uploads/books/1712398412-cover.png"`, your frontend can simply render:
```html
<img src="http://localhost:8080/uploads/books/1712398412-cover.png" alt="Book Cover" />
```
