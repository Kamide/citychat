import { Fragment, useEffect, useState } from 'react';
import CityForm from '../cityform';
import route from '../route';

export default function Signup() {
  const [fields, setFields] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch(route('/signup'))
      .then(response => response.json())
      .then(data => setFields(data.fields));
  }, []);

  return (
    <Fragment>
      <h1>Sign Up</h1>
      <CityForm fields={fields} errors={errors} />
    </Fragment>
  );
}
