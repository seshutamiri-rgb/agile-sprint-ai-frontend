# Agile Sprint AI

An AI-assisted sprint planning application that transforms sprint goals, team capacity, and candidate user stories into a structured sprint proposal.

## Overview

Agile Sprint AI demonstrates how generative AI can support Agile delivery management by helping teams prepare sprint plans, estimate candidate stories, identify risks, and define acceptance criteria.

The application is designed as a portfolio project demonstrating the integration of a React frontend with AWS serverless services and a foundation model.

## Features

- Secure sign-in using Amazon Cognito.
- Sprint goal, duration, team capacity, and candidate story inputs.
- AI-generated sprint proposals using Amazon Bedrock.
- Preliminary story-point estimates and acceptance criteria.
- Risk, dependency, assumption, and scope considerations.
- Markdown-formatted sprint plan display.
- Human review and approval before committing to sprint scope.

## Architecture

```text
User
 |
 v
React + Vite Frontend
 |
 | HTTPS request with Cognito access token
 v
Amazon API Gateway (HTTP API)
 |
 | JWT authorization
 v
AWS Lambda (Python)
 |
 v
Amazon Bedrock
(Nova Lite foundation model)
 |
 v
Generated sprint proposal (JSON)
 |
 v
React state + ReactMarkdown
 |
 v
Sprint plan displayed to user
```

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript |
| Authentication | Amazon Cognito |
| API | Amazon API Gateway HTTP API |
| Backend | AWS Lambda, Python |
| Generative AI | Amazon Bedrock, Nova Lite |
| Response rendering | ReactMarkdown |
| Version control | Git and GitHub |

## How It Works

1. The user signs in through Amazon Cognito.
2. The user enters the sprint goal, duration, team capacity, and candidate stories.
3. The frontend sends an authenticated HTTPS POST request to API Gateway.
4. API Gateway validates the JWT and routes the request to Lambda.
5. Lambda invokes the configured Amazon Bedrock model to generate a sprint proposal.
6. Lambda returns the proposal as JSON.
7. The React frontend displays the generated content using ReactMarkdown.

## Run Locally

### Prerequisites

- Node.js and npm
- Git
- Access to the configured AWS resources
- A configured Cognito user pool and application client

### Installation

Clone the repository:

```bash
git clone https://github.com/seshutamiri-rgb/agile-sprint-ai-frontend.git
cd agile-sprint-ai-frontend
```

Install dependencies:

```bash
npm install
```

Create a local `.env.local` file using the configuration names expected by `src/auth.js`:

```dotenv
VITE_COGNITO_REGION=your-region
VITE_COGNITO_USER_POOL_ID=your-user-pool-id
VITE_COGNITO_CLIENT_ID=your-app-client-id
VITE_COGNITO_DOMAIN=https://your-cognito-domain
VITE_REDIRECT_URI=http://localhost:5173/
VITE_LOGOUT_URI=http://localhost:5173/
VITE_API_URL=https://your-api-endpoint/plan-sprint
```

Replace the placeholders with your own configuration values. Keep `.env.local` out of version control.

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite, typically `http://localhost:5173/`.

## Security Considerations

- The frontend uses Cognito authentication and a protected API route.
- Environment-specific configuration belongs in local environment files.
- Never commit access tokens, refresh tokens, AWS secret keys, or other credentials.
- Configure CORS to allow only the frontend origins required for the environment.
- Apply least-privilege IAM permissions to backend resources.

## Current Limitations

- Generated sprint proposals are held in frontend state and are not persisted to a database.
- Story-point estimates and recommendations are preliminary and require team validation.
- The current workflow generates a proposal from user-provided inputs; it does not establish that recommendations have been verified against live project-management data.
- Production deployment, monitoring, automated tests, and persistent sprint history require further implementation and validation.

## Future Enhancements

- Persist sprint plans and review history.
- Integrate project-management data sources.
- Add deterministic validation of capacity and planning constraints.
- Introduce automated backend and frontend tests.
- Add monitoring, structured logging, and production deployment automation.

## Human-in-the-Loop

AI-generated recommendations support delivery decisions; they do not replace the Product Owner or delivery team's responsibility for final estimates, prioritization, and sprint commitments.

## Project Status

Portfolio demonstration project — further hardening and production-readiness work is required before production release.
