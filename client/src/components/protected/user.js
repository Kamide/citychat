import { Link } from 'react-router-dom';

export default function User(props) {
  const userDNE = 'CityChat User';

  const renderUser = () => (
    <Link to={'/app/user/' + props.user.id}>
      {props.user.name}{' '}
      {props.showID && <span>@{props.user.id}</span>}
    </Link>
  );

  return (
    <p>
      {props.user ? renderUser() : userDNE}
    </p>
  );
}
