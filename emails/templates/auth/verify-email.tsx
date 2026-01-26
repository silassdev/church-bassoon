type Props = {
    name: string;
    verifyUrl: string;
};

export default function VerifyEmail({ name, verifyUrl }: Props) {
    return (
        <div>
            <h2>Welcome {name},</h2>
            <p>
                Thank you for joining us. Please verify your email address to get started.
            </p>
            <p>
                <a href={verifyUrl}>Verify Email Address</a>
            </p>
        </div>
    );
}
