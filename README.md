# Planner

A tiny Firebase-backed planner that lets anyone capture tasks with due dates and keep them in sync across devices.

## Features

- Minimal form to capture a task title, optional details, and due date/time.
- Real-time updates powered by Cloud Firestore so every session stays in sync.
- Mark tasks as complete or delete them with a single click.
- Simple, responsive layout that works well on desktop and mobile.

## Prerequisites

1. A Firebase project with Cloud Firestore enabled.
2. A web app registered in that Firebase project.

## Getting started

1. **Clone this repository** and install a simple static server if you don't already have one.

   ```bash
   git clone <this repo>
   cd Planner
   npm install --global serve # or use any static server you prefer
   ```

2. **Create a Firestore database** in test mode for quick prototyping, or production mode if you're ready to enforce security rules. The app uses a single `tasks` collection.

3. **Grab your Firebase web config** from the Firebase console (Project settings → General → Your apps) and paste it into the JSON block inside `public/index.html`, replacing the placeholder values.

   ```html
   <script id="firebase-config" type="application/json">
     {
       "apiKey": "...",
       "authDomain": "...",
       "projectId": "...",
       "storageBucket": "...",
       "messagingSenderId": "...",
       "appId": "..."
     }
   </script>
   ```

4. **Run the app locally.**

   ```bash
   serve public
   ```

   Then open the printed URL (for example `http://localhost:3000`) in your browser. Adding, completing, and deleting tasks will reflect in Firestore instantly.

## Deployment

Any static hosting solution works (Firebase Hosting, Netlify, Vercel, GitHub Pages, etc.). Upload the `public` directory and ensure the Firebase configuration matches the deployed environment.

## Next steps

- Add Firebase Authentication if you want to limit access to each user's tasks.
- Customize Firestore security rules to restrict who can create or modify tasks.
- Extend the data model with reminders, categories, or recurring tasks.
