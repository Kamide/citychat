import { ReactSVG } from 'react-svg';
import logomark from '../images/citychat-logomark.svg';
import logotype from '../images/citychat-logotype.svg';
import '../styles/logo.css'

export default function Logo() {
  return (
    <div className="ai-center citychat d-flex">
      <ReactSVG className="bg-fg-primary f-bg-0 logomark" src={logomark} />
      <ReactSVG className="f-fg-primary logotype" src={logotype} />
    </div>
  )
}
