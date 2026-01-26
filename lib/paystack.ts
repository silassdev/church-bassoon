const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

if (!PAYSTACK_SECRET_KEY) {
    console.error('CRITICAL ERROR: PAYSTACK_SECRET_KEY is missing from environment variables!');
} else {
    console.log('Paystack Utility: Secret Key is present (length: ' + PAYSTACK_SECRET_KEY.length + ')');
}

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

    const text = await response.text();
    if (!text) {
        throw new Error(`Paystack returned an empty response (Status: ${response.status})`);
    }

    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error('Failed to parse Paystack JSON:', text);
        throw new Error(`Invalid JSON response from Paystack (Status: ${response.status})`);
    }

    if (!response.ok) {
        console.error('Paystack API Error details:', data);
        throw new Error(data.message || `Paystack initialization failed: ${response.statusText}`);
    }

    return data;
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
