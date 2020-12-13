import { Link } from 'react-router-dom';

export default function Pending() {
  return (
    <main className="secondary Grid">
      <section>
        <header className="Masthead">
          <h1 className="Heading">Your Account Is Pending Activation</h1>
        </header>
        <p className="Content">
          Before you can start using your new CityChat account,
          you must confirm your email address.
        </p>
        <p className="Content">
          A confirmation link has been sent to your email box.
        </p>
      </section>
      <section>
        <header id="noEmail" className="Masthead">
          <h2 className="Heading">Didn't Get an Email?</h2>
        </header>
        <p className="Content">
          Please check your <em>spam</em> or <em>junk mail</em> folder.
        </p>
        <p className="Content">
          <Link to='/signup/resend'>Resend Confirmation Email</Link>
        </p>
      </section>
    </main>
  );
}
