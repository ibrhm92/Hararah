// Google Apps Script for Village App Backend API
// This script acts as a RESTful API for the village app

// Global variables
const SPREADSHEET_ID = '1jEzL7epcUhsrCau8l90cINX5UcQqUEx_3vTgunUL3lo';
const SHEET_NAMES = {
  craftsmen: 'Craftsmen',
  machines: 'Machines',
  shops: 'Shops',
  offers: 'Offers',
  ads: 'Ads',
  news: 'News',
  emergency: 'Emergency'
};

// Configuration
const CONFIG = {
  // Admin credentials (in production, use proper authentication)
  ADMIN_USERNAME: 'admin',
  ADMIN_PASSWORD: '123',
  
  // CORS settings
  ALLOWED_ORIGINS: ['https://hararah.vercel.app', 'http://localhost:3000', 'https://your-domain.vercel.app'],
  
  // Rate limiting
  RATE_LIMIT: 100, // requests per minute
  RATE_LIMIT_WINDOW: 60 * 1000 // 1 minute
};

// Main function to handle HTTP requests
function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  try {
    // Set CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    };

    // Handle OPTIONS request for CORS
    if (method === 'OPTIONS') {
      return ContentService.createTextOutput('')
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }

    // Parse request parameters
    let params = e.parameter || {};
    let data = {};

    if (method === 'POST' && e.postData && e.postData.contents) {
      // For POST requests, parse JSON body and merge with URL parameters
      try {
        const postData = JSON.parse(e.postData.contents);
        params = { ...params, ...postData };
        data = postData.data || {};
      } catch (parseError) {
        console.error('Error parsing POST data:', parseError);
        return createErrorResponse('Invalid JSON in request body', 400, headers);
      }
    } else if (method === 'GET') {
      // For GET requests, parse data from URL parameters (JSON strings)
      if (params.action === 'get') {
        data = {};
      }
    }

    const action = params.action;
    const type = params.type;

    console.log('Action:', action, 'Type:', type, 'Data keys:', Object.keys(data));

    // Rate limiting check (disabled for debugging)
    // if (!checkRateLimit(e)) {
    //   return createErrorResponse('Rate limit exceeded', 429, headers);
    // }

    // Route to appropriate handler
    let result;
    switch (action) {
      case 'get':
        result = handleGet(type, params);
        break;
      case 'save':
        result = handleSave(type, { action: action, type: type, data: data });
        break;
      case 'update':
        result = handleUpdate(type, { action: action, type: type, data: data, id: params.id });
        break;
      case 'delete':
        result = handleDelete(type, { action: action, type: type, id: params.id });
        break;
      case 'approve':
        result = handleApprove(type, { action: action, type: type, id: params.id, approve: params.approve === 'true' || params.approve === true });
        break;
      case 'login':
        result = handleLogin(params);
        break;
      case 'register':
        result = handleRegister({ action: action, type: type, data: data });
        break;
      default:
        result = createErrorResponse('Invalid action: ' + action, 400, headers);
    }

    return result;

  } catch (error) {
    console.error('Error in handleRequest:', error);
    return createErrorResponse('Internal server error', 500, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    });
  }
}

// Handle GET requests
function handleGet(type, params) {
  try {
    const sheet = getSheet(type);
    const data = sheet.getDataRange().getValues();
    
    // Convert to array of objects
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    // Apply filters if provided
    let filteredData = rows;
    if (params.filter) {
      filteredData = rows.filter(item => {
        return Object.keys(params.filter).every(key => {
          return item[key] === params.filter[key];
        });
      });
    }

    // Apply search if provided
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredData = filteredData.filter(item => {
        return Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm)
        );
      });
    }

    return createSuccessResponse(filteredData);

  } catch (error) {
    console.error('Error in handleGet:', error);
    return createErrorResponse('Error fetching data', 500);
  }
}

// Handle SAVE requests
function handleSave(type, params) {
  try {
    const sheet = getSheet(type);
    const data = params.data;

    console.log('Saving data:', data);

    // Validate required fields
    if (!validateRequiredFields(type, data)) {
      return createErrorResponse('Missing required fields for type: ' + type, 400);
    }

    // Add metadata
    data.id = generateId();
    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();

    // Convert to row format
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(header => {
      const value = data[header];
      return value !== undefined ? value : '';
    });

    console.log('Row to save:', row);

    // Add to sheet
    sheet.appendRow(row);

    return createSuccessResponse(data, 'Data saved successfully');

  } catch (error) {
    console.error('Error in handleSave:', error);
    return createErrorResponse('Error saving data: ' + error.toString(), 500);
  }
}

// Handle UPDATE requests
function handleUpdate(type, params) {
  try {
    const sheet = getSheet(type);
    const data = params.data;
    const id = params.id;

    console.log('Updating:', type, id, data);

    if (!id) {
      return createErrorResponse('ID is required for update', 400);
    }

    // Find the row to update
    const allData = sheet.getDataRange().getValues();
    const headers = allData[0];
    const idIndex = headers.indexOf('ID');

    let rowIndex = -1;
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][idIndex] === id) {
        rowIndex = i + 1; // +1 because sheets are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      return createErrorResponse('Record not found', 404);
    }

    // Update metadata
    data.updatedAt = new Date().toISOString();

    // Update the row
    headers.forEach((header, index) => {
      const value = data[header];
      sheet.getRange(rowIndex, index + 1).setValue(value !== undefined ? value : '');
    });

    return createSuccessResponse(data, 'Data updated successfully');

  } catch (error) {
    console.error('Error in handleUpdate:', error);
    return createErrorResponse('Error updating data: ' + error.toString(), 500);
  }
}

// Handle DELETE requests
function handleDelete(type, params) {
  try {
    const sheet = getSheet(type);
    const id = params.id;

    if (!id) {
      return createErrorResponse('ID is required for delete', 400);
    }

    // Find the row to delete
    const allData = sheet.getDataRange().getValues();
    const headers = allData[0];
    const idIndex = headers.indexOf('ID');
    
    let rowIndex = -1;
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][idIndex] === id) {
        rowIndex = i + 1; // +1 because sheets are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      return createErrorResponse('Record not found', 404);
    }

    // Delete the row
    sheet.deleteRow(rowIndex);

    return createSuccessResponse({ id: id }, 'Data deleted successfully');

  } catch (error) {
    console.error('Error in handleDelete:', error);
    return createErrorResponse('Error deleting data', 500);
  }
}

// Handle APPROVE requests
function handleApprove(type, params) {
  try {
    const sheet = getSheet(type);
    const id = params.id;
    const approve = params.approve; // true or false

    if (!id) {
      return createErrorResponse('ID is required for approval', 400);
    }

    // Find the row to update
    const allData = sheet.getDataRange().getValues();
    const headers = allData[0];
    const idIndex = headers.indexOf('ID');
    const approvedIndex = headers.indexOf('approved');
    const rejectedIndex = headers.indexOf('rejected');
    
    let rowIndex = -1;
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][idIndex] === id) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      return createErrorResponse('Record not found', 404);
    }

    // Update approval status
    sheet.getRange(rowIndex, approvedIndex + 1).setValue(approve);
    sheet.getRange(rowIndex, rejectedIndex + 1).setValue(!approve);
    sheet.getRange(rowIndex, headers.indexOf('updatedAt') + 1).setValue(new Date().toISOString());

    const message = approve ? 'Item approved successfully' : 'Item rejected successfully';
    return createSuccessResponse({ id: id, approved: approve }, message);

  } catch (error) {
    console.error('Error in handleApprove:', error);
    return createErrorResponse('Error updating approval status', 500);
  }
}

// Handle LOGIN requests
function handleLogin(params) {
  try {
    const { username, password, type } = params;

    if (!username || !password) {
      return createErrorResponse('Username and password are required', 400);
    }

    if (type === 'admin') {
      // Admin login
      if (username === CONFIG.ADMIN_USERNAME && password === CONFIG.ADMIN_PASSWORD) {
        return createSuccessResponse({
          username: username,
          role: 'admin',
          token: generateToken(username, 'admin')
        }, 'Login successful');
      } else {
        return createErrorResponse('Invalid credentials', 401);
      }
    } else if (type === 'shop-owner') {
      // Shop owner login
      const sheet = getSheet('shops');
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const phoneIndex = headers.indexOf('phone');
      const passwordIndex = headers.indexOf('password');

      for (let i = 1; i < data.length; i++) {
        if (data[i][phoneIndex] === username && data[i][passwordIndex] === password) {
          const shopData = {};
          headers.forEach((header, index) => {
            shopData[header] = data[i][index];
          });
          
          return createSuccessResponse({
            ...shopData,
            role: 'shop-owner',
            token: generateToken(username, 'shop-owner')
          }, 'Login successful');
        }
      }

      return createErrorResponse('Invalid credentials', 401);
    }

    return createErrorResponse('Invalid login type', 400);

  } catch (error) {
    console.error('Error in handleLogin:', error);
    return createErrorResponse('Error during login', 500);
  }
}

// Handle REGISTER requests
function handleRegister(params) {
  try {
    const { type, data } = params;

    console.log('Registering:', type, data);

    if (type === 'shop-owner') {
      // Check if phone already exists
      const sheet = getSheet('shops');
      const existingData = sheet.getDataRange().getValues();
      const headers = existingData[0];
      const phoneIndex = headers.indexOf('phone');

      for (let i = 1; i < existingData.length; i++) {
        if (existingData[i][phoneIndex] === data.phone) {
          return createErrorResponse('Phone number already registered', 400);
        }
      }

      // Add new shop
      data.id = generateId();
      data.registeredAt = new Date().toISOString();
      data.updatedAt = new Date().toISOString();
      data.status = 'نشط';

      const row = headers.map(header => {
        const value = data[header];
        return value !== undefined ? value : '';
      });

      console.log('Registration row:', row);
      sheet.appendRow(row);

      return createSuccessResponse(data, 'Registration successful');
    }

    return createErrorResponse('Invalid registration type', 400);

  } catch (error) {
    console.error('Error in handleRegister:', error);
    return createErrorResponse('Error during registration: ' + error.toString(), 500);
  }
}

// Utility functions

function getSheet(type) {
  const sheetName = SHEET_NAMES[type];
  if (!sheetName) {
    throw new Error(`Invalid sheet type: ${type}`);
  }
  
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error(`Sheet not found: ${sheetName}`);
  }
  
  return sheet;
}

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function generateToken(username, role) {
  const payload = {
    username: username,
    role: role,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  
  return Utilities.base64Encode(JSON.stringify(payload));
}

function validateRequiredFields(type, data) {
  const requiredFields = {
    craftsmen: ['name', 'specialty', 'phone'],
    machines: ['name', 'type', 'phone'],
    shops: ['name', 'type', 'phone', 'hours'],
    offers: ['shopName', 'description', 'discount', 'phone'],
    ads: ['title', 'description', 'type', 'phone'],
    news: ['title', 'content'],
    emergency: ['name', 'phone']
  };

  const fields = requiredFields[type];
  if (!fields) {
    return true; // No validation required
  }

  return fields.every(field => data[field]);
}

function checkRateLimit(e) {
  // Simple rate limiting implementation
  // In production, use a more sophisticated rate limiting solution
  const cache = CacheService.getScriptCache();
  const key = 'rate_limit_' + e.parameters.ip || 'unknown';
  const count = cache.get(key);
  
  if (count && parseInt(count) > CONFIG.RATE_LIMIT) {
    return false;
  }
  
  cache.put(key, (parseInt(count || 0) + 1).toString(), CONFIG.RATE_LIMIT_WINDOW);
  return true;
}

function createSuccessResponse(data, message = 'Success') {
  const response = {
    success: true,
    message: message,
    data: data
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    });
}

function createErrorResponse(message, code = 400, headers = null) {
  const response = {
    success: false,
    error: message,
    code: code
  };
  
  const defaultHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers || defaultHeaders);
}

// Deployment function
function deployAsWebApp() {
  const scriptId = ScriptApp.getScriptId();
  const url = ScriptApp.getService().getUrl();
  
  Logger.log('Deploy your script as a web app:');
  Logger.log('1. Go to Publish > Deploy as web app');
  Logger.log('2. Choose "Execute as: Me"');
  Logger.log('3. Choose "Who has access: Anyone"');
  Logger.log('4. Click Deploy');
  Logger.log('5. Copy the Web app URL');
  Logger.log('Your Web app URL will be: ' + url);
}

// Test functions
function testGetCraftsmen() {
  const result = handleGet('craftsmen', {});
  Logger.log(result.getContent());
}

function testSaveCraftsman() {
  const testData = {
    name: 'Test Craftsman',
    specialty: 'كهربائي',
    phone: '01234567890',
    notes: 'Test notes'
  };
  
  const result = handleSave('craftsmen', { data: testData });
  Logger.log(result.getContent());
}

// Handle CORS preflight OPTIONS requests
function handleCorsPreflight() {
   const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400'
   };

   return ContentService.createTextOutput('{}')
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
}

// Initialize function to set up the spreadsheet
function initializeSpreadsheet() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Create sheets if they don't exist
    Object.values(SHEET_NAMES).forEach(sheetName => {
      if (!ss.getSheetByName(sheetName)) {
        ss.insertSheet(sheetName);
      }
    });
    
    // Set up headers for each sheet
    setupSheetHeaders(ss.getSheetByName(SHEET_NAMES.craftsmen), [
      'ID', 'name', 'specialty', 'phone', 'notes', 'createdAt', 'updatedAt', 'status'
    ]);
    
    setupSheetHeaders(ss.getSheetByName(SHEET_NAMES.machines), [
      'ID', 'name', 'type', 'phone', 'available', 'notes', 'createdAt', 'updatedAt'
    ]);
    
    setupSheetHeaders(ss.getSheetByName(SHEET_NAMES.shops), [
      'ID', 'name', 'type', 'phone', 'hours', 'address', 'password', 'registeredAt', 'updatedAt', 'status'
    ]);
    
    setupSheetHeaders(ss.getSheetByName(SHEET_NAMES.offers), [
      'ID', 'shopName', 'shopPhone', 'description', 'discount', 'duration', 'phone', 'approved', 'rejected', 'createdAt', 'updatedAt'
    ]);
    
    setupSheetHeaders(ss.getSheetByName(SHEET_NAMES.ads), [
      'ID', 'title', 'description', 'type', 'phone', 'approved', 'rejected', 'createdAt', 'updatedAt'
    ]);
    
    setupSheetHeaders(ss.getSheetByName(SHEET_NAMES.news), [
      'ID', 'title', 'content', 'urgent', 'createdAt', 'updatedAt', 'author'
    ]);
    
    setupSheetHeaders(ss.getSheetByName(SHEET_NAMES.emergency), [
      'ID', 'name', 'phone', 'address', 'notes', 'icon', 'createdAt', 'updatedAt'
    ]);
    
    Logger.log('Spreadsheet initialized successfully');
    
  } catch (error) {
    Logger.log('Error initializing spreadsheet: ' + error.toString());
  }
}

function setupSheetHeaders(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.autoResizeColumn(1, headers.length);
  }
}
