# Supabase Setup Guide

## 🚀 Quick Start

The app works out of the box with localStorage, but for a production backend with Supabase, follow these steps:

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Click "New Project"
4. Fill in project details and create

## 2. Set Up Database Tables

In your Supabase dashboard, go to **SQL Editor** and run this script:

```sql
-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(10) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table  
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id VARCHAR(10) REFERENCES customers(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    product VARCHAR(200) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
    total INTEGER NOT NULL CHECK (total >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_number);

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed)
CREATE POLICY "Enable all operations for customers" ON customers FOR ALL USING (true);
CREATE POLICY "Enable all operations for orders" ON orders FOR ALL USING (true);
```

## 3. Configure Your App

1. In your Supabase dashboard, go to **Settings > API**
2. Copy your `Project URL` and `anon/public` key
3. Open `supabase-config.js` in your project
4. Replace the placeholder values:

```javascript
// Replace these with your actual Supabase credentials
this.SUPABASE_URL = 'https://your-project-id.supabase.co';
this.SUPABASE_ANON_KEY = 'your-anon-key-here';
```

## 4. Test Your Connection

1. Open your app in the browser
2. Check the browser console for connection messages:
   - ✅ "Supabase connected successfully" - Everything works!
   - ⚠️ "Supabase not configured, using localStorage" - Need to update credentials
   - ❌ "Supabase connection failed" - Check your credentials and network

## 📋 Features with Supabase

- **Real-time data sync** across multiple browser tabs
- **Persistent storage** - data survives browser refreshes and closures
- **Scalable backend** - handles multiple users simultaneously
- **Automatic backups** - Supabase handles data backup and recovery
- **Performance** - Optimized queries with database indexes

## 🔒 Security Notes

The current setup uses public access for simplicity. For production:

1. **Enable RLS (Row Level Security)** - Already included in the setup script
2. **Create proper policies** based on your authentication needs
3. **Add user authentication** if you need user-specific data
4. **Use environment variables** for API keys in production

## 🔄 Fallback Behavior

If Supabase is not configured or connection fails:
- App automatically falls back to localStorage
- All features continue to work locally
- No data loss occurs during setup

## 📱 Mobile Optimization

The app now includes enhanced mobile responsiveness:
- **Touch-friendly interface** on all screen sizes
- **Optimized tables** with horizontal scrolling
- **Mobile-first design** for phones and tablets
- **Responsive navigation** that adapts to screen size

## 🛠️ Troubleshooting

**Connection Issues:**
1. Verify your Supabase URL and API key
2. Check browser console for error messages
3. Ensure your Supabase project is active

**Database Issues:**
1. Run the SQL setup script again
2. Check table permissions in Supabase dashboard
3. Verify RLS policies are correct

**Performance Issues:**
1. Check network connection
2. Monitor Supabase dashboard for usage limits
3. Consider upgrading Supabase plan if needed