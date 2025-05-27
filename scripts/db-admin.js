#!/usr/bin/env node

/**
 * Database Admin CLI Tool
 * 
 * Usage:
 *   node scripts/db-admin.js stats
 *   node scripts/db-admin.js users
 *   node scripts/db-admin.js delete-user <userId>
 * 
 * Make sure to set ADMIN_SECRET and KV environment variables
 */

const https = require('https');
const http = require('http');

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin-secret-change-this';
const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}/api/admin/database${path}`);
    const requestModule = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${ADMIN_SECRET}`,
        'Content-Type': 'application/json'
      }
    };

    const req = requestModule.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function getStats() {
  try {
    const response = await makeRequest('?action=stats');
    
    if (response.status === 200) {
      console.log('📊 Database Statistics:');
      console.log(`   Total Users: ${response.data.totalUsers}`);
      console.log(`   Total Preferences: ${response.data.totalPreferences}`);
    } else {
      console.error('❌ Error:', response.data.error || 'Failed to fetch stats');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function getUsers() {
  try {
    const response = await makeRequest('?action=users');
    
    if (response.status === 200) {
      const users = response.data.users;
      console.log(`👥 Users (${users.length}):`);
      
      if (users.length === 0) {
        console.log('   No users found');
        return;
      }
      
      console.log('');
      users.forEach((user) => {
        console.log(`   ID: ${user.id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
        console.log('   ---');
      });
    } else {
      console.error('❌ Error:', response.data.error || 'Failed to fetch users');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function deleteUser(userId) {
  if (!userId) {
    console.error('❌ Error: User ID is required');
    return;
  }
  
  try {
    const response = await makeRequest(`?userId=${userId}`, 'DELETE');
    
    if (response.status === 200) {
      console.log(`✅ User ${userId} deleted successfully`);
    } else {
      console.error('❌ Error:', response.data.error || 'Failed to delete user');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function showHelp() {
  console.log('🛠️  Database Admin CLI Tool');
  console.log('');
  console.log('Commands:');
  console.log('  stats                    Show database statistics');
  console.log('  users                    List all users');
  console.log('  delete-user <userId>     Delete a specific user');
  console.log('  help                     Show this help message');
  console.log('');
  console.log('Environment Variables:');
  console.log('  ADMIN_SECRET            Admin secret for authentication');
  console.log('  VERCEL_URL              Base URL for the API (optional)');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/db-admin.js stats');
  console.log('  node scripts/db-admin.js users');
  console.log('  node scripts/db-admin.js delete-user abc123');
}

// Main execution
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'stats':
    getStats();
    break;
  case 'users':
    getUsers();
    break;
  case 'delete-user':
    deleteUser(arg);
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    console.error('❌ Unknown command:', command || '(none)');
    console.log('');
    showHelp();
    process.exit(1);
} 