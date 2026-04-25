# SmartCards - Spaced Repetition Learning App

SmartCards is a modern flashcard web application designed to help users learn more effectively using the **Spaced Repetition System (SRS)**. Users can create custom decks, add cards, and track their learning progress through a data-driven dashboard.

## 🚀 Key Features

- **Spaced Repetition Engine**: Advanced study session logic that moves cards between batches based on performance.
- **Dynamic Statistics**: 
  - **Learning Streaks**: Track consecutive days of active learning.
  - **Weekly Activity**: Visualized study time and card flips via a rolling 7-day activity tracker.
  - **Mastery System**: Monitor how many cards you've mastered per deck and globally.
- **Deck Management**: Full CRUD operations for decks and cards.
- **Secure Authentication**: Built-in identity management with JWT integration.
- **Responsive UI**: Sleek, modern interface built for both desktop and mobile use.

## 🛠️ Tech Stack

### Backend
- **Framework**: .NET 10 (ASP.NET Core Web API)
- **ORM**: **Entity Framework Core** (Code-First approach)
- **Database**: MySQL (via Pomelo EF Core provider)
- **Patterns**: Repository Pattern & Unit of Work (for clean data access)
- **Identity**: Microsoft Identity Core (JWT-based security)
- **Mapping**: AutoMapper (to keep DTOs and Entities separate)

### Frontend
- **Framework**: Angular
- **Styling**: Tailwind CSS & DaisyUI
- **State Management**: Service-based reactive state with RxJS

## 🏗️ Architecture
The project follows a modern software architecture:
- **Unit of Work Pattern**: Ensures all repository operations are atomic and consistent.
- **Lazy Loading Repositories**: Repositories are instantiated only when needed within the UnitOfWork.
- **DTO (Data Transfer Object) Pattern**: Prevents direct entity exposure, ensuring data privacy and optimized API responses.
- **Global Error Handling**: Centralized middleware to handle exceptions gracefully.

## ⚙️ Getting Started

### Prerequisites
- .NET 10 SDK
- Node.js & npm
- MySQL Server (XAMPP or local installation)

### Backend Setup
1. Navigate to the `API` folder.
2. Update `appsettings.Development.json` with your MySQL connection string.
3. Run migrations:
   ```bash
   dotnet ef database update
   ```
4. Start the server:
   ```bash
   dotnet run
   ```

### Frontend Setup
1. Navigate to the `client` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```

## 📄 License

This project is proprietary. See the [LICENSE](LICENSE) file for details.
Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved.

## 👥 Authors
- **Laczkó István**
- **Brückner Gábor**
