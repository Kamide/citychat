import { useEffect, useState } from 'react';

import { fetchRetry, request} from './api';
import CityForm from './cityform';
import history from './history';

export default function Form(props) {
  const [form, setForm] = useState({});
  const [networkError, setNetworkError] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRetry(props.endpoint, request({method: 'GET'}))
      .then(data => setForm(data.form))
      .catch(() => setNetworkError(true));
  }, [props.endpoint]);

  const handleSubmit = (values) => {
    const requestOptions = props.request || request({method: 'POST'});

    fetch(props.endpoint, {...requestOptions, body: JSON.stringify(values)})
      .then(response => response.json())
      .then(data => {
        if (props.setData) {
          props.setData(data);
        }

        if (data.redirect) {
          history.push(data.redirect);
        }
        else {
          setForm({
            ...form,
            errors: data.errors
          });

          setProcessing(false);
        }
      });
  };

  return (
    <CityForm
      className={props.className}
      form={form}
      setForm={setForm}
      networkError={networkError}
      processing={processing}
      setProcessing={setProcessing}
      onSubmit={handleSubmit} />
  );
}
