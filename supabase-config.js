// Supabase Configuration and Database Operations
class SupabaseCustomerManager {
    constructor() {
        // Use environment variables in production, fallback to hardcoded values for development
        this.SUPABASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'https://fhgbnoqikcwaewzhiaoc.supabase.co' 
            : 'https://fhgbnoqikcwaewzhiaoc.supabase.co'; // You can set this via Vercel env vars
        this.SUPABASE_ANON_KEY = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZ2Jub3Fpa2N3YWV3emhpYW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0OTIzMDksImV4cCI6MjA3NzA2ODMwOX0.4xDyvlhePD4Ghlxrj7Q9NTKblLeouF9W4wf4allQ3yY'
            : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZ2Jub3Fpa2N3YWV3emhpYW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0OTIzMDksImV4cCI6MjA3NzA2ODMwOX0.4xDyvlhePD4Ghlxrj7Q9NTKblLeouF9W4wf4allQ3yY';
        
        // Initialize Supabase client (will be null until configured)
        this.supabase = null;
        this.isConnected = false;
        
        // Fallback to local storage if Supabase is not configured
        this.useLocalStorage = true;
        
        this.initializeSupabase();
    }

    initializeSupabase() {
        try {
            // Check if Supabase library is loaded
            if (typeof window.supabase === 'undefined') {
                console.error('❌ Supabase library not loaded');
                this.useLocalStorage = true;
                return;
            }

            // Check if Supabase credentials are provided
            if (this.SUPABASE_URL !== 'YOUR_SUPABASE_URL' && this.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
                console.log('🔄 Initializing Supabase client...');
                this.supabase = window.supabase.createClient(this.SUPABASE_URL, this.SUPABASE_ANON_KEY);
                this.useLocalStorage = false;
                this.isConnected = true;
                console.log('✅ Supabase client created successfully');
                
                // Test connection (async)
                this.testConnection();
            } else {
                console.log('⚠️ Supabase not configured, using localStorage');
                this.useLocalStorage = true;
            }
        } catch (error) {
            console.error('❌ Supabase initialization failed:', error);
            this.useLocalStorage = true;
            this.isConnected = false;
        }
    }

    async testConnection() {
        try {
            const { data, error } = await this.supabase.from('customers').select('count').limit(1);
            if (error) {
                console.warn('⚠️ Supabase tables may not exist yet. Error:', error.message);
                console.log('📋 Please run the SQL setup script in your Supabase dashboard.');
                // Fall back to localStorage if tables don't exist
                this.useLocalStorage = true;
                this.isConnected = false;
                return;
            }
            console.log('✅ Supabase database connection verified');
        } catch (error) {
            console.warn('⚠️ Supabase connection test failed:', error.message);
            console.log('🔄 Falling back to localStorage');
            this.useLocalStorage = true;
            this.isConnected = false;
        }
    }

    // CUSTOMERS OPERATIONS
    async getAllCustomers() {
        if (this.useLocalStorage) {
            const customers = localStorage.getItem('customers');
            return customers ? JSON.parse(customers) : [];
        }

        try {
            const { data, error } = await this.supabase
                .from('customers')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
    }

    async addCustomer(customerData) {
        console.log('🔄 Adding customer:', customerData);
        console.log('📊 Using localStorage:', this.useLocalStorage);
        
        if (this.useLocalStorage) {
            const customers = await this.getAllCustomers();
            const newCustomer = {
                ...customerData,
                created_at: new Date().toISOString()
            };
            customers.push(newCustomer);
            localStorage.setItem('customers', JSON.stringify(customers));
            console.log('✅ Customer added to localStorage:', newCustomer);
            return newCustomer;
        }

        try {
            console.log('🔄 Inserting customer to Supabase...');
            const { data, error } = await this.supabase
                .from('customers')
                .insert([customerData])
                .select()
                .single();
            
            if (error) {
                console.error('❌ Supabase insert error:', error);
                throw error;
            }
            console.log('✅ Customer added to Supabase:', data);
            return data;
        } catch (error) {
            console.error('❌ Error adding customer:', error);
            console.log('🔄 Falling back to localStorage...');
            
            // Fall back to localStorage if Supabase fails
            this.useLocalStorage = true;
            const customers = await this.getAllCustomers();
            const newCustomer = {
                ...customerData,
                created_at: new Date().toISOString()
            };
            customers.push(newCustomer);
            localStorage.setItem('customers', JSON.stringify(customers));
            console.log('✅ Customer added to localStorage (fallback):', newCustomer);
            return newCustomer;
        }
    }

    async updateCustomer(customerId, updates) {
        if (this.useLocalStorage) {
            const customers = await this.getAllCustomers();
            const index = customers.findIndex(c => c.id === customerId);
            if (index !== -1) {
                customers[index] = { ...customers[index], ...updates };
                localStorage.setItem('customers', JSON.stringify(customers));
                return customers[index];
            }
            return null;
        }

        try {
            const { data, error } = await this.supabase
                .from('customers')
                .update(updates)
                .eq('id', customerId)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    }

    async deleteCustomer(customerId) {
        if (this.useLocalStorage) {
            const customers = await this.getAllCustomers();
            const filteredCustomers = customers.filter(c => c.id !== customerId);
            localStorage.setItem('customers', JSON.stringify(filteredCustomers));
            
            // Also delete related orders
            await this.deleteCustomerOrders(customerId);
            return true;
        }

        try {
            // Delete customer orders first
            await this.deleteCustomerOrders(customerId);
            
            const { error } = await this.supabase
                .from('customers')
                .delete()
                .eq('id', customerId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting customer:', error);
            throw error;
        }
    }

    // ORDERS OPERATIONS
    async getAllOrders() {
        if (this.useLocalStorage) {
            const orders = localStorage.getItem('orders');
            return orders ? JSON.parse(orders) : [];
        }

        try {
            const { data, error } = await this.supabase
                .from('orders')
                .select('*')
                .order('date', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    }

    async getCustomerOrders(customerId) {
        if (this.useLocalStorage) {
            const orders = await this.getAllOrders();
            return orders.filter(order => order.customer_id === customerId);
        }

        try {
            const { data, error } = await this.supabase
                .from('orders')
                .select('*')
                .eq('customer_id', customerId)
                .order('date', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching customer orders:', error);
            return [];
        }
    }

    async addOrder(orderData) {
        if (this.useLocalStorage) {
            const orders = await this.getAllOrders();
            const newOrder = {
                ...orderData,
                created_at: new Date().toISOString()
            };
            orders.push(newOrder);
            localStorage.setItem('orders', JSON.stringify(orders));
            return newOrder;
        }

        try {
            const { data, error } = await this.supabase
                .from('orders')
                .insert([orderData])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding order:', error);
            throw error;
        }
    }

    async deleteOrder(orderId) {
        if (this.useLocalStorage) {
            const orders = await this.getAllOrders();
            const filteredOrders = orders.filter((order, index) => index !== orderId);
            localStorage.setItem('orders', JSON.stringify(filteredOrders));
            return true;
        }

        try {
            const { error } = await this.supabase
                .from('orders')
                .delete()
                .eq('id', orderId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    }

    async deleteCustomerOrders(customerId) {
        if (this.useLocalStorage) {
            const orders = await this.getAllOrders();
            const filteredOrders = orders.filter(order => order.customer_id !== customerId);
            localStorage.setItem('orders', JSON.stringify(filteredOrders));
            return true;
        }

        try {
            const { error } = await this.supabase
                .from('orders')
                .delete()
                .eq('customer_id', customerId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting customer orders:', error);
            throw error;
        }
    }

    // UTILITY METHODS
    async initializeSampleData() {
        const existingCustomers = await this.getAllCustomers();
        if (existingCustomers.length > 0) {
            console.log('Sample data already exists, skipping initialization');
            return;
        }

        console.log('Initializing sample data...');
        
        const sampleCustomers = [
            { id: 'KH001', full_name: 'Nguyễn Văn An', phone_number: '0901234567' },
            { id: 'KH002', full_name: 'Trần Thị Bình', phone_number: '0912345678' },
            { id: 'KH003', full_name: 'Lê Văn Cường', phone_number: '0923456789' }
        ];

        const sampleOrders = [
            { customer_id: 'KH001', date: '2024-10-25', product: 'Gạo ST25', quantity: 2, unit_price: 2500, total: 5000 },
            { customer_id: 'KH001', date: '2024-10-26', product: 'Dầu ăn', quantity: 1, unit_price: 4500, total: 4500 },
            { customer_id: 'KH001', date: '2024-10-28', product: 'Đường trắng', quantity: 3, unit_price: 1800, total: 5400 },
            { customer_id: 'KH002', date: '2024-10-24', product: 'Mì tôm', quantity: 5, unit_price: 450, total: 2250 },
            { customer_id: 'KH002', date: '2024-10-27', product: 'Nước mắm', quantity: 1, unit_price: 3500, total: 3500 },
            { customer_id: 'KH003', date: '2024-10-23', product: 'Café G7', quantity: 2, unit_price: 2800, total: 5600 }
        ];

        try {
            // Add sample customers
            for (const customer of sampleCustomers) {
                await this.addCustomer(customer);
            }

            // Add sample orders
            for (const order of sampleOrders) {
                await this.addOrder(order);
            }

            console.log('✅ Sample data initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing sample data:', error);
        }
    }

    // Database Schema Setup (for reference)
    getSchemaSQL() {
        return `
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
        `;
    }
}

// Export for use in main application
window.SupabaseCustomerManager = SupabaseCustomerManager;