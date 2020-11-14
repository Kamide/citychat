import { Fragment, useEffect, useState } from 'react';
import CityForm from '../cityform';
import route from '../route';

export default function Signup() {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch(route('/signup'))
      .then(response => response.json())
      .then(data => setForm(data.form));
  }, []);

  return (
    <Fragment>
      <h1>Sign Up</h1>
      <CityForm form={form} errors={errors} />
    </Fragment>
  );
}
