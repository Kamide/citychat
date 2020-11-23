import logo from '../../images/citychat-logomark.svg';

export default function User(props) {
  return (
    <p className="line-height--1 zero--margin">
      {props.user.name || 'CityChat User'}
    </p>
  )
}
