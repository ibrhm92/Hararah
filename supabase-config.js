// Supabase Configuration for Village App
// إعدادات Supabase لتطبيق القرية

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const SUPABASE_CONFIG = {
  // IMPORTANT: Replace these with your actual Supabase project details
  // مهم: استبدل هذه بالمعلومات الفعلية لمشروع Supabase الخاص بك
  URL: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  ANON_KEY: process.env.SUPABASE_ANON_KEY || 'your-anon-key',

  // Tables configuration - إعدادات الجداول
  TABLES: {
    CRAFTSMEN: 'craftsmen',
    MACHINES: 'machines',
    SHOPS: 'shops',
    OFFERS: 'offers',
    ADS: 'ads',
    NEWS: 'news',
    EMERGENCY: 'emergency'
  }
};

// Create Supabase client - إنشاء عميل Supabase
export const supabase = createClient(
  SUPABASE_CONFIG.URL,
  SUPABASE_CONFIG.ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Export configuration - تصدير الإعدادات
export { SUPABASE_CONFIG };