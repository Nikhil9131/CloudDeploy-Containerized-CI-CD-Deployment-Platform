# CloudDeploy – Containerized CI/CD Deployment Platform

[![Frontend (Vercel)](https://img.shields.io/badge/Frontend-Vercel%20Live-brightgreen.svg?logo=vercel)](https://cloud-deploy-containerized-ci-cd-de.vercel.app)
[![Backend (Render)](https://img.shields.io/badge/Backend-Render%20Live-46E3B7.svg?logo=render)](https://clouddeploy-containerized-ci-cd.onrender.com)
[![Docker](https://img.shields.io/badge/Docker-Multi--stage-blue.svg?logo=docker)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-1.29-326CE5.svg?logo=kubernetes)](https://kubernetes.io/)
[![Terraform](https://img.shields.io/badge/Terraform-1.5+-7B42BC.svg?logo=terraform)](https://www.terraform.io/)
[![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20S3%20%7C%20IAM-FF9900.svg?logo=amazon-aws)](https://aws.amazon.com/)

> 🚀 **Live Production Deployment**:
> - **Web Dashboard (Vercel)**: [https://cloud-deploy-containerized-ci-cd-de.vercel.app](https://cloud-deploy-containerized-ci-cd-de.vercel.app)
> - **REST API Server (Render)**: [https://clouddeploy-containerized-ci-cd.onrender.com](https://clouddeploy-containerized-ci-cd.onrender.com)
> - **Demo Admin Login**: `admin@clouddeploy.io` / `AdminPass123!`
> - **Demo Developer Login**: `developer@clouddeploy.io` / `DevPass123!`

**CloudDeploy** is a production-grade, full-stack DevOps platform designed to orchestrate containerized applications across Docker, Kubernetes, and AWS Cloud Infrastructure. It models a complete continuous delivery lifecycle: from code commit, static analysis, unit testing, and container build/vulnerability scanning to Kubernetes rolling updates, automated health checks, dynamic autoscaling, and zero-downtime rollback recovery.

---

## 1. Architecture Diagram

```mermaid
flowchart TD
    subgraph Developer["Developer Workflow"]
        Dev[Engineer] -->|1. git push| GitRepo[GitHub Repository]
    end

    subgraph CICD["GitHub Actions / CloudDeploy Engine"]
        GitRepo -->|2. Webhook Trigger| Runner[CI/CD Orchestration Engine]
        Runner --> Stg1[1. Checkout Workspace]
        Stg1 --> Stg2[2. Install Dependencies]
        Stg2 --> Stg3[3. Lint & Static Analysis]
        Stg3 --> Stg4[4. Automated Unit Tests]
        Stg4 --> Stg5[5. Application Compilation]
        Stg5 --> Stg6[6. Multi-Stage Docker Build]
        Stg6 --> Stg7[7. Trivy Security Scan]
        Stg7 --> Stg8[8. Push Immutable Digest]
    end

    subgraph Registries["Container & Artifact Registry"]
        Stg8 -->|9. Push Image| ECR[(Amazon ECR / Docker Hub)]
        Stg5 -->|Archive Logs & Build| S3[(Amazon S3 Artifacts Bucket)]
    end

    subgraph KubernetesCluster["AWS EKS / Kubernetes Cluster (Namespace: clouddeploy)"]
        Ingress[ALB / NGINX Ingress Controller] -->|/| FrontendService[Frontend Service:80]
        Ingress -->|/api| BackendService[Backend Service:5000]
        
        FrontendService --> FrontendPods[Frontend Pods x2\nNginx Alpine + React SPA]
        BackendService --> BackendPods[Backend Pods x2-x10\nNode 20 Alpine Non-Root]
        
        BackendPods --> DBService[PostgreSQL Service:5432]
        DBService --> PostgresStatefulSet[PostgreSQL StatefulSet\nPersistentVolumeClaim 10Gi]

        HPA[Horizontal Pod Autoscaler\nCPU > 70% | Mem > 80%] -->|Scale 2-10 Replicas| BackendPods
        ReadinessProbe[Liveness / Readiness Probes\nGET /health 200 OK] -.-> BackendPods
    end

    subgraph AWSCloud["Terraform Provisioned AWS Infrastructure"]
        VPC[VPC 10.0.0.0/16 Multi-AZ]
        VPC --> PubSubnets[2x Public Subnets + IGW]
        VPC --> PrivSubnets[2x Private Subnets + NAT GW]
        PrivSubnets --> EC2Nodes[EC2 Worker Nodes Cluster\nt3.xlarge / m6i.2xlarge]
        IAMRole[IAM Least-Privilege Role\nECR ReadOnly + S3 Artifacts Access] -.-> EC2Nodes
    end

    Stg8 -->|10. Rolling Update| BackendPods
    BackendPods -->|11. Health Check Confirmed| LiveTraffic[Production Live Delivery]
```

---

## 2. Core Features

* **Multi-Stage CI/CD Pipeline Orchestrator**: Executes an automated 11-stage delivery workflow:
  1. *Checkout* &rarr; 2. *Install dependencies* &rarr; 3. *Lint* &rarr; 4. *Unit tests* &rarr; 5. *Build application* &rarr; 6. *Build Docker image* &rarr; 7. *Security scan (Trivy)* &rarr; 8. *Push image (ECR)* &rarr; 9. *Deploy to Kubernetes* &rarr; 10. *Health check* &rarr; 11. *Deployment completed*.
* **Automated Rollback Engine**: Instantly rolls back an unhealthy release to the previous stable release, re-tagging Kubernetes deployments with the verified container image.
* **Kubernetes Orchestration**: Complete manifests including `Deployments`, `StatefulSets`, `Services`, `ConfigMaps`, `Secrets`, `Ingress`, and `HorizontalPodAutoscaler (HPA)`.
* **Dynamic Horizontal Pod Autoscaling**: Scalable from 2 to 10 replicas based on target CPU (70%) and Memory (80%) utilization.
* **Terminal-Style Live Log Stream**: Interactive ANSI log viewer with log level filtering (INFO, WARN, ERROR), search, auto-scroll, and export.
* **AWS Cloud Infrastructure-as-Code**: Modular Terraform configurations provisioning multi-AZ VPC, subnets, EC2 worker nodes, S3 artifact buckets with encryption & lifecycle rules, and IAM security boundaries.
* **Security & RBAC**: JWT session authentication, bcrypt (10 rounds) password hashing, rate limiting, Helmet HTTP headers, Zod schema validation, and role-based access control (`ADMIN`, `DEVELOPER`).

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS, React Router v6, Axios, Recharts, Lucide React |
| **Backend** | Node.js 20+, Express.js, Prisma ORM, PostgreSQL 16, JWT, bcryptjs, Zod, Helmet, Morgan |
| **Containerization** | Docker, Multi-stage builds, Alpine base images, Non-root users, Docker Compose v2 |
| **Orchestration** | Kubernetes 1.29+, StatefulSet, RollingUpdate, HPA, Liveness/Readiness Probes |
| **Cloud (AWS)** | Amazon EC2, Amazon S3, Amazon ECR, AWS IAM, Amazon VPC, Security Groups |
| **IaC & Automation** | Terraform 1.5+, GitHub Actions CI/CD workflows (`ci.yml`, `cd.yml`) |
| **Testing** | Node.js Test Runner, Supertest |

---

## 4. Project Structure

```
CloudDeploy – Containerized CICD Deployment Platform/
├── backend/
│   ├── src/
│   │   ├── config/              # Database connection, env loader, fallback store
│   │   ├── controllers/         # Auth, applications, deployments, monitoring, infra
│   │   ├── middleware/          # JWT auth, RBAC, rate limiting, Zod validation, error handler
│   │   ├── routes/              # Modular Express routing
│   │   ├── services/            # Pipeline orchestrator, rollback, k8s & aws adapters
│   │   ├── utils/               # Structured logger, seed data
│   │   ├── app.js               # Express application initialization
│   │   └── server.js            # Server entrypoint and graceful shutdown
│   ├── prisma/
│   │   ├── schema.prisma        # PostgreSQL schema with 10 models
│   │   └── seed.js              # Database seed script
│   ├── tests/                   # Automated API, auth, CRUD, and deployment tests
│   ├── Dockerfile               # Multi-stage production container with dumb-init
│   ├── .dockerignore
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # PipelineVisualizer, TerminalLogs, MetricCard, StatusBadge, Modal
│   │   │   ├── layout/          # DashboardLayout, Sidebar, Navbar
│   │   │   └── protected/       # ProtectedRoute with RBAC support
│   │   ├── context/             # AuthContext (JWT, user state, demo login presets)
│   │   ├── pages/               # Dashboard, Applications, AppDetails, Deployments, Logs, Infra, Monitoring
│   │   ├── services/            # Axios API client with request/response interceptors
│   │   ├── App.jsx              # Client routing configuration
│   │   ├── index.css            # Custom terminal styling and Tailwind directives
│   │   └── main.jsx
│   ├── nginx.conf               # Nginx reverse proxy configuration
│   ├── Dockerfile               # Multi-stage Nginx Alpine container
│   ├── .dockerignore
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── k8s/
│   ├── namespace.yaml           # Namespace: clouddeploy
│   ├── configmap.yaml           # Environment variables
│   ├── secret.yaml              # Encrypted credentials & database URLs
│   ├── postgres-service.yaml    # Internal PostgreSQL service
│   ├── postgres-statefulset.yaml# PostgreSQL StatefulSet with 10Gi PVC
│   ├── backend-service.yaml     # Backend ClusterIP service:5000
│   ├── backend-deployment.yaml  # Backend Deployment (2 replicas, probes, limits)
│   ├── frontend-service.yaml    # Frontend ClusterIP service:80
│   ├── frontend-deployment.yaml # Frontend Deployment (2 replicas)
│   ├── ingress.yaml             # NGINX Ingress rules routing / and /api
│   └── hpa.yaml                 # Horizontal Pod Autoscaler (2-10 replicas)
├── terraform/
│   ├── provider.tf              # AWS provider and remote state configuration
│   ├── variables.tf             # Configurable parameters
│   ├── main.tf                  # VPC, public/private subnets, IGW, NAT Gateway
│   ├── security-groups.tf       # ALB, EC2, and RDS least-privilege security groups
│   ├── ec2.tf                   # EC2 compute node with Docker bootstrap user_data
│   ├── s3.tf                    # S3 bucket for build artifacts and logs
│   ├── iam.tf                   # EC2 IAM role, instance profile, ECR & S3 policies
│   ├── outputs.tf               # Terraform outputs (IPs, VPC ID, S3 ARNs)
│   └── README.md                # Terraform usage guide
├── .github/
│   └── workflows/
│       ├── ci.yml               # Lint, test, and build CI workflow
│       └── cd.yml               # Containerize, push to ECR, and deploy to Kubernetes
├── docker-compose.yml           # Local multi-container Docker composition
├── .env.example                 # Root environment template
├── .gitignore
└── README.md
```

---

## 5. Local Setup & Quick Start

### Option A: Local Development (Node.js)

1. **Clone repository**:
   ```bash
   git clone https://github.com/clouddeploy-platform/clouddeploy.git
   cd clouddeploy
   ```

2. **Start Backend**:
   ```bash
   cd backend
   npm install
   npx prisma generate
   npm run dev
   ```
   *Backend starts on `http://localhost:5000`.*
   *Health Probe: `http://localhost:5000/health`.*

3. **Start Frontend** (in a separate terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Frontend starts on `http://localhost:5173` (or `http://localhost:5174`).*

4. **Default Demo Credentials**:
   * **Admin User**: `admin@clouddeploy.io` / `AdminPass123!`
   * **Developer User**: `developer@clouddeploy.io` / `DevPass123!`
   *(Or click the **Admin Login** or **Developer Login** quick preset buttons on `/login`).*

---

### Option B: Local Docker Compose (Full Stack)

Run the complete multi-container architecture (PostgreSQL, Backend API, and Nginx Frontend) with one command:

```bash
docker compose up --build -d
```

Check running container status:
```bash
docker compose ps
```

Verify service logs:
```bash
docker compose logs -f backend
```

Access the platform:
* **Web Console**: `http://localhost` (or `http://localhost:3000`)
* **Backend API**: `http://localhost:5000/api`
* **Health Endpoint**: `http://localhost:5000/health`

Tear down containers:
```bash
docker compose down -v
```

---

### Option C: Local Kubernetes Deployment (Minikube / Kind)

1. **Start Minikube**:
   ```bash
   minikube start --cpus=4 --memory=8192
   minikube addons enable ingress
   minikube addons enable metrics-server
   ```

2. **Apply Kubernetes Manifests**:
   ```bash
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/secret.yaml
   kubectl apply -f k8s/postgres-service.yaml
   kubectl apply -f k8s/postgres-statefulset.yaml
   kubectl apply -f k8s/backend-service.yaml
   kubectl apply -f k8s/backend-deployment.yaml
   kubectl apply -f k8s/frontend-service.yaml
   kubectl apply -f k8s/frontend-deployment.yaml
   kubectl apply -f k8s/hpa.yaml
   kubectl apply -f k8s/ingress.yaml
   ```

3. **Verify Pod Rollout**:
   ```bash
   kubectl get pods -n clouddeploy -w
   kubectl get services -n clouddeploy
   kubectl get hpa -n clouddeploy
   ```

---

## 6. AWS Cloud Deployment with Terraform

Provision AWS compute, networking, security groups, and S3 storage:

```bash
cd terraform
terraform init
terraform plan
terraform apply -auto-approve
```

To tear down AWS resources when done:
```bash
terraform destroy -auto-approve
```

---

## 7. API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Kubernetes Liveness/Readiness Probe | No |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate & obtain JWT token | No |
| `GET` | `/api/auth/me` | Get active user profile | Yes |
| `GET` | `/api/applications` | List registered microservices | Yes |
| `POST` | `/api/applications` | Create new application | Yes |
| `GET` | `/api/applications/:id` | Get application details | Yes |
| `PUT` | `/api/applications/:id` | Update application specs | Yes |
| `DELETE`| `/api/applications/:id` | Delete application | Yes (Admin) |
| `PATCH`| `/api/applications/:id/scale` | Scale replica count dynamically | Yes |
| `POST` | `/api/applications/:id/simulate-failure` | Inject simulated failure for demo | Yes |
| `POST` | `/api/applications/:id/deploy` | Trigger deployment pipeline | Yes |
| `GET` | `/api/deployments` | List all historical releases | Yes |
| `GET` | `/api/deployments/:id` | Get 11-stage pipeline run details | Yes |
| `POST` | `/api/deployments/:id/cancel` | Cancel active running pipeline | Yes |
| `POST` | `/api/deployments/:id/rollback` | Roll back to previous stable release | Yes |
| `GET` | `/api/deployments/:id/logs` | Fetch deployment terminal logs | Yes |
| `GET` | `/api/monitoring/dashboard`| Aggregate 8 KPI cards & Recharts data | Yes |
| `GET` | `/api/monitoring/metrics` | Real-time latency percentiles & HPA | Yes |
| `GET` | `/api/infrastructure` | AWS EC2, S3, IAM, and VPC topology | Yes |

---

## 8. Rollback Strategy & Fault Recovery

When a release fails (e.g. unit tests fail, vulnerability scan fails, or pods crash-loop):
1. The developer or admin clicks **"Rollback to Previous Version"** on `/deployments/:id`.
2. The backend identifies the last verified `SUCCESS` deployment for the application.
3. A new `ROLLBACK` deployment is initiated referencing the previous stable container image and commit SHA.
4. The 11-stage pipeline automatically rolls out the stable image to Kubernetes and executes synthetic health checks.
5. Ingress traffic safely reverts without application downtime.

---

## 9. Security Architecture

* **Role-Based Access Control (RBAC)**: Distinguishes `ADMIN` (cluster configuration, deletion, rollback) from `DEVELOPER` (deployments, monitoring).
* **Cryptographic Storage**: Passwords hashed using `bcrypt` (10 rounds). Plaintext passwords are never stored or logged.
* **JWT Expiration & Revocation**: Short-lived JWTs (24h) validated on every request via `authMiddleware`.
* **Zero-Trust Network Model**: PostgreSQL port 5432 is restricted exclusively to the Kubernetes node security group. No public access is permitted.
* **Non-Root Containers**: Container images execute as non-root user `nodejs` (UID 1001), preventing privilege escalation.
* **Input Sanitization**: All incoming request payloads validated against strict `Zod` schemas.

---

## 10. DevOps & SRE Interview Questions & Answers

### Q1: What is the purpose of Kubernetes Liveness and Readiness probes, and how are they implemented in this project?
> **Answer**: A **Readiness Probe** determines whether a pod is ready to accept incoming network traffic. If it fails, Kubernetes stops sending traffic to the pod via the Service. A **Liveness Probe** determines whether a pod is still running and healthy. If it fails, the kubelet kills the container and restarts it according to its restart policy. In CloudDeploy, both probes are configured on `GET /health` (port 5000). The readiness probe has an initial delay of 5s and period of 10s, ensuring the container has connected to PostgreSQL before accepting requests. The liveness probe has a 15s initial delay and 15s period.

### Q2: How does the Horizontal Pod Autoscaler (HPA) make scaling decisions?
> **Answer**: The HPA queries the Kubernetes metrics-server API to obtain resource utilization (CPU and Memory) metrics from the pod cgroups. In our manifest (`k8s/hpa.yaml`), the target CPU utilization is 70% and memory is 80%. When average utilization exceeds 70%, the HPA controller uses the formula: `desiredReplicas = ceil[currentReplicas * (currentMetricValue / targetMetricValue)]` to calculate the new pod count, scaling within the defined bounds of 2 to 10 replicas. We also configure scale-down stabilization windows (300 seconds) to prevent flapping.

### Q3: Explain the zero-downtime rolling update deployment strategy.
> **Answer**: In `backend-deployment.yaml`, we define `strategy: type: RollingUpdate` with `maxSurge: 1` and `maxUnavailable: 0`. This guarantees that during a rollout:
> 1. Kubernetes first provisions 1 new pod running the updated image.
> 2. The new pod is probed using the Readiness Probe (`/health`).
> 3. Only once the new pod returns 200 OK and is ready does Kubernetes terminate one old pod.
> At no point does the available replica count drop below the desired minimum, eliminating downtime.

### Q4: How is sensitive configuration handled across Docker, Kubernetes, and AWS?
> **Answer**: We follow 12-factor application methodology:
> 1. **Kubernetes**: Decoupled using `ConfigMap` for non-sensitive values (`NODE_ENV`, `AWS_REGION`) and `Secret` for sensitive values (`DATABASE_URL`, `JWT_SECRET`).
> 2. **Docker Compose**: Loaded via `.env` file and environment variables.
> 3. **AWS**: IAM roles with temporary STS security tokens rather than hardcoded access keys.

### Q5: How does CloudDeploy handle automated rollbacks?
> **Answer**: CloudDeploy uses an immutable deployment model where each release record stores the specific Docker image digest and Git commit SHA. When a rollback is requested, the system performs an audit query to locate the previous `SUCCESS` deployment. It then creates a new deployment tagged `ROLLBACK`, triggering a Kubernetes rolling update back to the known good container image, verifying health, and recording the rollback relationship in the database for compliance.
