// POST /auth/login
// - Validate email/password
// - Check if first login
// - Create session in Redis
// - Return tokens + user info
// - If first login: require password change