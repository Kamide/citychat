import { useState, useEffect } from 'react';
import { GET_OPT_JWT, apiFetch, protectedRoute } from '../api';

export default function ProtectedApp() {
  const [name, setName] = useState('CityChat User');

  useEffect(() => {
    apiFetch(protectedRoute('/user/self'), GET_OPT_JWT)
      .then(data => {
        if (data) {
          setName(data.name);
        }
      });
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome back, {name}!</p>
    </div>
  );
}
