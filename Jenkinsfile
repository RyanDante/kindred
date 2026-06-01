pipeline {
  agent any
  environment {
    REGISTRY = 'registry.example.com'
    IMAGE = "${REGISTRY}/kindred:latest"
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install') {
      steps { sh 'npm ci' }
    }

    stage('Build') {
      steps { sh 'npm run build' }
    }

    stage('Docker Build & Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-registry', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo Logging into registry'
          sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS $REGISTRY'
          sh 'docker build -t $IMAGE .'
          sh 'docker push $IMAGE'
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
          sh 'export KUBECONFIG=$KUBECONFIG_FILE'
          sh 'kubectl apply -f k8s/'
        }
      }
    }
  }
  post {
    always { echo 'Pipeline finished' }
  }
}
