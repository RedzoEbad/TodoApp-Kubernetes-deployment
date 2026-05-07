# 📝 TodoApp — Kubernetes Deployment

A full-stack **Todo application** built with **Next.js 15**, **MongoDB**, and **TypeScript**, containerized with Docker and deployed via a GitHub Actions CI/CD pipeline with automated security scanning and API testing.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 4 |
| Backend | Next.js API Routes (Node.js runtime) |
| Database | MongoDB 6 + Mongoose 9 |
| Testing | Jest, React Testing Library, Newman (Postman) |
| Containerization | Docker (multi-stage build, Node 20 Alpine) |
| CI/CD | GitHub Actions |
| Security | Snyk (dependency scan), Trivy (image scan) |
| Code Quality | SonarCloud, ESLint 9 |

---

## 📁 Project Structure

```
todoapp/
├── app/
│   ├── api/
│   │   └── users/router/
│   │       └── route.js          # REST API: GET, POST, PATCH, DELETE todos
│   ├── page.tsx                  # Main UI page
│   ├── layout.tsx
│   └── globals.css
├── models/                       # Mongoose Todo model
├── lib/                          # MongoDB connection helper
├── __tests__/                    # Jest unit tests
├── test/
│   └── TodoApp.postman_collection.json  # Newman API tests
├── .github/
│   └── workflows/
│       └── ci.yml                # CI/CD pipeline
├── Dockerfile                    # Multi-stage Docker build
├── sonar-project.properties      # SonarCloud config
└── next.config.ts
```

---

## ⚙️ Getting Started (Local Development)

### Prerequisites

- Node.js 20+
- MongoDB running locally (or a MongoDB Atlas URI)
- npm

### 1. Clone the repository

```bash
git clone https://github.com/RedzoEbad/TodoApp-Kubernetes-deployment.git
cd TodoApp-Kubernetes-deployment
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/todoapp
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests

### Unit Tests (Jest)

```bash
npm test
```

### API Tests (Newman / Postman)

Make sure the server is running first, then:

```bash
npm install -g newman
newman run ./test/TodoApp.postman_collection.json --env-var "baseUrl=http://localhost:3000"
```

### Linting

```bash
npm run lint
```

---

## 🌐 API Reference

All endpoints are under `/api/users/router`.

| Method | Endpoint | Description | Body |
|---|---|---|---|
| `GET` | `/api/users/router` | Fetch all todos (latest 200) | — |
| `POST` | `/api/users/router` | Create a new todo | `{ "text": "..." }` |
| `PATCH` | `/api/users/router` | Update a todo | `{ "id": "...", "text": "...", "done": true }` |
| `DELETE` | `/api/users/router?id=<id>` | Delete a todo by ID | — |

### Example — Create a Todo

```bash
curl -X POST http://localhost:3000/api/users/router \
  -H "Content-Type: application/json" \
  -d '{"text": "Buy groceries"}'
```

### Example — Get All Todos

```bash
curl http://localhost:3000/api/users/router
```

---

## 🐳 Docker

### Build the image

```bash
docker build -t my-todo-app:latest .
```

### Run with MongoDB

```bash
# Start MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:6

# Start the app
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/todoapp \
  my-todo-app:latest
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔄 CI/CD Pipeline

The pipeline runs automatically on every push to `main`.

```
Push to main
    │
    ├─ 1. Checkout & Install dependencies
    ├─ 2. Snyk Security Scan          (dependency vulnerabilities)
    ├─ 3. ESLint Code Linting
    ├─ 4. Jest Unit Tests
    ├─ 5. SonarCloud Code Quality Scan
    ├─ 6. Start MongoDB + Next.js Server
    ├─ 7. Newman API Integration Tests
    ├─ 8. Docker Build
    ├─ 9. Trivy Image Security Scan   (HIGH/CRITICAL CVEs)
    ├─ 10. Login to Docker Hub
    └─ 11. Push image → Docker Hub
```

### Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|---|---|
| `DOCKER_USERNAME` | Your Docker Hub username |
| `DOCKER_PASSWORD` | Your Docker Hub password or access token |
| `SNYK_TOKEN` | Snyk API token from [snyk.io](https://snyk.io) |
| `SONAR_TOKEN` | SonarCloud token from [sonarcloud.io](https://sonarcloud.io) |

---

## 📦 Production Build

```bash
npm run build
npm start
```

---

## 🔗 Links

- **Docker Hub Image:** `docker pull <DOCKER_USERNAME>/my-todo-app:latest`
- **SonarCloud Project:** [RedzoEbad_TodoApp-Kubernetes-deployment](https://sonarcloud.io/project/overview?id=RedzoEbad_TodoApp-Kubernetes-deployment)
- **GitHub Repository:** [TodoApp-Kubernetes-deployment](https://github.com/RedzoEbad/TodoApp-Kubernetes-deployment)
