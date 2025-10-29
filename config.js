// Application Configuration and Data Management
class CustomerManagementApp {
    constructor() {
        this.customers = [];
        this.orders = [];
        this.selectedCustomerId = null;
        this.customerIdCounter = 1;
        this.isLoading = false;
        
        // Initialize Supabase manager
        this.db = new SupabaseCustomerManager();
    }

    async initializeWithData() {
        try {
            console.log('🔄 Starting app initialization...');
            this.setLoading(true);
            
            // Initialize sample data if needed
            console.log('🔄 Initializing sample data...');
            await this.db.initializeSampleData();
            
            // Load data from database
            console.log('🔄 Loading customers...');
            await this.loadCustomers();
            console.log('✅ Loaded', this.customers.length, 'customers');
            
            console.log('🔄 Loading orders...');
            await this.loadOrders();
            console.log('✅ Loaded', this.orders.length, 'orders');
            
            // Update UI
            console.log('🔄 Rendering UI...');
            await renderCustomerList();
            await renderOrderHistory();
            updateStats();
            
            console.log('✅ App initialization completed');
            
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            showNotification('Lỗi tải dữ liệu. Vui lòng thử lại.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async loadCustomers() {
        try {
            const customers = await this.db.getAllCustomers();
            this.customers = customers.map(c => ({
                id: c.id,
                fullName: c.full_name,
                phoneNumber: c.phone_number
            }));
            
            // Update counter based on existing customers
            const maxId = this.customers.reduce((max, customer) => {
                const num = parseInt(customer.id.replace('KH', ''));
                return num > max ? num : max;
            }, 0);
            this.customerIdCounter = maxId + 1;
            
        } catch (error) {
            console.error('Error loading customers:', error);
        }
    }

    async loadOrders() {
        try {
            const orders = await this.db.getAllOrders();
            this.orders = orders.map(o => ({
                customerId: o.customer_id,
                date: o.date,
                product: o.product,
                quantity: o.quantity,
                unitPrice: o.unit_price,
                total: o.total,
                id: o.id // Keep database ID for deletion
            }));
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    setLoading(isLoading) {
        this.isLoading = isLoading;
        // You can add a loading spinner here if needed
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.disabled = isLoading;
        });
    }

    // Generate new customer ID
    generateCustomerId() {
        const id = `KH${String(this.customerIdCounter).padStart(3, '0')}`;
        this.customerIdCounter++;
        return id;
    }

    // Add new customer
    async addCustomer(customerData) {
        try {
            // Check if customer ID already exists
            while (this.customers.find(c => c.id === customerData.customerId)) {
                customerData.customerId = this.generateCustomerId();
            }
            
            const dbCustomerData = {
                id: customerData.customerId || this.generateCustomerId(),
                full_name: customerData.fullName,
                phone_number: customerData.phoneNumber
            };
            
            // Add to database
            await this.db.addCustomer(dbCustomerData);
            
            // Add to local array
            const customer = {
                id: dbCustomerData.id,
                fullName: dbCustomerData.full_name,
                phoneNumber: dbCustomerData.phone_number
            };
            
            this.customers.push(customer);
            return customer;
        } catch (error) {
            console.error('Error adding customer:', error);
            throw error;
        }
    }

    // Search customers by name
    searchCustomers(searchTerm) {
        if (!searchTerm) return this.customers;
        
        return this.customers.filter(customer => 
            customer.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // Get customer orders
    async getCustomerOrders(customerId) {
        try {
            // Get fresh data from database
            const orders = await this.db.getCustomerOrders(customerId);
            return orders.map(o => ({
                customerId: o.customer_id,
                date: o.date,
                product: o.product,
                quantity: o.quantity,
                unitPrice: o.unit_price,
                total: o.total,
                id: o.id
            }));
        } catch (error) {
            console.error('Error getting customer orders:', error);
            // Fallback to local data
            return this.orders.filter(order => order.customerId === customerId);
        }
    }

    // Calculate total purchases for a customer
    async getCustomerTotalPurchases(customerId) {
        try {
            const customerOrders = await this.getCustomerOrders(customerId);
            return customerOrders.reduce((total, order) => total + order.total, 0);
        } catch (error) {
            console.error('Error calculating total purchases:', error);
            // Fallback to local data
            const localOrders = this.orders.filter(order => order.customerId === customerId);
            return localOrders.reduce((total, order) => total + order.total, 0);
        }
    }

    // Add new order
    async addOrder(orderData) {
        try {
            const dbOrderData = {
                customer_id: orderData.customerId,
                date: new Date().toISOString().split('T')[0],
                product: orderData.product,
                quantity: parseInt(orderData.quantity),
                unit_price: parseInt(orderData.unitPrice),
                total: parseInt(orderData.quantity) * parseInt(orderData.unitPrice)
            };
            
            // Add to database
            const savedOrder = await this.db.addOrder(dbOrderData);
            
            // Add to local array
            const order = {
                customerId: savedOrder.customer_id,
                date: savedOrder.date,
                product: savedOrder.product,
                quantity: savedOrder.quantity,
                unitPrice: savedOrder.unit_price,
                total: savedOrder.total,
                id: savedOrder.id
            };
            
            this.orders.push(order);
            return order;
        } catch (error) {
            console.error('Error adding order:', error);
            throw error;
        }
    }

    // Delete order
    async deleteOrder(orderId) {
        try {
            // Delete from database
            await this.db.deleteOrder(orderId);
            
            // Remove from local array
            const index = this.orders.findIndex(order => order.id === orderId);
            if (index !== -1) {
                this.orders.splice(index, 1);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    }

    // Format currency (KRW)
    formatCurrency(amount) {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW'
        }).format(amount);
    }

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }
}

// Initialize the app
let app;

async function initializeApp() {
    try {
        app = new CustomerManagementApp();
        
        // Set up event listeners
        setupEventListeners();
        
        // Wait for app initialization to complete
        await app.initializeWithData();
        
        // Generate initial customer ID
        generateNewCustomerId();
        
        // Render initial data (this will be called again in initializeWithData, but that's ok)
        await renderCustomerList();
        await renderOrderHistory();
        updateStats();
        
        console.log('✅ App initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        showNotification('Lỗi khởi tạo ứng dụng. Vui lòng tải lại trang.', 'error');
    }
}

function setupEventListeners() {
    // Customer form submission
    document.getElementById('customerForm').addEventListener('submit', handleAddCustomer);
    
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Order modal controls
    document.getElementById('addOrderBtn').addEventListener('click', showOrderModal);
    document.getElementById('orderForm').addEventListener('submit', handleAddOrder);
    document.getElementById('cancelOrder').addEventListener('click', hideOrderModal);
    document.querySelector('.close').addEventListener('click', hideOrderModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('orderModal');
        if (event.target === modal) {
            hideOrderModal();
        }
    });
}

function generateNewCustomerId() {
    let newId = app.generateCustomerId();
    // Ensure the ID is unique
    while (app.customers.find(c => c.id === newId)) {
        newId = app.generateCustomerId();
    }
    document.getElementById('customerId').value = newId;
}

async function handleAddCustomer(event) {
    event.preventDefault();
    console.log('🔄 Form submitted for adding customer');
    
    const formData = new FormData(event.target);
    const customerData = {
        customerId: formData.get('customerId'),
        fullName: formData.get('fullName').trim(),
        phoneNumber: formData.get('phoneNumber').trim()
    };
    
    console.log('📝 Customer data:', customerData);
    
    // Validate phone number
    if (!isValidPhoneNumber(customerData.phoneNumber)) {
        alert('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại 10-11 chữ số.');
        return;
    }
    
    // Check if customer already exists (by phone number or ID)
    const existingCustomer = app.customers.find(c => 
        c.phoneNumber === customerData.phoneNumber || c.id === customerData.customerId
    );
    if (existingCustomer) {
        alert('Khách hàng với số điện thoại hoặc mã khách hàng này đã tồn tại.');
        return;
    }
    
    try {
        console.log('🔄 Starting customer addition process...');
        app.setLoading(true);
        
        // Add customer
        console.log('📞 Calling app.addCustomer...');
        const newCustomer = await app.addCustomer(customerData);
        console.log('✅ Customer added successfully:', newCustomer);
        
        // Reset form and generate new ID
        event.target.reset();
        generateNewCustomerId();
        
        // Update UI
        await renderCustomerList();
        updateStats();
        
        // Show success message
        showNotification('Đã thêm khách hàng thành công!', 'success');
    } catch (error) {
        console.error('❌ Error in handleAddCustomer:', error);
        showNotification('Lỗi thêm khách hàng. Vui lòng thử lại.', 'error');
    } finally {
        app.setLoading(false);
    }
}

function isValidPhoneNumber(phone) {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone);
}

async function handleSearch(event) {
    const searchTerm = event.target.value;
    const filteredCustomers = app.searchCustomers(searchTerm);
    await renderCustomerList(filteredCustomers);
}

async function renderCustomerList(customers = null) {
    const customersToRender = customers || app.customers;
    const tableBody = document.getElementById('customerTableBody');
    
    console.log('🔄 Rendering customer list with', customersToRender.length, 'customers');
    
    if (customersToRender.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Không tìm thấy khách hàng nào</td></tr>';
        return;
    }
    
    // Calculate total purchases for all customers
    const customersWithTotals = await Promise.all(
        customersToRender.map(async (customer) => {
            const totalPurchases = await app.getCustomerTotalPurchases(customer.id);
            return { ...customer, totalPurchases };
        })
    );
    
    tableBody.innerHTML = customersWithTotals.map(customer => {
        const isSelected = customer.id === app.selectedCustomerId;
        
        return `
            <tr class="${isSelected ? 'selected' : ''}" onclick="selectCustomer('${customer.id}')">
                <td>${customer.id}</td>
                <td>${customer.fullName}</td>
                <td>${customer.phoneNumber}</td>
                <td class="font-bold text-success">${app.formatCurrency(customer.totalPurchases)}</td>
                <td>
                    <button class="btn-danger" onclick="deleteCustomer('${customer.id}', event)">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    console.log('✅ Customer list rendered successfully');
}

async function selectCustomer(customerId) {
    app.selectedCustomerId = customerId;
    const customer = app.customers.find(c => c.id === customerId);
    
    // Update UI
    document.getElementById('selectedCustomerInfo').style.display = 'block';
    document.getElementById('selectedCustomerName').textContent = `${customer.fullName} (${customer.id})`;
    document.getElementById('addOrderBtn').disabled = false;
    
    // Re-render customer list to show selection
    await renderCustomerList();
    
    // Render order history for selected customer
    await renderOrderHistory();
}

async function deleteCustomer(customerId, event) {
    event.stopPropagation();
    
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
        try {
            app.setLoading(true);
            
            // Delete from database
            await app.db.deleteCustomer(customerId);
            
            // Remove from local arrays
            const customerIndex = app.customers.findIndex(c => c.id === customerId);
            if (customerIndex !== -1) {
                app.customers.splice(customerIndex, 1);
            }
            
            // Remove all orders for this customer
            app.orders = app.orders.filter(order => order.customerId !== customerId);
            
            // Clear selection if this customer was selected
            if (app.selectedCustomerId === customerId) {
                app.selectedCustomerId = null;
                document.getElementById('selectedCustomerInfo').style.display = 'none';
                document.getElementById('addOrderBtn').disabled = true;
            }
            
            // Update UI
            await renderCustomerList();
            await renderOrderHistory();
            updateStats();
            
            showNotification('Đã xóa khách hàng thành công!', 'success');
        } catch (error) {
            console.error('Error deleting customer:', error);
            showNotification('Lỗi xóa khách hàng. Vui lòng thử lại.', 'error');
        } finally {
            app.setLoading(false);
        }
    }
}

async function renderOrderHistory() {
    const tableBody = document.getElementById('orderTableBody');
    
    if (!app.selectedCustomerId) {
        tableBody.innerHTML = '<tr class="no-orders"><td colspan="6">Chọn khách hàng để xem lịch sử mua hàng</td></tr>';
        return;
    }
    
    try {
        const customerOrders = await app.getCustomerOrders(app.selectedCustomerId);
        
        if (customerOrders.length === 0) {
            tableBody.innerHTML = '<tr class="no-orders"><td colspan="6">Khách hàng chưa có đơn hàng nào</td></tr>';
            return;
        }
        
        tableBody.innerHTML = customerOrders.map((order) => `
            <tr>
                <td>${app.formatDate(order.date)}</td>
                <td>${order.product}</td>
                <td>${order.quantity}</td>
                <td>${app.formatCurrency(order.unitPrice)}</td>
                <td class="font-bold text-success">${app.formatCurrency(order.total)}</td>
                <td>
                    <button class="btn-danger" onclick="deleteOrder('${order.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error rendering order history:', error);
        tableBody.innerHTML = '<tr class="no-orders"><td colspan="6">Lỗi tải lịch sử đơn hàng</td></tr>';
    }
}

function showOrderModal() {
    document.getElementById('orderModal').style.display = 'block';
    document.getElementById('orderForm').reset();
}

function hideOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
}

async function handleAddOrder(event) {
    event.preventDefault();
    console.log('🔄 Form submitted for adding order');
    
    const formData = new FormData(event.target);
    
    // Safely get form values with null checks
    const productName = formData.get('productName');
    const quantity = formData.get('quantity');
    const unitPrice = formData.get('unitPrice');
    
    console.log('📝 Form data:', { productName, quantity, unitPrice });
    
    const orderData = {
        customerId: app.selectedCustomerId,
        product: productName ? productName.trim() : '',
        quantity: quantity,
        unitPrice: unitPrice
    };
    
    console.log('📦 Order data:', orderData);
    
    // Validate data
    if (!orderData.product) {
        alert('Vui lòng nhập tên sản phẩm');
        return;
    }
    
    if (!orderData.quantity || orderData.quantity <= 0) {
        alert('Vui lòng nhập số lượng hợp lệ');
        return;
    }
    
    if (!orderData.unitPrice || orderData.unitPrice <= 0) {
        alert('Vui lòng nhập đơn giá hợp lệ');
        return;
    }
    
    try {
        app.setLoading(true);
        
        // Add order
        await app.addOrder(orderData);
        
        // Update UI
        await renderOrderHistory();
        await renderCustomerList(); // Update total purchases
        hideOrderModal();
        
        showNotification('Đã thêm đơn hàng thành công!', 'success');
    } catch (error) {
        console.error('Error adding order:', error);
        showNotification('Lỗi thêm đơn hàng. Vui lòng thử lại.', 'error');
    } finally {
        app.setLoading(false);
    }
}

async function deleteOrder(orderId) {
    if (confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
        try {
            app.setLoading(true);
            
            // Delete from database
            await app.deleteOrder(orderId);
            
            // Update UI
            await renderOrderHistory();
            await renderCustomerList(); // Update total purchases
            
            showNotification('Đã xóa đơn hàng thành công!', 'success');
        } catch (error) {
            console.error('Error deleting order:', error);
            showNotification('Lỗi xóa đơn hàng. Vui lòng thử lại.', 'error');
        } finally {
            app.setLoading(false);
        }
    }
}

function updateStats() {
    document.getElementById('totalCustomers').textContent = app.customers.length;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles based on type
    let backgroundColor, textColor, borderColor;
    switch (type) {
        case 'success':
            backgroundColor = '#d4edda';
            textColor = '#155724';
            borderColor = '#c3e6cb';
            break;
        case 'error':
            backgroundColor = '#f8d7da';
            textColor = '#721c24';
            borderColor = '#f5c6cb';
            break;
        default:
            backgroundColor = '#d1ecf1';
            textColor = '#0c5460';
            borderColor = '#bee5eb';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${backgroundColor};
        color: ${textColor};
        border: 1px solid ${borderColor};
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        z-index: 1001;
        font-weight: 500;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}