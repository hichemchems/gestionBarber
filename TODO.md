# TODO List for Handling Local Dev Without DB, Build, and Post-Deploy Testing

- [x] Modify src/server.js to conditionally skip database connection in local development (NODE_ENV !== 'production')
- [x] Review and ensure build.sh and build_server.sh are ready for deployment
- [x] Create test_deploy.sh script for post-deploy testing, health check, and error logging
- [x] Fix frontend build issue - ensure dist/public contains index.html and assets
- [x] Update build.sh to include frontend files in deploy
