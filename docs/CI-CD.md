**Overview**

This document describes a minimal Docker, Kubernetes, and Jenkins setup for the front-end app.

Files added:

- [Dockerfile](Dockerfile)
- [.dockerignore](.dockerignore)
- [nginx.conf](nginx.conf)
- [k8s/deployment.yaml](k8s/deployment.yaml)
- [k8s/service.yaml](k8s/service.yaml)
- [k8s/ingress.yaml](k8s/ingress.yaml)
- [k8s/secret-example.yaml](k8s/secret-example.yaml)
- [Jenkinsfile](Jenkinsfile)

Quick local build & run (Docker):

```bash
# build
docker build -t kindred:local .
# run
docker run --rm -p 8080:80 kindred:local
```

Push to registry (example):

```bash
docker tag kindred:local registry.example.com/kindred:latest
docker push registry.example.com/kindred:latest
```

Kubernetes deploy (after pushing image and configuring secrets):

```bash
# set image in k8s/deployment.yaml or use kubectl set image
kubectl apply -f k8s/
```

Jenkins notes:
- Create credentials:
  - `docker-registry`: type `Username with password` for your registry
  - `kubeconfig`: type `Secret file` containing kubeconfig for cluster
- Update `REGISTRY` in `Jenkinsfile` to your registry.
- Job will run: checkout → install → build → docker build & push → kubectl apply

Runtime config note:
- Vite inlines `VITE_` env vars at build time. If you need to change Firebase keys at runtime, use a small runtime configuration script (e.g. fetch from a ConfigMap or mount a JSON file and load it in `index.html`), or perform the build in CI using the desired `VITE_` variables.
