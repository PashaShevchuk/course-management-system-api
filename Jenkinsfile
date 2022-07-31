pipeline {
    agent any
    environment {
        PROJECT_ID = "course-management-system-api"
        CLUSTER_NAME = "cms-cluster"
        LOCATION = "us-central1"
        CREDENTIALS_ID = "Course Management System API"
    }
    stages {
        stage("Checkout code") {
            steps {
                checkout scm
            }
        }
        stage("Build image") {
            steps {
                script {
                    myapp = docker.build("docker2022cms/cms:${env.BUILD_ID}")
                }
            }
        }
        stage("Push image") {
            steps {
                script {
                    docker.withRegistry("https://registry.hub.docker.com", "docker2022cms") {
                            myapp.push("latest")
                            myapp.push("${env.BUILD_ID}")
                    }
                }
            }
        }
        stage("Deploy to GKE") {
            steps{
                sh "sed -i 's/cms-api:latest/cms-api:${env.BUILD_ID}/g' deployment.yaml"
                step([$class: "KubernetesEngineBuilder", projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: "deployment.yaml", credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
            }
        }
    }
}
