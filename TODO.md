# TODO List for Handling Local Dev Without DB, Build, and Post-Deploy Testing

- [ ] Modify src/server.js to conditionally skip database connection in local development (NODE_ENV !== 'production')
- [ ] Review and ensure build.sh and build_server.sh are ready for deployment
- [ ] Create test_deploy.sh script for post-deploy testing, health check, and error logging
