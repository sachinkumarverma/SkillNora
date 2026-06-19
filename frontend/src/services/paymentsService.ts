import apiClient from '@/lib/apiClient';

const createOrder = async (amount: number, currency: string = 'INR') => {
    return (await apiClient.post('/api/payments/create-order', { amount, currency })).data;
};

const verifyOrder = async (data: any) => {
    return (await apiClient.post('/api/payments/verify-order', data)).data;
};

export const paymentsService = {
    createOrder,
    verifyOrder
};
