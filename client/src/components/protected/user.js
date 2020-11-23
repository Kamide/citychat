import { Link } from 'react-router-dom';

export default function User(props) {
  const userDNE = 'CityChat User';

  const renderUser = () => (
    <Link to={'/app/user/' + props.user.id}>
        {props.user.name}
      </Link>
  );

  return (
    <p className="line-height--1 zero--margin">
      {props.user ? renderUser() : userDNE}
    </p>
  )
}
