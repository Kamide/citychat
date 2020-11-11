import { Fragment, useState } from 'react';

export default function CityForm(props) {
  if (!Array.isArray(props.fields) || !props.fields.length) {
    return null;
  }

  const renderField = (field) => {
    if (field.type === 'label') {
      return <CityLabel field={field} />;
    }

    switch (field.args.type) {
      case 'password':
        return <CityPassword field={field} />;
      default:
        return <CityInput field={field} />;
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

  let label = null;

  return (
    <form class="mv-3">
      {props.fields.map((field) => {
        const id = field.args.id;

        if (field.type === 'label') {
          label = field;
          return null;
        }

        let group = (
          <Fragment>
            {renderField(field)}
            {renderErrors(id)}
          </Fragment>
        );

        if (label) {
          group = (
            <Fragment>
              {renderField(label)}
              {group}
            </Fragment>
          )
          label = null;
        }

        return (
          <div key={id}>
            {group}
          </div>
        )
      })}
    </form>
  );
}

function CityInput(props) {
  return <input type={props.field.args.type} id={props.field.args.id} {...props.field.args} />;
}

function CityLabel(props) {
  return (
    <label htmlFor={props.field.htmlFor} id={props.field.args.id} {...props.field.args}>
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
  )
}
