import Form from '../../form';

export default function AuthForm(props) {
  return (
    <div className="margin-x--auto max-width--400">
      <h1 className="text-align--center">{props.heading}</h1>
      <Form endpoint={props.endpoint} />
    </div>
  );
}
