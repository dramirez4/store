// ========================================
// COMPREHENSIVE POSTMAN TEST SCRIPTS
// ========================================

// ========================================
// LOGIN TESTS
// ========================================

// Admin Login Test Script
const adminLoginTests = `
pm.test("Admin Login - Status Code", function () {
    pm.response.to.have.status(200);
});

pm.test("Admin Login - Response Structure", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('message');
    pm.expect(response).to.have.property('user');
    pm.expect(response).to.have.property('token');
    pm.expect(response.message).to.eql('Login successful');
});

pm.test("Admin Login - User Role", function () {
    const response = pm.response.json();
    pm.expect(response.user.role).to.eql('admin');
});

// Save token automatically
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("admin_token", response.token);
    pm.environment.set("current_token", response.token);
    console.log("Admin token saved:", response.token);
}
`;

// Worker Login Test Script
const workerLoginTests = `
pm.test("Worker Login - Status Code", function () {
    pm.response.to.have.status(200);
});

pm.test("Worker Login - User Role", function () {
    const response = pm.response.json();
    pm.expect(response.user.role).to.eql('worker');
});

// Save token automatically
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("worker_token", response.token);
    pm.environment.set("current_token", response.token);
    console.log("Worker token saved:", response.token);
}
`;

// Sales Login Test Script
const salesLoginTests = `
pm.test("Sales Login - Status Code", function () {
    pm.response.to.have.status(200);
});

pm.test("Sales Login - User Role", function () {
    const response = pm.response.json();
    pm.expect(response.user.role).to.eql('sales');
});

// Save token automatically
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("sales_token", response.token);
    pm.environment.set("current_token", response.token);
    console.log("Sales token saved:", response.token);
}
`;

// ========================================
// PROTECTED ROUTE TESTS
// ========================================

// Profile Route Test Script
const profileTests = `
pm.test("Profile - Status Code", function () {
    pm.response.to.have.status(200);
});

pm.test("Profile - Response Structure", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('user');
    pm.expect(response.user).to.have.property('id');
    pm.expect(response.user).to.have.property('name');
    pm.expect(response.user).to.have.property('email');
    pm.expect(response.user).to.have.property('role');
});

pm.test("Profile - No Password in Response", function () {
    const response = pm.response.json();
    pm.expect(response.user).to.not.have.property('password');
});
`;

// Admin Users Route Test Script
const adminUsersTests = `
pm.test("Admin Users - Status Code", function () {
    pm.response.to.have.status(200);
});

pm.test("Admin Users - Response Structure", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('users');
    pm.expect(response.users).to.be.an('array');
});

pm.test("Admin Users - Users Have Required Fields", function () {
    const response = pm.response.json();
    response.users.forEach(user => {
        pm.expect(user).to.have.property('id');
        pm.expect(user).to.have.property('name');
        pm.expect(user).to.have.property('email');
        pm.expect(user).to.have.property('role');
        pm.expect(user).to.not.have.property('password');
    });
});
`;

// Worker Inventory Route Test Script
const workerInventoryTests = `
pm.test("Worker Inventory - Status Code", function () {
    pm.response.to.have.status(200);
});

pm.test("Worker Inventory - Response Structure", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('inventory');
    pm.expect(response.inventory).to.be.an('array');
});

pm.test("Worker Inventory - Items Have Required Fields", function () {
    const response = pm.response.json();
    response.inventory.forEach(item => {
        pm.expect(item).to.have.property('id');
        pm.expect(item).to.have.property('name');
        pm.expect(item).to.have.property('model');
        pm.expect(item).to.have.property('size');
        pm.expect(item).to.have.property('stockLevel');
    });
});
`;

// Sales Orders Route Test Script
const salesOrdersTests = `
pm.test("Sales Orders - Status Code", function () {
    pm.response.to.have.status(200);
});

pm.test("Sales Orders - Response Structure", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('orders');
    pm.expect(response.orders).to.be.an('array');
});
`;

// ========================================
// AUTHORIZATION TESTS (Expected Failures)
// ========================================

// Test for unauthorized access
const unauthorizedTests = `
pm.test("Unauthorized Access - Status Code", function () {
    pm.response.to.have.status(403);
});

pm.test("Unauthorized Access - Error Message", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('error');
    pm.expect(response.error).to.include('access');
});
`;

// ========================================
// REGISTRATION TESTS
// ========================================

const registrationTests = `
pm.test("Registration - Status Code", function () {
    pm.response.to.have.status(201);
});

pm.test("Registration - Response Structure", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('message');
    pm.expect(response).to.have.property('user');
    pm.expect(response).to.have.property('token');
    pm.expect(response.message).to.eql('User registered successfully');
});

pm.test("Registration - User Has Required Fields", function () {
    const response = pm.response.json();
    pm.expect(response.user).to.have.property('id');
    pm.expect(response.user).to.have.property('name');
    pm.expect(response.user).to.have.property('email');
    pm.expect(response.user).to.have.property('role');
    pm.expect(response.user).to.not.have.property('password');
});

// Save token automatically
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("new_user_token", response.token);
    console.log("New user token saved:", response.token);
}
`;

// ========================================
// PRE-REQUEST SCRIPTS
// ========================================

// Pre-request script for protected routes
const preRequestScript = `
// Ensure we have a token
const token = pm.environment.get("current_token");
if (!token) {
    console.error("No token found. Please run login first.");
    throw new Error("No authentication token available");
}

// Set the authorization header
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + token
});
`;

// ========================================
// COLLECTION RUNNER SETUP
// ========================================

const collectionRunnerSetup = `
// This script runs before the collection
console.log("Starting API Tests...");

// Set base URL
pm.environment.set("base_url", "http://localhost:3001");

// Clear any existing tokens
pm.environment.unset("current_token");
pm.environment.unset("admin_token");
pm.environment.unset("worker_token");
pm.environment.unset("sales_token");
`;

// Export all test scripts
module.exports = {
    adminLoginTests,
    workerLoginTests,
    salesLoginTests,
    profileTests,
    adminUsersTests,
    workerInventoryTests,
    salesOrdersTests,
    unauthorizedTests,
    registrationTests,
    preRequestScript,
    collectionRunnerSetup
}; 