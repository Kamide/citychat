import { useState } from 'react';

export default function CityForm(props) {
  if (Object.keys(props.form).length === 0) {
    return null;
  }

  const renderField = (field, key) => {
    const args = { field: field, key: key }

    if (field.tag === 'label') {
      return <CityLabel {...args} />;
    }

    switch (field.args.type) {
      case 'email':
        return <CityEmail {...args} />;
      case 'password':
        return <CityPassword {...args} />;
      default:
        return <CityInput {...args} />;
    }
  };

  const renderErrors = (id) => {
    if (!props.errors[id]) {
      return null;
    }

    return (
      <ul>
        {props.errors[id].map((error, index) => {
          return <li key={id + index}>{error}</li>
        })}
      </ul>
    );
  };

  return (
    <form className="mv-3" {...props.form.args}>
      {Object.entries(props.form.fields).map(([key, fields]) => {
        return (
          <div key={key}>
            {fields.map((field, index) => {
              return renderField(field, index);
            })}
          </div>
        );
      })}
    </form>
  );
}

function CityEmail(props) {
  const {type, ...args} = props.field.args;
  return <input type="text" {...args} />;
}

function CityInput(props) {
  return <input {...props.field.args} />;
}

function CityLabel(props) {
  return (
    <label {...props.field.args}>
      {props.field.value}
    </label>
  );
}

function CityPassword(props) {
  const [visible, setVisible] = useState(false);

  const toggle = () => {
    setVisible(!visible);
  };

  const field = props.field;
  field.args.type = visible ? 'text' : 'password';

  return (
    <span>
      <CityInput field={field} />
      <button type="button" onClick={toggle}>{visible ? 'Hide' : 'Show'}</button>
    </span>
  );
}
