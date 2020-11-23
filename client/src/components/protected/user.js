import { Link } from 'react-router-dom';

export default function User(props) {
  return (
    <p className="line-height--1 zero--margin">
      <Link to={'/app/user/' + props.user.id}>
        {props.user.name || 'CityChat User'}
      </Link>
    </p>
  )
}
