// Village API Route for Supabase
// مسار API القرية لـ Supabase

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Tables configuration
const TABLES = {
  craftsmen: 'craftsmen',
  machines: 'machines',
  shops: 'shops',
  offers: 'offers',
  ads: 'ads',
  news: 'news',
  emergency: 'emergency'
};

// Required fields validation
const REQUIRED_FIELDS = {
  craftsmen: ['name', 'specialty', 'phone'],
  machines: ['name', 'type', 'phone'],
  shops: ['name', 'type', 'phone', 'hours'],
  offers: ['shopName', 'description', 'discount', 'phone'],
  ads: ['title', 'description', 'type', 'phone'],
  news: ['title', 'content'],
  emergency: ['name', 'phone']
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action, type, data, id, filter, search } = req.method === 'GET' ? req.query : req.body;

    // Validate action and type
    if (!action || !type) {
      return res.status(400).json({
        success: false,
        error: 'Action and type are required'
      });
    }

    // Validate table exists
    if (!TABLES[type]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data type'
      });
    }

    const tableName = TABLES[type];

    switch (action) {
      case 'get':
        return await handleGet(res, tableName, { filter, search });

      case 'save':
        return await handleSave(res, tableName, data, type);

      case 'update':
        return await handleUpdate(res, tableName, id, data, type);

      case 'delete':
        return await handleDelete(res, tableName, id);

      case 'approve':
        return await handleApprove(res, tableName, id, data?.approve);

      case 'login':
        return await handleLogin(res, req.body);

      case 'register':
        return await handleRegister(res, req.body);

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
    }

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function handleGet(res, tableName, { filter, search }) {
  try {
    let query = supabase.from(tableName).select('*');

    // Apply filters
    if (filter) {
      const filterObj = JSON.parse(filter);
      Object.entries(filterObj).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    // Apply search
    if (search) {
      // Simple search across common text fields
      const searchTerm = `%${search}%`;
      query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm},title.ilike.${searchTerm}`);
    }

    const { data, error } = await query.order('createdAt', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data || [],
      message: 'Data retrieved successfully'
    });

  } catch (error) {
    console.error('Get error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error fetching data'
    });
  }
}

async function handleSave(res, tableName, data, type) {
  try {
    // Validate required fields
    const required = REQUIRED_FIELDS[type];
    if (required) {
      const missing = required.filter(field => !data[field]);
      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missing.join(', ')}`
        });
      }
    }

    // Add metadata
    const now = new Date().toISOString();
    const saveData = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };

    const { data: result, error } = await supabase
      .from(tableName)
      .insert([saveData])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      data: result,
      message: 'Data saved successfully'
    });

  } catch (error) {
    console.error('Save error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error saving data'
    });
  }
}

async function handleUpdate(res, tableName, id, data, type) {
  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID is required for update'
      });
    }

    // Update metadata
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };

    const { data: result, error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Data updated successfully'
    });

  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error updating data'
    });
  }
}

async function handleDelete(res, tableName, id) {
  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID is required for delete'
      });
    }

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: { id },
      message: 'Data deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error deleting data'
    });
  }
}

async function handleApprove(res, tableName, id, approve) {
  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID is required for approval'
      });
    }

    const { data: result, error } = await supabase
      .from(tableName)
      .update({
        approved: approve,
        rejected: !approve,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
      message: approve ? 'Item approved successfully' : 'Item rejected successfully'
    });

  } catch (error) {
    console.error('Approve error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error updating approval status'
    });
  }
}

async function handleLogin(res, body) {
  try {
    const { username, password, type } = body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    if (type === 'admin') {
      // Simple admin authentication
      if (username === 'admin' && password === 'admin123') {
        return res.status(200).json({
          success: true,
          data: {
            username,
            role: 'admin',
            token: Buffer.from(`${username}:admin`).toString('base64')
          },
          message: 'Login successful'
        });
      } else {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
    } else if (type === 'shop-owner') {
      // Shop owner login from database
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('phone', username)
        .eq('password', password)
        .single();

      if (error || !data) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...data,
          role: 'shop-owner',
          token: Buffer.from(`${username}:shop-owner`).toString('base64')
        },
        message: 'Login successful'
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid login type'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error during login'
    });
  }
}

async function handleRegister(res, body) {
  try {
    const { type, data } = body;

    if (type === 'shop-owner') {
      // Check if phone already exists
      const { data: existing, error: checkError } = await supabase
        .from('shops')
        .select('id')
        .eq('phone', data.phone)
        .single();

      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Phone number already registered'
        });
      }

      // Create new shop
      const now = new Date().toISOString();
      const shopData = {
        ...data,
        id: crypto.randomUUID(),
        registeredAt: now,
        updatedAt: now,
        status: 'نشط'
      };

      const { data: result, error } = await supabase
        .from('shops')
        .insert([shopData])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        data: result,
        message: 'Registration successful'
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid registration type'
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error during registration'
    });
  }
}