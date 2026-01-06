# Open Movie API

A backend-focused application built with DRF that allows users to get information about Movies, Directors and Actors connected with the TMDB API to get full information about a movie.

## Demo

Live Demo: **https://movie-api-one.vercel.app/**

## Tech Stack

- **Backend**: Python, Django Rest Framework
- **Frontend**: React, JavaScript, TailwindCSS (Generated with AI using Claude Code)
- **Database**: PostgreSQL, Supabase
- **Caching**: Redis Cloud
- **Backend Deployment**: Render
- **Frontend Deployment**: Vercel

## Features

- Movies listing with title, description, rating, genres, poster, director and actor
- Director and Actor listing with movies count
- Full CRUD operations for authenticated users
- JWT authentication
- API documentation with Swagger

## Architecture Overview

1. User enters to the main page and see movies listing
2. Can see movie details, as well as directors and actors pages
3. User wants to create, edit or update a movie, director or actor info
4. Create an account or login
5. Now it is allowed to make changes

## Installation

```bash
git clone https://github.com/jscode-1302/movie-api.git
cd movie-api

# Backend setup
cd backend/
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
python manage.py migrate
python manage.py runserver

# Frontend setup (new terminal)
cd frontend/
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

## Environment Variables

Create a `.env` file in the backend directory with:

```bash
# Django Configuration
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/NAME

# Redis Cache Configuration
REDIS_URL=redis://127.0.0.1:6379/1

# TMDb API Configuration
# Get your API key from: https://www.themoviedb.org/settings/api
TMDB_API_KEY=your-tmdb-api-key

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8000

# Logging
DEBUG_LOG_LEVEL=DEBUG
DJANGO_LOG_FILE=django_logs.txt
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/api/schema/swagger-ui/`
- ReDoc: `http://localhost:8000/api/schema/redoc/`

## License

MIT License



