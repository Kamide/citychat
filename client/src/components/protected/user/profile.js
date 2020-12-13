import User from './user';

export default function UserProfile(props) {
  return (
    <main className="single secondary Grid Profile">
      <header className="Masthead">
        <h1 className="Heading">
          <User userID={props.match.params.id} profile={true} />
        </h1>
      </header>
    </main>
  );
}
