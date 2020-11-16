import { useState } from 'react';
import { ReactSVG } from 'react-svg';
import blinkingEllipsis from '../images/blinking-ellipsis.svg';

export default function CityForm(props) {
  if (Object.keys(props.form).length === 0) {
    return <ReactSVG aria-label="Loading form" className="f-fg-0 mv-3" src={blinkingEllipsis} />;
  }

  const renderField = (field, key, processing) => {
    const args = { field: field, key: key , processing: processing}

    if (field.tag === 'label') {
      return <CityLabel {...args} />;
    }

    switch (field.args.type) {
      case 'email':
        return <CityEmail {...args} />;
      case 'password':
        return <CityPassword {...args} />;
      case 'submit':
        return <CitySubmit {...args} />;
      default:
        return <CityInput {...args} />;
    }
  };

  const renderErrors = (key) => {
    if (!props.form.errors[key].length) {
      return null;
    }

    return (
      <ul>
        {props.form.errors[key].map((error, index) => {
          return <li key={key + index}>{error}</li>
        })}
      </ul>
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const values = Object.keys(props.form.values).reduce((values, key) => {
      values[key] = event.target[key].value;
      return values;
    }, {});

    props.setForm({
      ...props.form,
      values: values
    });

    props.setProcessing(true);
    props.onSubmit(values);
  };

  return (
    <form className="mv-3" onSubmit={handleSubmit} {...props.form.args}>
      {props.form.fields.map(([key, fields]) => {
        return (
          <div key={key}>
            {fields.map((field, index) => {
              return renderField(field, index, props.processing);
            })}
            {renderErrors(key)}
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

function CitySubmit(props) {
  const {processing, ...args} = props;

  if (processing) {
    return <ReactSVG aria-label="Your form data is being processed" className="f-fg-0" src={blinkingEllipsis} />;
  }

  return <input {...args.field.args} />;
}
