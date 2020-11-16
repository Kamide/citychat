import { Fragment } from 'react';

export default function Await() {
  return (
    <Fragment>
      <h1>You're almost there!</h1>
      <p>
        Please check your email for the confirmation link.
      </p>
      <p>
        Didn't get an email?{' '}
        Please check your please check your <em>spam</em> or <em>junk mail</em> folder.
      </p>
    </Fragment>
  );
}
