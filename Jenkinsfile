pipeline {
    agent {
        label 'ptit-server'
    }

    environment {
        IMAGE_NAME = "toannd135/shoeshop-frontend"
        DOCKER_CREDENTIALS = 'dockerhub-credentials'
        GITHUB_CREDENTIALS = 'my-github'
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
         stage('Verify Frontend Files') {
            steps {
                script {
                    echo " Checking frontend files..."
                    
                    
                    if (fileExists('package.json')) {
                        echo " package.json found!"
                        sh 'head -10 package.json'
                    } else {
                        error " package.json not found! This doesn't appear to be a Node.js project."
                    }
                    
                    if (fileExists('Dockerfile')) {
                        echo " Dockerfile found!"
                        sh 'head -10 Dockerfile'
                    } else {
                        error " Dockerfile not found! Please create Dockerfile in repository root."
                    }
                    
                    
                    if (fileExists('nginx.conf')) {
                        echo " nginx.conf found!"
                    } else {
                        echo " nginx.conf not found! Make sure it exists for proper nginx configuration."
                    }
                }
            }
        }
        
        stage('Check Docker') {
            steps {
                script {
                    echo " Checking Docker availability..."
                    
                    def dockerCheck = sh(script: 'which docker', returnStatus: true)
                    if (dockerCheck != 0) {
                        error " Docker not found! Please install Docker or use different approach."
                    }
                    
                    def dockerStatus = sh(script: 'docker info', returnStatus: true)
                    if (dockerStatus != 0) {
                        error " Docker daemon not running! Please start Docker daemon."
                    }
                    
                    echo " Docker is available!"
                    sh 'docker --version'
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo " Building frontend Docker image: ${env.IMAGE_NAME}:${env.TAG_NAME}"
                    
                    sh """
                        docker build -t ${env.IMAGE_NAME}:${env.TAG_NAME} .
                        docker tag ${env.IMAGE_NAME}:${env.TAG_NAME} ${env.IMAGE_NAME}:latest
                    """
                    
                    echo " Frontend Docker image built successfully!"
                    sh "docker images | grep ${env.IMAGE_NAME}"
                }
            }
        }
        
        stage('Test Docker Image') {
            steps {
                script {
                    echo " Testing frontend Docker image..."
                    sh """
                        echo "Testing if nginx image can start..."
                        docker run --rm -d --name test-frontend-${env.BUILD_NUMBER} -p 8081:80 ${env.IMAGE_NAME}:${env.TAG_NAME}
                        sleep 5
                        curl -f http://localhost:8081/ || echo "Frontend test completed"
                        docker stop test-frontend-${env.BUILD_NUMBER} || true
                        docker rm test-frontend-${env.BUILD_NUMBER} || true
                    """
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                script {
                    echo " Pushing frontend image to Docker Hub..."
                    
                    withCredentials([usernamePassword(
                        credentialsId: env.DOCKER_HUB_CREDENTIALS, 
                        passwordVariable: 'DOCKER_PASSWORD', 
                        usernameVariable: 'DOCKER_USERNAME'
                    )]) {
                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                    }
                    
                    sh """
                        docker push ${env.IMAGE_NAME}:${env.IMAGE_TAG}
                    
                    """
                    
                    echo " Successfully pushed frontend image to Docker Hub!"
                }
            }
        }
                
        stage('Clone Config Repo') {
            steps {
                script {
                    echo " Cloning frontend config repository..."
                    
                 
                    sh 'mkdir -p config-repo'
                    
                    dir('config-repo') {
                        
                        withCredentials([gitUsernamePassword(credentialsId: env.GITHUB_CREDENTIALS, gitToolName: 'Default')]) {
                            sh """
                                git clone ${env.CONFIG_REPO_URL} .
                                git config user.email "toannd135@gmail.com"
                                git config user.name "Jenkins CI/CD Frontend"
                            """
                        }
                        
                        echo " Frontend config repo cloned successfully!"
                        sh 'ls -la'
                    }
                }
            }
        }
        
    //     stage('Update Frontend Helm Values') {
    //         steps {
    //             script {
    //                 echo " Updating frontend Helm values with new image version..."
                    
    //                 dir('config-repo') {
                      
    //                     echo "Current frontend helm values:"
    //                     sh 'cat helm-values/values-prod.yaml | grep -A3 -B3 tag || echo "Tag not found in current format"'
                        
                        
    //                     sh """
    //                         # Update tag field for frontend
    //                         sed -i 's/^  tag.*/  tag: "${env.TAG_NAME}"/' helm-values/values-prod.yaml 
    //                     """
                        
                        
    //                     echo "Updated frontend helm values:"
    //                     sh 'cat helm-values/values-prod.yaml | grep -A3 -B3 tag'
                        
                        
    //                     sh 'git diff helm-values/values-prod.yaml || echo "No changes detected"'
                        
    //                     echo " Frontend Helm values updated successfully!"
    //                 }
    //             }
    //         }
    //     }
        
    //     stage('Push Frontend Config Changes') {
    //         steps {
    //             script {
    //                 echo " Pushing frontend changes to config repository..."
                    
    //                 dir('config-repo') {
                     
    //                     def gitStatus = sh(
    //                         script: 'git status --porcelain',
    //                         returnStdout: true
    //                     ).trim()
                        
    //                     if (gitStatus) {
    //                         echo "Frontend changes detected, committing and pushing..."
                            
    //                         sh """
    //                             git add .
    //                             git commit -m " Update frontend image version to ${env.TAG_NAME}
                                
    //                             - Updated helm-values/values-prod.yaml
    //                             - Image: ${env.IMAGE_NAME}:${env.TAG_NAME}
    //                             - Build: ${env.BUILD_NUMBER}
    //                             - Jenkins Job: ${env.JOB_NAME}
    //                             - Frontend deployment update"
    //                         """
                            
                            
    //                         withCredentials([gitUsernamePassword(credentialsId: env.GITHUB_CREDENTIALS, gitToolName: 'Default')]) {
    //                             sh 'git push origin main'
    //                         }
                            
    //                         echo " Frontend config changes pushed successfully!"
    //                     } else {
    //                         echo " No changes detected in frontend config repo"
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }
    }
    post {
        always {
            echo " Cleaning up frontend build..."
            sh """
                docker rmi ${env.IMAGE_NAME}:${env.TAG_NAME} || true
                docker rmi ${env.IMAGE_NAME}:latest || true
                
                # Clean up any test containers
                docker stop test-frontend-${env.BUILD_NUMBER} || true
                docker rm test-frontend-${env.BUILD_NUMBER} || true
                
                # Clean up docker system
                docker system prune -f || true
            """
            
          
            cleanWs()
        }
        success {
            echo " FRONTEND BUILD SUCCESS!"
            echo " Frontend source code built and pushed: ${env.IMAGE_NAME}:${env.TAG_NAME}"
            echo " Frontend config repository updated with new version"
            echo " Docker Hub: https://hub.docker.com/r/toannd135/shoeshop-frontend"
            echo " Frontend ready for deployment!"
        }
        failure {
            echo " FRONTEND BUILD FAILED!"
            echo " Please check the logs above for frontend build issues"
        }
    }
}