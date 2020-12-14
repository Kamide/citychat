import { publicRoute } from '../../api';
import Form from '../../form';

export default function AuthForm(props) {
  let {heading, endpoint, ...args} = props;
  endpoint = publicRoute(endpoint);

  return (
    <main className="secondary Grid">
      <header className="Masthead">
        <h1 className="Heading">{props.heading}</h1>
      </header>
      <div>
        <Form className="Content" endpoint={endpoint} {...args} />
      </div>
    </main>
  );
}
