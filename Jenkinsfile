pipeline {
    agent {
        label 'ptit-server'
    }
    environment {
         IMAGE_NAME = "toannd135/shoeshop-frontend"
        DOCKER_CREDENTIALS = 'dockerhub-credentials'
        GITHUB_CREDENTIALS = 'github-token'
        CONFIG_REPO_URL = "https://github.com/toannd135/btl-shoeshop-frontend.git"
    }
    stages {
        stage ('Agent information') {
            steps {
                echo " Running on agent: ${env.NODE_NAME}"
                echo " Workspace: ${env.WORKSPACE}"
                sh 'whoami'
                sh 'pwd'
                sh 'uname -a'
            }
        }
        stage ('Checkout source code') {
            steps {
                echo " Cloning source code..."
                checkout scm
                
                echo " Clone completed!"
                sh 'ls -la'
            }
        }
        stage('Get version from Git') {
            steps {
                script {
                    echo " Getting version information from Git..."
                    sh 'git log --oneline -n 10'

                    sh 'git tag --list'

                    def tagVersion = sh (
                        script: "git describe --tags --exact-match 2>/dev/null || git describe --tags --abrev=0 2>/dev/null || git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()

                    env.IMAGE_TAG = tagVersion
                    echo " Version determined: ${env.IMAGE_TAG}"
                    echo " Docker image will be tagged as: ${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                }
            }
        }
    }
}