import User from './user';

export default function UserProfile(props) {
  return <User userID={props.match.params.id} detailed={true} showCommands={true} />;
}
