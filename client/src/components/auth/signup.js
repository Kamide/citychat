import { Fragment, useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import CityForm from '../cityform';
import { POST_REQUEST, route } from '../api';

export default function Signup() {
  const [form, setForm] = useState({});
  const [processing, setProcessing] = useState(false);
  const [redirect, setRedirect] = useState('');

  useEffect(() => {
    fetch(route('/signup'))
      .then(response => response.json())
      .then(data => setForm(data.form));
  }, []);

  const handleSubmit = (values) => {
    fetch(route('/signup'), { ...POST_REQUEST, body: JSON.stringify(values) })
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
    <Fragment>
      <h1>Sign Up</h1>
      <CityForm
        form={form}
        setForm={setForm}
        processing={processing}
        setProcessing={setProcessing}
        onSubmit={handleSubmit} />
    </Fragment>
  );
}
