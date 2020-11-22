import { useEffect, useState } from 'react';
import { GET_OPT, fetchRetry, postOpt } from './api';
import CityForm from './cityform';
import history from './history';

export default function Form(props) {
  const [form, setForm] = useState({});
  const [networkError, setNetworkError] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRetry({url: props.endpoint, request: GET_OPT, limit: 10, delay: 1000})
      .then(data => setForm(data.form))
      .catch(() => setNetworkError(true));
  }, [props.endpoint]);

  const handleSubmit = (values) => {
    const options = props.options || postOpt;

    fetch(props.endpoint, options(values))
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
      form={form}
      setForm={setForm}
      networkError={networkError}
      processing={processing}
      setProcessing={setProcessing}
      onSubmit={handleSubmit} />
  );
}
