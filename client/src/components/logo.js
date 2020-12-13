import { ReactSVG } from 'react-svg';

import logomark from '../images/citychat-logomark.svg';
import logotype from '../images/citychat-logotype.svg';

import '../styles/logo.css'

export default function Logo() {
  return (
    <div aria-label="CityChat logo" className="CityChat">
      <ReactSVG aria-hidden="true" className="Logomark" src={logomark} />
      <ReactSVG aria-hidden="true" className="Logotype" src={logotype} />
    </div>
  );
}
