# HackHub: Hackathon Collaboration Platform

HackHub is a platform designed to help students collaborate effectively during hackathons. It provides tools for generating project ideas, forming teams, building presentations, and managing resources.

## Features (Planned/In Progress)

*   AI Idea Generator
*   Team Formation
*   Presentation Builder
*   Shared Project Workspace
*   Mentor Connect
*   Resource Bank
*   Hackathon Tracker
*   User Authentication (Implemented)
*   User Profiles (Implemented)

## Tech Stack

This project is built using the following technologies:

*   **Frontend:** React, TypeScript, Tailwind CSS
*   **Backend:** Node.js/Express (Planned)
*   **Database:** Firebase Firestore (Used for profiles)
*   **Authentication:** Firebase Authentication (Email/Password)
*   **API:** OpenAI API (Planned for Idea Generator)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v14 or higher recommended)
*   npm or yarn
*   A Firebase project

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/Rupeshkotha/Hackhub.git
    ```

2.  Navigate into the project directory:

    ```bash
    cd Hackhub
    ```

3.  Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

### Firebase Setup

1.  Go to your Firebase project console.
2.  Enable **Email/Password** authentication in the Authentication section.
3.  Go to the Firestore Database section and create a new database.
4.  Get your Firebase Web App configuration. It should look something like this:

    ```javascript
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
    ```

5.  Create a file named `.env.local` in the root of your project and add your Firebase configuration as environment variables:

    ```env
    REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
    REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
    REACT_APP_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
    REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
    REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID
    ```
    Replace the placeholder values with your actual Firebase config.

### Running the Project

To start the development server, run:

```bash
npm start
# or
yarn start
```

This will open the application in your browser at `http://localhost:3000` (or another available port).
