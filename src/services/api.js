// import axios from 'axios';

// const API_URL = "http://localhost:8080";

// // Add Customer
// export const addCustomer = async (customerData) => {
//     try {
//         const response = await axios.post(`${API_URL}/add-customer`, customerData);
//         return response.data; 
//     } catch (error) {
//         throw error;
//     }
// };

// // Add Order
// export const addOrder = async (orderData) => {
//     try {
//         const response = await axios.post(`${API_URL}/add-order`, orderData);
//         return response.data;
//     } catch (error) {
//         throw error;
//     }
// };

// // Get Pending Orders (For Dashboard)
// export const getPendingOrders = async () => {
//     try {
//         const response = await axios.get(`${API_URL}/pending-orders`);
//         return response.data;
//     } catch (error) {
//         console.error("API Error:", error);
//         throw error;
//     }
// };

// // Update Order Status (For Modal)
// export const updateOrderStatus = async (orderId, shirtStatus, pantStatus) => {
//     try {
//         const response = await axios.post(`${API_URL}/update-status`, null, {
//             params: { orderId, shirtStatus, pantStatus }
//         });
//         return response.data;
//     } catch (error) {
//         throw error;
//     }
// };



import axios from 'axios';

// This is now your LIVE backend URL
const API_URL = "https://my-tailor-app-backend.onrender.com";

// Add Customer
export const addCustomer = async (customerData) => {
    try {
        const response = await axios.post(`${API_URL}/add-customer`, customerData);
        return response.data; 
    } catch (error) {
        throw error;
    }
};

// Add Order
export const addOrder = async (orderData) => {
    try {
        const response = await axios.post(`${API_URL}/add-order`, orderData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get Pending Orders (For Dashboard)
export const getPendingOrders = async () => {
    try {
        const response = await axios.get(`${API_URL}/pending-orders`);
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

// Update Order Status (For Modal)
export const updateOrderStatus = async (orderId, shirtStatus, pantStatus) => {
    try {
        const response = await axios.post(`${API_URL}/update-status`, null, {
            params: { orderId, shirtStatus, pantStatus }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};