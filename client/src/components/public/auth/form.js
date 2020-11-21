import Form from '../../form';
import { publicRoute } from '../../api';

export default function AuthForm(props) {
  let {heading, endpoint, ...args} = props;
  endpoint = publicRoute(endpoint);

  return (
    <div className="margin-x--auto max-width--400">
      <h1 className="text-align--center">{props.heading}</h1>
      <Form endpoint={endpoint} {...args} />
    </div>
  );
}
