<<<<<<< HEAD
# dev-loop

## More Details:
https://docs.google.com/document/d/1cg2gMKamCl4b75sOguAvy5wpGAMtmrPlokjcra2C3zc/edit?usp=sharing
=======

# DevLoop - DSA Community Platform

Welcome to DevLoop, the weekly hub for our Data Structures and Algorithms study group. This platform allows members to propose topics, vote on what to discuss, and get prepared for our Saturday sessions.

## Features

- **Topic Proposals**: Members can suggest DSA topics or questions for the upcoming week.
- **Weekly Polls**: A curated list of topics is put to a vote from Thursday to Saturday.
- **Session Details**: Information about the winning topic and logistics for the Saturday meeting.
- **Study Packs**: Curated learning resources for the week's topic.
- **Weekly Recaps**: Summaries of what was discussed, including key takeaways and common pitfalls.
- **Developer Admin Panel**: A simple interface to toggle between a mock API and a real HTTP backend, and to simulate the weekly cycle for testing.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd devloop-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Configuration

### API Adapter (Mock vs. HTTP)

You can switch between a fully client-side Mock API and a real HTTP backend.

-   Navigate to the `/admin` page in the application.
-   Use the "API Adapter" toggle. Your choice is saved in `localStorage` and persists across sessions.

When using the **HttpAdapter**, the application will make requests to the base URL defined in your environment variables. You can create a `.env.local` file in the project root to configure it:

```
VITE_API_BASE_URL=https://your-backend-service-url.com
```

### Schedule Constants

The weekly event schedule (submission deadlines, poll times) is hard-coded for now. To adjust these timings, edit the values in `src/constants.ts`.

```typescript
// src/constants.ts

export const SCHEDULE = {
  // Submissions close Wednesday 6 PM
  SUBMISSIONS_CLOSE: { day: 3, hour: 18, minute: 0 },
  // Poll opens Thursday 10 AM
  POLL_OPEN: { day: 4, hour: 10, minute: 0 },
  // Poll closes Saturday 12 PM
  POLL_CLOSE: { day: 6, hour: 12, minute: 0 },
  // Session starts Saturday 6 PM
  SESSION_START: { day: 6, hour: 18, minute: 0 },
};
```

## Deployment

This is a static single-page application built with React and Vite. It can be deployed to any static hosting service.

### Deploying to Google Cloud Run

1.  **Build the application:**
    ```bash
    npm run build
    ```
    This will create a `dist` directory with the production-ready static assets.

2.  **Create a `Dockerfile`:**
    ```Dockerfile
    # Use a lightweight Nginx image
    FROM nginx:alpine
    
    # Copy the built static files from the 'dist' directory
    COPY dist /usr/share/nginx/html
    
    # Expose port 80
    EXPOSE 80
    
    # Nginx will automatically serve the index.html file
    CMD ["nginx", "-g", "daemon off;"]
    ```

3.  **Deploy to Cloud Run:**
    Use the `gcloud` CLI to build and deploy the container image.
    ```bash
    # Replace [PROJECT_ID] and [SERVICE_NAME]
    gcloud run deploy [SERVICE_NAME] --source . --platform managed --region us-central1 --allow-unauthenticated --project=[PROJECT_ID]
    ```
    This command builds the Docker image using Cloud Build, pushes it to Artifact Registry, and deploys it as a new service on Cloud Run.

## Future Development Notes

The current implementation uses a mock API for frontend development and demonstration. The backend services and agents that will power the real application are planned as follows:

-   **Backend Services**: A set of Cloud Functions or a Cloud Run service will handle API requests for proposals, polls, and data retrieval.
-   **Curator Agent**: A scheduled agent (e.g., Cloud Scheduler + Pub/Sub + Cloud Function) will trigger on Wednesday evening to process submissions and curate the top 3-6 topics for the poll.
-   **Poll Agent**: Manages the lifecycle of the poll, opening it on Thursday and closing it on Saturday.
-   **Study Pack Generator**: After a winning topic is determined, this agent will use generative AI (like Gemini) to create a comprehensive study pack.
-   **Recap Generator**: After the Saturday session, this agent will generate a summary of the key discussion points.

This frontend is designed to seamlessly integrate with these future backend components by switching to the `HttpAdapter`.
>>>>>>> 026de8e (initial Devloop UI push)
