

# Project Overview

```

├─ User_service_app/                # Full-stack app
│  ├─ backend/
│  │  └─ users-service/             # Spring Boot service
│  ├─ frontend/                     # Next.js frontend
│  ├─ helm/                         # Helm charts (backend, frontend)
│  ├─ argocd/                       # ArgoCD manifests
│  ├─ terraform/                    # Infra as code
│  ├─ docker-compose.yml            # Compose for backend+frontend+db
│  
├─ medallion-etl/                   # PySpark ETL with Jupyter
│  ├─ Dockerfile
│  ├─ docker-compose.yml
│  ├─ workspace/
│  │  └─ Medallion_PySpark_4CSVs.ipynb
│  ├─ data/
│  │  ├─ profiles.csv
│  │  ├─ profile_phones.csv
│  │  ├─ profile_addresses.csv
│  │  └─ profile_history.csv
│  └─ README.md (this doc section)  
│
└─ README.md                       
```

---

# User Service App

A full-stack application with:

* **Backend**: Spring Boot (Java, Maven)
* **Frontend**: Next.js (React, Node.js)
* **Database**: MySQL

Deployment options: Local, Docker Compose, Kubernetes (Helm), GitOps (ArgoCD), Terraform.

---

## 1. Run Locally (no Docker)

### Backend

```bash
cd User_service_app/backend/users-service
./mvnw spring-boot:run
```

→ [http://localhost:8080](http://localhost:8080)

### Frontend

```bash
cd User_service_app/frontend
npm install
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

---

## 2. Run with Docker Compose

```bash
docker compose up --build
```

* Backend → `http://localhost:8080`
* Frontend → `http://localhost:3000`
* MySQL → `localhost:3306`

---

## 3. Run with Kubernetes (Helm)

1. Namespace:

   ```bash
   kubectl create namespace dev
   ```

2. MySQL:

   ```bash
   helm repo add bitnami https://charts.bitnami.com/bitnami
   helm install mysql bitnami/mysql \
     --namespace dev \
     --set auth.rootPassword=root \
     --set auth.database=userdb \
     --set auth.username=user \
     --set auth.password=user123
   ```

3. Backend:

   ```bash
   helm install users-backend ./helm/backend --namespace dev
   ```

4. Frontend:

   ```bash
   helm install users-frontend ./helm/frontend --namespace dev
   ```

5. Access via port-forward:

   ```bash
   kubectl port-forward svc/users-backend 8080:8080 -n dev
   kubectl port-forward svc/users-frontend 3000:3000 -n dev
   ```

---

## 4. GitOps with ArgoCD

```bash
kubectl apply -f User_service_app/argocd/users-backend.yaml
kubectl apply -f User_service_app/argocd/users-frontend.yaml
```

---

## 5. Infra with Terraform

```bash
cd User_service_app/terraform
terraform init
terraform plan
terraform apply
```

---

# Medallion ETL on PySpark

Runs a **PySpark + JupyterLab** stack with Medallion layers:

* **Bronze**: raw + lineage
* **Silver**: cleaned, standardized
* **Gold**: analytics (gender, pincode, profile activity)

---

## Structure

```
medallion-etl/
├─ Dockerfile
├─ docker-compose.yml
├─ workspace/
│  └─ Medallion_PySpark_4CSVs.ipynb
└─ data/
   ├─ profiles.csv
   ├─ profile_phones.csv
   ├─ profile_addresses.csv
   └─ profile_history.csv
```

---

## Run

1. **Start**

   ```bash
   docker compose up -d --build
   ```

2. **Jupyter**

   * URL: [http://localhost:8888/?token=lab](http://localhost:8888/?token=lab)
   * Token configurable via `docker-compose.yml`.

3. **Execute notebook**

   * Open `workspace/Medallion_PySpark_4CSVs.ipynb`
   * Run cells → writes Parquet under `./medallion/pyspark/{bronze|silver|gold}`.

4. **Stop**

   ```bash
   docker compose down
   ```

---

## Optional: MySQL Output

* Default DB: `medallion` (root/root)
* Host: `mysql` (inside Docker network)

Create DBs if needed:

```bash
docker exec -it medallion-mysql mysql -uroot -proot -e \
"CREATE DATABASE IF NOT EXISTS bronze; \
 CREATE DATABASE IF NOT EXISTS silver; \
 CREATE DATABASE IF NOT EXISTS gold;"
```

Notebook flag:

```python
WRITE_TO_MYSQL = True
```


