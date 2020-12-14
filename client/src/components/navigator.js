import { Link } from 'react-router-dom';

export default function Navigator(props) {
  return props.destinations.map((x, i) => {
    const destination = x[0];
    const value = x[1];
    let className = props.className || '';

    if (props.location.pathname.startsWith(x[0])) {
      className += ' active'
    }

    return (
      <li key={i}>
        <Link className={className} to={destination}>
          {value}
        </Link>
      </li>
    );
  });
}
