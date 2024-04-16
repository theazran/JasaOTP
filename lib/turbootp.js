const axios = require("axios");

const apiKey = "67798d02f07945735bdb17d06aea6fc6";
async function profile() {
    try {
        const response = await axios.get(
            `https://turbotoko.com/api/get-profile/${apiKey}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
    }
}

async function getServices() {
    try {
        const response = await axios.get(
            `https://turbotoko.com/api/get-services/${apiKey}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching services:", error);
        throw error;
    }
}

async function placeOrder(serviceId) {
    try {
        const response = await axios.get(
            `https://turbotoko.com/api/set-orders/${apiKey}/${serviceId}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error placing order:", error);
        throw error;
    }
}

async function fetchOrder(orderId) {
    try {
        const response = await axios.get(
            `https://turbotoko.com/api/get-orders/${apiKey}/${orderId}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching order:", error);
        throw error;
    }
}

async function cancelOrder(orderId) {
    try {
        const response = await axios.get(
            `https://turbotoko.com/api/cancle-orders/${apiKey}/${orderId}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error cancelling order:", error);
        throw error;
    }
}

module.exports = {
    profile,
    getServices,
    placeOrder,
    fetchOrder,
    cancelOrder,
};
