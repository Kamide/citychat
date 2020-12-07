export default function UserTag(props) {
  return (
    <span>
      {props.user.name} <span>@{props.user.id}</span>
    </span>
  );
}
