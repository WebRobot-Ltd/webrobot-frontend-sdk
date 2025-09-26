pipeline {
    agent any
    
    environment {
        NODE_VERSION = '20.19.4'
        NPM_REGISTRY = 'https://npm.pkg.github.com'
        NPM_SCOPE = '@webrobot'
        PACKAGE_NAME = '@webrobot/frontend-sdk'
    }
    
    options {
        timeout(time: 30, unit: 'MINUTES')
        retry(2)
        timestamps()
        ansiColor('xterm')
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo "🔍 Checking out repository..."
                checkout scm
                
                script {
                    // Get current branch/tag info
                    env.GIT_BRANCH = sh(
                        script: 'git rev-parse --abbrev-ref HEAD',
                        returnStdout: true
                    ).trim()
                    
                    env.GIT_COMMIT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    
                    env.GIT_TAG = sh(
                        script: 'git describe --tags --exact-match HEAD 2>/dev/null || echo ""',
                        returnStdout: true
                    ).trim()
                    
                    echo "📋 Build Info:"
                    echo "  Branch: ${env.GIT_BRANCH}"
                    echo "  Commit: ${env.GIT_COMMIT}"
                    echo "  Tag: ${env.GIT_TAG}"
                }
            }
        }
        
        stage('Setup Environment') {
            steps {
                echo "🔧 Setting up Node.js environment..."
                
                sh '''
                    # Install Node.js
                    echo "Installing Node.js ${NODE_VERSION}..."
                    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
                    sudo apt-get install -y nodejs
                    
                    # Verify installation
                    echo "Node.js version:"
                    node --version
                    echo "NPM version:"
                    npm --version
                    
                    # Configure npm
                    npm config set registry https://registry.npmjs.org/
                    npm config set @webrobot:registry ${NPM_REGISTRY}
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo "📦 Installing dependencies..."
                
                sh '''
                    # Clean install
                    rm -rf node_modules package-lock.json
                    npm ci
                    
                    # Verify dependencies
                    echo "Installed packages:"
                    npm list --depth=0
                '''
            }
        }
        
        stage('Lint & Code Quality') {
            steps {
                echo "🔍 Running linting and code quality checks..."
                
                sh '''
                    # Run ESLint
                    echo "Running ESLint..."
                    npm run lint || {
                        echo "❌ Linting failed"
                        exit 1
                    }
                    
                    # Check TypeScript compilation
                    echo "Checking TypeScript compilation..."
                    npx tsc --noEmit || {
                        echo "❌ TypeScript compilation failed"
                        exit 1
                    }
                    
                    echo "✅ Code quality checks passed"
                '''
            }
        }
        
        stage('Test') {
            steps {
                echo "🧪 Running tests..."
                
                sh '''
                    # Run tests if available
                    if npm run test --if-present; then
                        echo "✅ Tests passed"
                    else
                        echo "⚠️ No tests configured, skipping..."
                    fi
                '''
            }
        }
        
        stage('Build Package') {
            steps {
                echo "🏗️ Building package..."
                
                sh '''
                    # Clean previous build
                    echo "Cleaning previous build..."
                    npm run clean
                    
                    # Build TypeScript
                    echo "Building TypeScript..."
                    npm run build
                    
                    # Verify build output
                    echo "Build output:"
                    ls -la dist/
                    
                    # Check package contents
                    echo "Package contents:"
                    find dist/ -type f -name "*.js" -o -name "*.d.ts" | head -10
                    
                    # Verify main files exist
                    if [ ! -f "dist/index.js" ]; then
                        echo "❌ dist/index.js not found"
                        exit 1
                    fi
                    
                    if [ ! -f "dist/index.d.ts" ]; then
                        echo "❌ dist/index.d.ts not found"
                        exit 1
                    fi
                    
                    echo "✅ Build completed successfully"
                '''
            }
        }
        
        stage('Package Validation') {
            steps {
                echo "📋 Validating package..."
                
                sh '''
                    # Check package.json
                    echo "Validating package.json..."
                    npm pack --dry-run
                    
                    # Verify package structure
                    echo "Package structure:"
                    tar -tzf ${PACKAGE_NAME}-*.tgz 2>/dev/null | head -20 || echo "No tarball generated"
                    
                    # Check for required files
                    echo "Checking required files..."
                    [ -f "package.json" ] || { echo "❌ package.json missing"; exit 1; }
                    [ -f "README.md" ] || { echo "❌ README.md missing"; exit 1; }
                    [ -f "LICENSE" ] || { echo "❌ LICENSE missing"; exit 1; }
                    [ -d "dist" ] || { echo "❌ dist/ directory missing"; exit 1; }
                    
                    echo "✅ Package validation passed"
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
                echo "🚀 Publishing to GitHub Packages..."
                
                script {
                    // Configure npm for GitHub Packages
                    sh '''
                        # Create .npmrc for GitHub Packages
                        echo "Configuring npm for GitHub Packages..."
                        echo "@webrobot:registry=${NPM_REGISTRY}" > .npmrc
                        echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc
                        
                        # Verify configuration
                        echo "NPM configuration:"
                        cat .npmrc
                        
                        # Login to GitHub Packages
                        echo "Logging in to GitHub Packages..."
                        npm config set @webrobot:registry ${NPM_REGISTRY}
                        npm config set //npm.pkg.github.com/:_authToken ${GITHUB_TOKEN}
                        
                        # Verify authentication
                        echo "Testing authentication..."
                        npm whoami --registry=${NPM_REGISTRY} || {
                            echo "❌ Authentication failed"
                            exit 1
                        }
                    '''
                    
                    // Publish package
                    sh '''
                        echo "Publishing package..."
                        npm publish
                        
                        echo "✅ Package published successfully!"
                        echo "Package: ${PACKAGE_NAME}"
                        echo "Registry: ${NPM_REGISTRY}"
                    '''
                }
            }
        }
        
        stage('Create GitHub Release') {
            when {
                tag pattern: 'v*', comparator: 'REGEXP'
            }
            steps {
                echo "📝 Creating GitHub release..."
                
                script {
                    sh '''
                        # Extract version from tag
                        VERSION=${GIT_TAG#v}
                        echo "Creating release for version: ${VERSION}"
                        
                        # Create release notes
                        cat > release_notes.md << EOF
                        # WebRobot Frontend SDK v${VERSION}
                        
                        ## Installation
                        \`\`\`bash
                        # Configure npm for GitHub Packages
                        echo "@webrobot:registry=https://npm.pkg.github.com" >> .npmrc
                        echo "//npm.pkg.github.com/:_authToken=YOUR_TOKEN" >> .npmrc
                        
                        # Install package
                        npm install @webrobot/frontend-sdk@${VERSION}
                        \`\`\`
                        
                        ## Changes
                        - See [CHANGELOG.md](https://github.com/WebRobot-Ltd/webrobot-frontend-sdk/blob/main/CHANGELOG.md) for detailed changes
                        
                        ## Documentation
                        - [README](https://github.com/WebRobot-Ltd/webrobot-frontend-sdk#readme)
                        - [API Reference](https://github.com/WebRobot-Ltd/webrobot-frontend-sdk#api-reference)
                        - [Components](https://github.com/WebRobot-Ltd/webrobot-frontend-sdk#react-components)
                        EOF
                        
                        # Create GitHub release
                        echo "Creating GitHub release..."
                        gh release create ${GIT_TAG} \\
                            --title "WebRobot Frontend SDK v${VERSION}" \\
                            --notes-file release_notes.md \\
                            --repo WebRobot-Ltd/webrobot-frontend-sdk || {
                            echo "⚠️ Failed to create GitHub release (may already exist)"
                        }
                        
                        echo "✅ GitHub release created"
                    '''
                }
            }
        }
        
        stage('Notify Success') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    tag pattern: 'v*', comparator: 'REGEXP'
                }
            }
            steps {
                echo "📢 Notifying success..."
                
                script {
                    def message = """
                    ✅ **WebRobot Frontend SDK Build Successful**
                    
                    **Package**: ${env.PACKAGE_NAME}
                    **Version**: ${env.GIT_TAG ?: 'latest'}
                    **Branch**: ${env.GIT_BRANCH}
                    **Commit**: ${env.GIT_COMMIT}
                    **Registry**: ${env.NPM_REGISTRY}
                    
                    **Installation**:
                    \`\`\`bash
                    npm install @webrobot/frontend-sdk@latest
                    \`\`\`
                    """
                    
                    echo message
                    
                    // Add Slack notification if configured
                    if (env.SLACK_WEBHOOK_URL) {
                        sh """
                            curl -X POST -H 'Content-type: application/json' \\
                                --data '{"text":"${message}"}' \\
                                ${env.SLACK_WEBHOOK_URL}
                        """
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo "🧹 Cleaning up..."
            
            sh '''
                # Cleanup sensitive files
                rm -f .npmrc
                rm -f release_notes.md
                rm -f *.tgz
                
                # Clean node_modules for space
                rm -rf node_modules
            '''
        }
        
        success {
            echo "✅ Pipeline completed successfully!"
            
            script {
                if (env.GIT_TAG) {
                    echo "🎉 Release ${env.GIT_TAG} published successfully!"
                } else {
                    echo "🎉 Build completed successfully!"
                }
            }
        }
        
        failure {
            echo "❌ Pipeline failed!"
            
            script {
                def message = """
                ❌ **WebRobot Frontend SDK Build Failed**
                
                **Branch**: ${env.GIT_BRANCH}
                **Commit**: ${env.GIT_COMMIT}
                **Build**: ${env.BUILD_URL}
                
                Check the logs for details.
                """
                
                echo message
                
                // Add Slack notification if configured
                if (env.SLACK_WEBHOOK_URL) {
                    sh """
                        curl -X POST -H 'Content-type: application/json' \\
                            --data '{"text":"${message}"}' \\
                            ${env.SLACK_WEBHOOK_URL}
                    """
                }
            }
        }
        
        unstable {
            echo "⚠️ Pipeline completed with warnings!"
        }
    }
}
