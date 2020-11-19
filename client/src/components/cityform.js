import { useEffect, useState } from 'react';
import { ReactSVG } from 'react-svg';
import blinkingEllipsis from '../images/blinking-ellipsis.svg';

export default function CityForm(props) {
  const [processingTimer, setProcessingTimer] = useState(0);

  useEffect(() => {
    return () => {
      clearTimeout(processingTimer);
    };
  }, [processingTimer]);

  if (props.networkError) {
    return (
      <div className="text-align--center">
        Sorry, something went wrong.
        Please refresh the page and try again.
      </div>
    )
  }

  if (Object.keys(props.form).length === 0) {
    return (
      <div aria-label="Loading form" className="text-align--center">
        <ReactSVG aria-hidden="true" src={blinkingEllipsis} />
      </div>
    );
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
      <ul className="padding-left--l">
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
    setProcessingTimer(setTimeout(() => props.setProcessing(false), 5000));
    props.onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} {...props.form.args}>
      {props.form.fields.map(([key, fields]) => {
        return (
          <div className="display--flex field-group flex-direction--column margin-y--m" key={key}>
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
  return <input className={props.className} {...props.field.args} />;
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
    <span className="display--flex">
      <CityInput className="flex--fill" field={field} />
      <button className="btn inline" type="button" onClick={toggle}>
        {visible ? 'Hide' : 'Show'}
      </button>
    </span>
  );
}

function CitySubmit(props) {
  const {processing, ...args} = props;

  if (processing) {
    return (
      <div aria-label="Your form data is being processed" className="btn margin-top--s text-align--center">
        <ReactSVG aria-hidden="true" src={blinkingEllipsis} />
      </div>
    );
  }

  return <input className="btn margin-top--s" {...args.field.args} />;
}
