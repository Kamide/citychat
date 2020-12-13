import { publicRoute } from '../../api';
import Form from '../../form';

export default function AuthForm(props) {
  let {heading, endpoint, ...args} = props;
  endpoint = publicRoute(endpoint);

  return (
    <div>
      <h1>{props.heading}</h1>
      <Form endpoint={endpoint} {...args} />
    </div>
  );
}
