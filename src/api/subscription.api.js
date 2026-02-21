import api from "./axios";

export const createCheckoutSession = async (plan) => {
  try {
    // Calls POST /subscription/checkout with { "plan": "PRO" }
    const response = await api.post("/subscription/checkout", { plan });
    return response.data; // Returns { url: "https://stripe.com/..." }
  } catch (error) {
    throw error.response?.data || error.message;
  }
};