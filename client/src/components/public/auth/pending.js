import { Link } from 'react-router-dom';

export default function Pending() {
  return (
    <div className="margin-x--auto max-width--400 text-align--center">
      <h1>Pending Activation</h1>
      <p>
        Before you can start using your new CityChat account,
        you must confirm your email address.
      </p>
      <p className="padding-bottom--m stroke-bottom">
        A confirmation link has been sent to your email box.
      </p>

      <h2>Didn't get an email?</h2>
      <p>
        Please check your <em>spam</em> or <em>junk mail</em> folder.
      </p>
      <p>
        <Link to='/signup/resend' className="btn">Resend Confirmation Email</Link>
      </p>
    </div>
  );
}
