const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface PaystackInitializeResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

export interface PaystackVerifyResponse {
    status: boolean;
    message: string;
    data: {
        id: number;
        status: string;
        reference: string;
        amount: number;
        customer: {
            email: string;
        };
        metadata?: any;
    };
}


export async function initializePaystackTransaction(params: {
    email: string;
    amount: number; // In kobo (₦1 = 100 kobo)
    reference: string;
    metadata?: any;
    callback_url?: string;
}): Promise<PaystackInitializeResponse> {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: params.email,
            amount: params.amount,
            reference: params.reference,
            metadata: params.metadata,
            callback_url: params.callback_url,
        }),
    });

    if (!response.ok) {
        throw new Error(`Paystack initialization failed: ${response.statusText}`);
    }

    return response.json();
}


export async function verifyPaystackTransaction(
    reference: string
): Promise<PaystackVerifyResponse> {
    const response = await fetch(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Paystack verification failed: ${response.statusText}`);
    }

    return response.json();
}


export function generatePaymentReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `PAY-${timestamp}-${random}`.toUpperCase();
}
