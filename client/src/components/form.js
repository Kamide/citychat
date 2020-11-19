import { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import CityForm from './cityform';
import { GET_REQUEST, fetchRetry, postRequest, route } from './api';

export default function Form(props) {
  const [form, setForm] = useState({});
  const [networkError, setNetworkError] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [redirect, setRedirect] = useState('');

  useEffect(() => {
    fetchRetry(route(props.endpoint), GET_REQUEST, 10, 1000)
      .then(data => setForm(data.form))
      .catch(error => setNetworkError(true));
  }, [props.endpoint]);

  const handleSubmit = (values) => {
    fetch(route(props.endpoint), postRequest(JSON.stringify(values)))
      .then(response => response.json())
      .then(data => {
        if (data.redirect) {
          setRedirect(data.redirect);
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

  if (redirect) {
    return <Redirect to={redirect} />
  }

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
