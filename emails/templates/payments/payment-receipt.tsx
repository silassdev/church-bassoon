type Props = {
    name: string;
    amount: number;
    transactionId: string;
    date: string;
};

export default function PaymentReceipt({ name, amount, transactionId, date }: Props) {
    return (
        <div>
            <h2>Payment Receipt</h2>
            <p>Hello {name},</p>
            <p>Thank you for your generous contribution.</p>
            <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <p><strong>Amount:</strong> ₦{amount.toLocaleString()}</p>
                <p><strong>Transaction ID:</strong> {transactionId}</p>
                <p><strong>Date:</strong> {date}</p>
            </div>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    );
}
