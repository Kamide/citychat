import { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import CityForm from './cityform';
import { POST_REQUEST, route } from './api';

export default function Form(props) {
  const [form, setForm] = useState({});
  const [processing, setProcessing] = useState(false);
  const [redirect, setRedirect] = useState('');

  useEffect(() => {
    fetch(route(props.endpoint))
      .then(response => response.json())
      .then(data => setForm(data.form));
  }, []);

  const handleSubmit = (values) => {
    fetch(route(props.endpoint), { ...POST_REQUEST, body: JSON.stringify(values) })
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
      processing={processing}
      setProcessing={setProcessing}
      onSubmit={handleSubmit} />
  );
}
