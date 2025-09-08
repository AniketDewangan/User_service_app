
# User Service App

A full-stack application consisting of:
- **Backend**: Spring Boot (Java, Maven)  
- **Frontend**: Next.js (React, Node.js)  
- **Database**: MySQL  

This project is containerized with Docker and can be deployed in multiple ways:
- Local development (run backend & frontend separately)
- Docker Compose
- Kubernetes via Helm
- GitOps with ArgoCD
- Terraform (for infra provisioning)

---

## 1. Run Locally (Without Docker)

### Backend (Spring Boot)
```bash
cd User_service_app/backend/users-service
./mvnw spring-boot:run


The backend will start at [http://localhost:8080](http://localhost:8080).

### Frontend (Next.js)
cd User_service_app/frontend
npm install
npm run dev
```

The frontend will start at [http://localhost:3000](http://localhost:3000).

### Database

Ensure MySQL is running locally.
Create a database `userdb` and configure credentials in:

```
User_service_app/backend/users-service/src/main/resources/application.yml
```

---

## 2. Run with Docker Compose

Make sure Docker is installed and running.

```bash
docker-compose up --build
```

* Backend will be available at `http://localhost:8080`
* Frontend will be available at `http://localhost:3000`
* MySQL at port `3306` (configured in `docker-compose.yml`)

---

## 3. Run with Kubernetes (Helm)



### **Step 0: Make sure Kubernetes is running**

```cmd
kubectl config current-context
kubectl get nodes
```

* Context should be `docker-desktop` or your desired cluster.
* Node status should be `Ready`.


### **Step 1: Create a namespace**

```cmd
kubectl create namespace dev
```

* All resources (MySQL, backend, frontend) will live in `dev`.
* Helps keep things organized.

Check:

```cmd
kubectl get namespaces
```



### **Step 2: Deploy MySQL using Bitnami Helm chart**

```cmd
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

helm install mysql bitnami/mysql ^
  --namespace dev ^
  --set auth.rootPassword=root ^
  --set auth.database=userdb ^
  --set auth.username=user ^
  --set auth.password=user123
```

* `mysql` → Helm release name.
* This will create MySQL pods, service, and PVC for storage.

Check pods:

```cmd
kubectl get pods -n dev
```

* Wait until MySQL pod is `Running`.

Check service:

```cmd
kubectl get svc -n dev
```

* Service name will be `mysql`, port `3306`.



### **Step 3: Deploy backend Helm chart**

```cmd
helm install users-backend ./helm/backend --namespace dev
```

Verify:

```cmd
kubectl get pods -n dev
kubectl get svc -n dev
```

* Service: `users-backend`, port `8080`.



### **Step 4: Deploy frontend Helm chart**

```cmd
helm install users-frontend ./helm/frontend --namespace dev
```

Verify:

```cmd
kubectl get pods -n dev
kubectl get svc -n dev
```

* Service: `users-frontend`, port `3000`.

---

### **Step 5: Access services locally via port-forwarding**

#### Backend:

```cmd
kubectl port-forward svc/users-backend 8080:8080 -n dev
```

* Backend API accessible at: `http://localhost:8080`

#### Frontend:

```cmd
kubectl port-forward svc/users-frontend 3000:3000 -n dev
```

* Frontend accessible at: `http://localhost:3000`

---

## 4. Run with ArgoCD (GitOps)

### Prerequisites

* Kubernetes cluster with ArgoCD installed
* `kubectl` access to the cluster

### Apply ArgoCD Manifests

```bash
kubectl apply -f User_service_app/argocd/users-backend.yaml
kubectl apply -f User_service_app/argocd/users-frontend.yaml
```

ArgoCD will sync and deploy both frontend and backend automatically.

---

## 5. Infrastructure with Terraform

Infrastructure provisioning is defined under `User_service_app/terraform/`.

### Example

```bash
cd User_service_app/terraform
terraform init
terraform plan
terraform apply
```

---

## 6. Project Structure

```
User_service_app/
│── backend/
│   └── users-service/         # Spring Boot backend
│── frontend/                  # Next.js frontend
│── argocd/                    # ArgoCD manifests
│── helm/                      # Helm charts
│── terraform/                 # Infra provisioning
│── docker-compose.yml         # Local Docker Compose setup
│── README.md                  # Project instructions
```

