import { ReactSVG } from 'react-svg';

import logomark from '../images/citychat-logomark.svg';
import logotype from '../images/citychat-logotype.svg';

import '../styles/logo.css'

export default function Logo() {
  return (
    <div aria-label="Go to home page" className="align-items--center citychat display--flex">
      <ReactSVG aria-hidden="true" className="bg-primary-3 fill--bg-0 logomark" src={logomark} />
      <ReactSVG aria-hidden="true" className="fill--primary-3 logotype" src={logotype} />
    </div>
  );
}
