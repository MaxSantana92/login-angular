# LoginAngular

This is a modern Angular application that demonstrates a complete user authentication flow, including a home page, a login form, and a registration page placeholder. The project is built with the latest Angular features and best practices.

## ✨ Key Features

- **Angular 20**: Built with the latest version of the Angular framework.
- **Standalone Components**: Modern, module-less architecture for better performance and developer experience.
- **Angular Material**: High-quality UI components for a clean and modern design.
- **Reactive Forms**: Robust and scalable forms for handling user input.
- **Lazy Loading**: Feature routes (`Login`, `Register`) are loaded on demand to improve initial load time.
- **HttpClient & Interceptors**: Best practices for handling API requests, including adding headers automatically.
- **DummyJSON API Integration**: Connects to a live API for a real-world login demonstration. https://dummyjson.com/ user: emilys pass: emilyspass

## ✅ Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: `^20.14.0` or `^22.0.0`
- **Angular CLI**: Version `20.3.10` or higher

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine.

### 1. Installation

Clone the repository and install the dependencies using npm:

```bash
npm install
```

### 2. Development Server

Run the development server. The app will automatically reload if you change any of the source files.

```bash
npm start
```

Navigate to `http://localhost:4200/`.

## 📂 Folder Structure

The project follows a feature-based folder structure to keep the code organized and maintainable:

```
src/app/
├── pages/          # Contains the main pages (Home, Login, Register)
├── services/       # For services like AuthService that handle business logic
├── interceptors/   # For HTTP interceptors
├── app.config.ts   # Main application configuration
└── app.routes.ts   # Main application routes
```

## 🛠️ Available Scripts

- `npm start`: Runs the app in development mode.
- `npm run build`: Builds the app for production to the `dist/` folder.
- `npm run test`: Runs the unit tests via Karma.

## 📚 Further Help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
