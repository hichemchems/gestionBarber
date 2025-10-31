# TODO - GestionBarber Deployment & Features

## Phase 1: Minimal Deployment (Current Priority)
- [ ] Create truly minimal Express server (no DB, just static files + health check)
- [ ] Build minimal server to CommonJS
- [ ] Update deploy/package.json with minimal dependencies
- [ ] Test minimal server locally
- [ ] Deploy minimal version to o2switch
- [ ] Verify Passenger starts minimal app successfully
- [ ] Confirm static file serving works

## Phase 2: Core Features Implementation
- [ ] Add authentication system (JWT, bcrypt)
- [ ] Implement user management (register, login, roles)
- [ ] Add employee management
- [ ] Create package management
- [ ] Implement sales tracking
- [ ] Add receipt management
- [ ] Create expense tracking
- [ ] Add salary calculation
- [ ] Implement admin charges

## Phase 3: Dashboard & Analytics
- [ ] Build Admin Dashboard with analytics
- [ ] Create Employee Dashboard
- [ ] Add revenue charts and graphs
- [ ] Implement goal tracking
- [ ] Add alert system
- [ ] Create performance reports

## Phase 4: Advanced Features
- [ ] File upload for documents/contracts
- [ ] Export functionality (PDF, Excel)
- [ ] Email notifications
- [ ] Backup system
- [ ] Multi-language support

## Phase 5: Production Optimization
- [ ] Database connection and migrations
- [ ] Environment variables configuration
- [ ] Security hardening (helmet, rate limiting, CSRF)
- [ ] Performance optimization
- [ ] Monitoring and logging
- [ ] Automated deployment pipeline

## Deployment Checklist
- [ ] Follow o2switch Phusion Passenger documentation exactly
- [ ] Set NODE_ENV=production in cPanel
- [ ] Configure database environment variables
- [ ] Set correct file permissions (755 for dirs, 644 for files)
- [ ] Test each deployment incrementally
- [ ] Monitor Passenger logs for errors
- [ ] Contact o2switch support when needed
