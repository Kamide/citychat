import { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import CityForm from './cityform';
import { GET_REQ, fetchRetry, postReq, postReqCred } from './api';

export default function Form(props) {
  const [form, setForm] = useState({});
  const [networkError, setNetworkError] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [redirect, setRedirect] = useState('');

  useEffect(() => {
    fetchRetry(props.endpoint, GET_REQ, 10, 1000)
      .then(data => setForm(data.form))
      .catch(() => setNetworkError(true));
  }, [props.endpoint]);

  const handleSubmit = (values) => {
    const params = props.includeCredentials ? postReqCred : postReq;

    fetch(props.endpoint, params(values))
    .then(response => response.json())
    .then(data => {
        if (props.setData) {
          props.setData(data);
        }

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
