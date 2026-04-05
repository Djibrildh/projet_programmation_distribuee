## **Instructions pour reproduire le projet**
#### L'ensemble du projet est reproductible depuis un poste Windows 11 équipé de Docker Desktop, Minikube et kubectl. Les étapes sont les suivantes.

Démarrer Minikube et activer l'Ingress
```
minikube start --driver=docker
minikube addons enable ingress
minikube -p minikube docker-env --shell powershell | Invoke-Expression
```
Déployer toutes les ressources Kubernetes
```
kubectl apply -f k8s/mysql-deployment.yaml
kubectl wait --for=condition=ready pod -l app=mysql --timeout=120s
kubectl apply -f k8s/rbac.yaml
kubectl apply -f k8s/network-policies.yaml
kubectl apply -f k8s/products-deployment.yaml
kubectl apply -f k8s/orders-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```
Exposer les services (un terminal par commande c’est plus sur)
```
kubectl port-forward service/products-service 3001:3001
kubectl port-forward service/orders-service 3002:3002
kubectl port-forward service/frontend-service 8080:80
```
Accéder à l'application
Ouvrir http://localhost:8080 dans un navigateur pour accéder au front-end React, ou interroger directement les APIs via curl.exe sur les ports 3001 et 3002.
