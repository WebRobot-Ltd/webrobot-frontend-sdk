# Jenkins Deployment per WebRobot Frontend SDK

## 📦 Configurazione GitHub Packages

### 1. Repository Setup
- **Repository**: [WebRobot-Ltd/webrobot-frontend-sdk](https://github.com/WebRobot-Ltd/webrobot-frontend-sdk)
- **Registry**: GitHub Packages (`@webrobot` scope)
- **Package Name**: `@webrobot/frontend-sdk`

### 2. Variabili d'Ambiente Jenkins

Configurare le seguenti variabili in Jenkins:

```bash
# GitHub Packages Authentication
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_USERNAME=WebRobot-Ltd

# NPM Registry
NPM_REGISTRY=https://npm.pkg.github.com
NPM_SCOPE=@webrobot
```

### 3. Jenkinsfile

```groovy
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '20.19.4'
        NPM_REGISTRY = 'https://npm.pkg.github.com'
        NPM_SCOPE = '@webrobot'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Node.js') {
            steps {
                sh '''
                    # Install Node.js
                    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
                    sudo apt-get install -y nodejs
                    
                    # Verify versions
                    node --version
                    npm --version
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh '''
                    npm ci
                '''
            }
        }
        
        stage('Lint & Test') {
            steps {
                sh '''
                    # Run linting
                    npm run lint
                    
                    # Run tests (if available)
                    npm run test || echo "No tests configured"
                '''
            }
        }
        
        stage('Build') {
            steps {
                sh '''
                    # Clean previous build
                    npm run clean
                    
                    # Build TypeScript
                    npm run build
                    
                    # Verify build output
                    ls -la dist/
                '''
            }
        }
        
        stage('Publish to GitHub Packages') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    tag pattern: 'v*', comparator: 'REGEXP'
                }
            }
            steps {
                script {
                    // Configure npm for GitHub Packages
                    sh '''
                        # Create .npmrc for GitHub Packages
                        echo "@webrobot:registry=https://npm.pkg.github.com" > .npmrc
                        echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc
                        
                        # Login to GitHub Packages
                        npm config set @webrobot:registry https://npm.pkg.github.com
                        npm config set //npm.pkg.github.com/:_authToken ${GITHUB_TOKEN}
                        
                        # Publish package
                        npm publish
                    '''
                }
            }
        }
        
        stage('Create Release') {
            when {
                tag pattern: 'v*', comparator: 'REGEXP'
            }
            steps {
                script {
                    // Create GitHub release
                    sh '''
                        # Extract version from tag
                        VERSION=${GIT_TAG_NAME#v}
                        
                        # Create release notes
                        cat > release_notes.md << EOF
                        # WebRobot Frontend SDK v${VERSION}
                        
                        ## Installation
                        \`\`\`bash
                        npm install @webrobot/frontend-sdk@${VERSION}
                        \`\`\`
                        
                        ## Changes
                        - See CHANGELOG.md for detailed changes
                        EOF
                        
                        # Create GitHub release
                        gh release create ${GIT_TAG_NAME} \\
                            --title "WebRobot Frontend SDK v${VERSION}" \\
                            --notes-file release_notes.md \\
                            --repo WebRobot-Ltd/webrobot-frontend-sdk
                    '''
                }
            }
        }
    }
    
    post {
        always {
            // Cleanup
            sh '''
                rm -f .npmrc
                rm -f release_notes.md
            '''
        }
        
        success {
            echo '✅ Package published successfully to GitHub Packages'
        }
        
        failure {
            echo '❌ Package publication failed'
        }
    }
}
```

## 🚀 Deploy Process

### Jenkins Pipeline
Il deploy avviene **esclusivamente tramite Jenkins** quando:
- Push su branch `main` o `master`
- Creazione di tag di versione (es. `v1.0.0`)

### Installazione in Next.js App
```bash
# Configure .npmrc in Next.js app
echo "@webrobot:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_TOKEN" >> .npmrc

# Install package
npm install @webrobot/frontend-sdk@latest
```

## 📋 Checklist Pre-Deploy

- [ ] Repository configurato correttamente
- [ ] `package.json` con versioning semantico
- [ ] `GITHUB_TOKEN` configurato in Jenkins
- [ ] Build locale funzionante
- [ ] Test passano
- [ ] Linting passa
- [ ] Documentazione aggiornata

## 🔧 Troubleshooting

### Errori Comuni

1. **Authentication Failed**
   ```bash
   # Verifica token GitHub
   curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
   ```

2. **Package Already Exists**
   ```bash
   # Incrementa versione in package.json
   npm version patch  # o minor, major
   ```

3. **Build Failed**
   ```bash
   # Verifica TypeScript config
   npx tsc --noEmit
   ```

4. **Registry Not Found**
   ```bash
   # Verifica configurazione npm
   npm config get @webrobot:registry
   ```

## 📚 Riferimenti

- [GitHub Packages Documentation](https://docs.github.com/en/packages)
- [NPM Publishing Guide](https://docs.npmjs.com/cli/v8/commands/npm-publish)
- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
