# 📝 TodoApp

A full-stack **Todo application** built with **Next.js**, **MongoDB**, and **TypeScript**. It is containerized with Docker and features an automated CI/CD pipeline that ensures code quality and security.

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install
```bash
git clone https://github.com/RedzoEbad/TodoApp-Kubernetes-deployment.git
cd TodoApp-Kubernetes-deployment
npm install
```

### 2. Configure Environment
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/todoapp
```
*(Make sure you have MongoDB running locally!)*

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🐳 Running with Docker

You can easily run the application using Docker without installing Node.js locally.

```bash
# 1. Start a local MongoDB container
docker run -d --name mongodb -p 27017:27017 mongo:6

# 2. Build the TodoApp image
docker build -t my-todo-app:latest .

# 3. Run the TodoApp container
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/todoapp \
  my-todo-app:latest
```

---

## 🔄 How Our CI/CD Pipeline Works

Our project uses **GitHub Actions** to automate testing, security scanning, and deployment. Every time code is pushed to the `main` branch, the following automated pipeline is triggered:

1. **Environment Setup**: Checks out the code and sets up Node.js 20.
2. **Dependency Installation**: Installs NPM packages cleanly.
3. **Dependency Security Scan**: Runs **Snyk** to detect high-severity vulnerabilities in our open-source dependencies.
4. **Code Quality & Linting**: Lints the codebase and executes **Jest** unit tests.
5. **Static Code Analysis**: Runs **SonarCloud** to check for code smells, bugs, and maintainability.
6. **Integration & API Testing**:
   - Spins up a background MongoDB container.
   - Builds and starts the Next.js server.
   - Runs automated API tests against the live server using **Newman (Postman)**.
7. **Docker Build**: Packages the successfully tested application into a Docker image.
8. **Container Security Scan**: Uses **Trivy** to scan the newly built Docker image for high and critical vulnerabilities.
9. **Publish to Registry**: Logs into Docker Hub and pushes the final, secure image so it's ready for deployment.
