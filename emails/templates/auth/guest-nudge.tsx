type Props = {
  name: string;
  signupUrl: string;
};

export default function GuestNudge({ name, signupUrl }: Props) {
  return (
    <div>
      <h2>Hello {name},</h2>
      <p>
        You recently made a payment on our platform without creating an account.
      </p>
      <p>
        <a href={signupUrl}>Complete account setup</a> to track payments and receive receipts.
      </p>
    </div>
  );
}
