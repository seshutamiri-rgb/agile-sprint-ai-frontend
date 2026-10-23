# Agile Sprint AI

An AI-assisted sprint planning application that transforms sprint goals, team capacity, and candidate user stories into a structured sprint proposal.

## Overview

Agile Sprint AI demonstrates how generative AI can support Agile delivery management. It accepts sprint-planning inputs, sends an authenticated request to an AWS backend, and returns an AI-generated proposal for the team to review.

This portfolio project demonstrates the integration of a React frontend with AWS serverless services and Amazon Bedrock. It is a demonstration workflow, not a production-ready sprint-management platform.

## Key Features

- Secure sign-in using Amazon Cognito.
- Inputs for sprint goal, sprint duration, team capacity, and candidate user stories.
- AI-generated sprint proposals using Amazon Bedrock (Nova Lite).
- Proposed story-point estimates and acceptance criteria.
- Suggested risks, dependencies, assumptions, and scope considerations.
- Markdown-formatted sprint-plan display.
- Human review and approval before committing to sprint scope.

## Demo Workflow

1. Sign in through Amazon Cognito.
2. Enter the sprint goal, duration, team capacity, and candidate user stories.
3. Submit the form from the React frontend.
4. The frontend sends an authenticated HTTPS request to Amazon API Gateway.
5. API Gateway validates the JWT and routes the request to AWS Lambda.
6. Lambda invokes the configured Amazon Bedrock model to generate a sprint proposal.
7. The JSON response is returned to the frontend and rendered with ReactMarkdown.
8. The team reviews and validates the proposal before making sprint commitments.

## Architecture

The diagram below shows the high-level request and response flow.

![Agile Sprint AI architecture](docs/architecture.png)

**Request flow:** React + Vite → Amazon Cognito authentication → Amazon API Gateway (HTTP API and JWT authorization) → AWS Lambda (Python) → Amazon Bedrock (Nova Lite).

**Response flow:** Lambda returns a JSON sprint proposal → React stores the result in frontend state → ReactMarkdown renders the plan for review.

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React, Vite, JavaScript | Sprint input form and plan display |
| Authentication | Amazon Cognito | User sign-in and JWT tokens |
| API | Amazon API Gateway HTTP API | HTTPS endpoint and JWT authorization |
| Backend | AWS Lambda, Python | Request processing and model invocation |
| Generative AI | Amazon Bedrock, Nova Lite | Sprint proposal generation |
| Rendering | ReactMarkdown | Markdown-formatted plan display |
| Version control | Git, GitHub | Source control and project documentation |

## Run Locally

### Prerequisites

- Node.js and npm
- Git
- Access to the configured AWS resources
- A configured Amazon Cognito user pool, app client, and domain
- An API endpoint configured to accept authenticated requests

### 1. Clone the repository

```bash
git clone https://github.com/seshutamiri-rgb/agile-sprint-ai-frontend.git
cd agile-sprint-ai-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local file named `.env.local` in the project root. Use the variable names expected by `src/auth.js` and the frontend code.

Example placeholders:

```dotenv
VITE_COGNITO_REGION=your-aws-region
VITE_COGNITO_USER_POOL_ID=your-cognito-user-pool-id
VITE_COGNITO_CLIENT_ID=your-cognito-app-client-id
VITE_COGNITO_DOMAIN=https://your-cognito-domain
VITE_REDIRECT_URI=http://localhost:5173/
VITE_LOGOUT_URI=http://localhost:5173/
VITE_API_URL=https://your-api-endpoint/plan-sprint
```

Replace the placeholders with your own configuration values. Confirm that the API URL and environment-variable names match the current source code before running the application.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173/`.

## Security Considerations

- The frontend uses Amazon Cognito for sign-in and calls a JWT-protected API route.
- Keep `.env.local` out of version control. Do not commit access tokens, refresh tokens, AWS access keys, private keys, or other credentials.
- Variables prefixed with `VITE_` are included in the browser-side application bundle. Do not store secrets in them.
- Restrict API Gateway CORS to the frontend origins required for each environment.
- Apply least-privilege IAM permissions to the Lambda execution role.
- Protect backend configuration and monitor access to AWS resources.

## Current Limitations

- Generated sprint proposals are held in frontend state and are not persisted to a database; refreshing the page clears the displayed plan.
- Story-point estimates, acceptance criteria, and recommendations are preliminary and require validation by the delivery team.
- The current workflow generates proposals from user-provided inputs. It does not verify recommendations against live project-management data or a project database.
- The application does not yet provide persistent sprint history, production monitoring, or a complete automated test and deployment pipeline.
- The architecture and configuration should be reviewed and hardened before any production use.

## Future Enhancements

- Persist sprint plans and review history.
- Integrate approved project-management data sources.
- Add deterministic checks for team capacity, sprint duration, dependencies, and planning constraints.
- Add automated frontend and backend tests.
- Introduce structured logging, monitoring, and deployment automation.
- Add explicit approval and audit-history workflows.

## Human-in-the-Loop

AI-generated content is a planning aid, not an authoritative commitment. The Product Owner and delivery team remain responsible for validating estimates, prioritizing stories, confirming dependencies, and approving the final sprint scope.

## Project Status

**Portfolio demonstration project.** The current implementation demonstrates authenticated access to an AWS-hosted AI sprint-planning workflow. Additional testing, data integration, monitoring, and production-readiness work would be required before production use.
