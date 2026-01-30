# Phase 1: Foundation & Authentication Documentation

## 1. Architecture Overview
The backend is built using **Django 5.x** and **Django Rest Framework (DRF)**, connected to a **MySQL** database.

-   **Project Name**: `catalog_project`
-   **Root Directory**: `catalogstudio-backend/`
-   **Apps**:
    -   `users`: Handles user management and authentication.
-   **Authentication**: Token-based authentication (DRF `TokenAuthentication`).

## 2. Work Completed

### Environment Setup
-   Created Python virtual environment (`catalog`).
-   Installed dependencies: `django`, `djangorestframework`, `mysqlclient`, `django-cors-headers`, `python-dotenv`.
-   Configured `.env` for secure database credentials.
-   Updated `settings.py` to use MySQL and Environment variables.

### Database Schema
-   **Database**: `catalog_db` (MySQL)
-   **User Table** (`users_user`):
    -   `id`: Accessor ID
    -   `username`: Unique identifier
    -   `email`: User email
    -   `name`: Full name (Custom field)
    -   `avatar`: URL or Base64 string (Custom field)
    -   `role`: `admin`, `editor`, or `viewer` (Custom field)

## 3. API Reference & Use Cases

### Authentication

#### 1. User Login
-   **Endpoint**: `POST /api/auth/login/`
-   **Use Case**: Used by the frontend login form to authenticate a user. Returns an authentication token that must be stored (e.g., in localStorage) and sent in the header of subsequent requests.
-   **Request Body**:
    ```json
    {
        "username": "catuser",
        "password": "catopaso"
    }
    ```
-   **Success Response (200 OK)**:
    ```json
    {
        "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
        "user": {
            "id": 1,
            "username": "catuser",
            "email": "user@example.com",
            "name": "Catalog User",
            "avatar": "https://example.com/avatar.jpg",
            "role": "editor"
        }
    }
    ```
-   **Error Response (401 Unauthorized)**:
    ```json
    {
        "error": "Invalid Credentials"
    }
    ```

#### 2. Get Current User Profile
-   **Endpoint**: `GET /api/auth/me/`
-   **Use Case**: Used on application load (e.g., in `App.tsx`) to validate the stored token and retrieve the user's latest profile information (permissions, avatar, name).
-   **Headers**:
    -   `Authorization`: `Token <your_token_here>`
-   **Success Response (200 OK)**:
    ```json
    {
        "id": 1,
        "username": "catuser",
        "email": "user@example.com",
        "name": "Catalog User",
        "avatar": "https://example.com/avatar.jpg",
        "role": "editor"
    }
    ```
-   **Error Response (401 Unauthorized)**:
    -   Occurs if the token is missing, invalid, or expired. The frontend should redirect to the login page.

## 4. Key Files Created
-   `catalogstudio-backend/.env`: Environment variables.
-   `catalogstudio-backend/users/models.py`: Custom `User` model.
-   `catalogstudio-backend/users/views.py`: Login and Me views.
-   `catalogstudio-backend/users/serializers.py`: User data serialization.
-   `catalogstudio-backend/users/urls.py`: URL routing for auth.

## 4. How to Run
1.  Activate environment: `source catalog/bin/activate`
2.  Run server: `python manage.py runserver`
