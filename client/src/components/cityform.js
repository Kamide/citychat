import { useEffect, useRef, useState } from 'react';
import { ReactSVG } from 'react-svg';

import blinkingEllipsis from '../images/blinking-ellipsis.svg';
import closeIcon from '../images/close-icon.svg';

export default function CityForm(props) {
  const [processingTimer, setProcessingTimer] = useState(0);

  useEffect(() => {
    return () => {
      clearTimeout(processingTimer);
    };
  }, [processingTimer]);

  if (props.networkError) {
    return (
      <div className={props.className}>
        Sorry, something went wrong.
        Please refresh the page and try again.
      </div>
    );
  }

  if (!Object.keys(props.form).length) {
    return (
      <div aria-label="Loading form" className={props.className}>
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
    setProcessingTimer(setTimeout(() => props.setProcessing(false), 5000));
    props.onSubmit(values);
  };

  return (
    <form className={props.className} onSubmit={handleSubmit} {...props.form.args}>
      {props.form.fields.map(([key, fields]) => {
        return (
          <div key={key} className="Field Group">
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
  return <input className="Input Field" type="text" {...args} />;
}

function CityInput(props) {
  return <input className="Input Field" {...props.field.args} />;
}

function CityLabel(props) {
  return (
    <label className="Label" {...props.field.args}>
      {props.field.value}
    </label>
  );
}

function CityPassword(props) {
  const [visible, setVisible] = useState(false);

  const toggle = () => {
    setVisible(prevVisible => !prevVisible);
  };

  const field = {
    ...props.field,
    args: {
      ...props.field.args,
      type: visible ? 'text' : 'password'
    }
  }

  return (
    <span className="Combined Field">
      <CityInput field={field} />
      <button className="secondary Text Button Field" type="button" onClick={toggle}>
        {visible ? 'Hide' : 'Show'}
      </button>
    </span>
  );
}

function CitySubmit(props) {
  const {processing, ...args} = props;

  if (processing) {
    return (
      <div aria-label="Your form data is being processed">
        <ReactSVG aria-hidden="true" src={blinkingEllipsis} />
      </div>
    );
  }

  return <input className="primary Text Button Field" {...args.field.args} />;
}

export function CityTag(props) {
  const field = useRef(null);
  const [input, setInput] = useState('');
  const [tagIndex, setTagIndex] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [candidateIndex, setCandidateIndex] = useState(0);

  const focusField = () => {
    if (field.current) {
      field.current.focus();
    }
  };

  useEffect(() => {
    focusField();
  }, []);

  const KEY = {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    ENTER: 13,
    BACKSPACE: 8,
    DELETE: 46
  };

  const resolveTagIndex = () => tagIndex + props.tags.length;

  const addTag = (index) => {
    if (candidates.length) {
      setTagIndex(0);
      props.setTags(prevTags => {
        if (prevTags.find(t => props.compareCandidates(t, candidates[index]))) {
          return prevTags;
        }
        else {
          return prevTags.concat([candidates[index]])
        }
      });

      setCandidates([]);
      setInput('');
    }

    if (field.current) {
      field.current.focus();
    }
  };

  const removeTag = (index, backspace) => {
    if (backspace) {
      setTagIndex(prevTagIndex => Math.max(-1 * (props.tags.length - 1), prevTagIndex));
    }
    else {
      setTagIndex(prevTagIndex => Math.max(-1 * (props.tags.length - 1), prevTagIndex + 1));
    }

    props.setTags(prevTags => {
      return [
        ...prevTags.slice(0, index),
        ...prevTags.slice(index + 1)
      ];
    });

    if (field.current) {
      field.current.focus();
    }
  };

  const filterCandidates = (event) => {
    const keyword = event.target.value;
    setInput(keyword);
    setTagIndex(event.target.selectionStart);
    setCandidates(props.candidates.filter(c =>
      keyword
      && !props.tags.includes(c)
      && props.handleFilter(c, keyword)));
  };

  const selectCandidates = (event) => {
    switch (event.keyCode) {
      case KEY.UP:
        event.preventDefault();
        setCandidateIndex(prevSelection => Math.max(0, prevSelection - 1));
        break;

      case KEY.DOWN:
        event.preventDefault();
        setCandidateIndex(prevSelection => Math.min(candidates.length - 1, prevSelection + 1));
        break;

      case KEY.LEFT:
        setTagIndex(prevTagIndex => Math.max(-1 * props.tags.length, prevTagIndex - 1));
        break;

      case KEY.RIGHT:
        if (tagIndex < 0) {
          event.preventDefault();
        }
        setTagIndex(prevTagIndex => Math.min(input.length, prevTagIndex + 1));
        break;

      case KEY.ENTER:
        if (input) {
          event.preventDefault()
          addTag(candidateIndex);
        }
        else {
          props.handleSubmit(event);
        }
        break;

      case KEY.BACKSPACE:
      case KEY.DELETE:
        if (tagIndex < 0) {
          event.preventDefault();
          removeTag(resolveTagIndex(), event.keyCode === KEY.DELETE);
        }
        else if (!input.length && props.tags.length) {
          setTagIndex(-1);
        }
        break;

      default:
        setCandidateIndex(0);
    }
  };

  const renderTags = () => {
    return (
      <ul id={props.inputID + 'props.tags'} class="TagContainer">
        {props.tags.map((value, index) => {
          return (
            <li key={index}>
              {index === resolveTagIndex() &&
                <span className="Hidden">Selected</span>}
              <button
                className={'secondary Text Button Field' + (index === resolveTagIndex() ? ' active' : '')}
                onClick={() => removeTag(index, false)}>
                {props.renderTag(value)}
              </button>
            </li>
          );
        })}
      </ul>
    );
  };

  const renderCandidates = () => {
    if (!candidates.length) {
      return null;
    }

    return (
      <ul className="CandidateContainer">
        {candidates.map((value, index) => {
          return (
            <li key={index}>
              {index === candidateIndex &&
                <span className="Hidden">Selected</span>}
              <button
                className={'secondary Text Button Field' + (index === candidateIndex ? ' active' : '')}
                onClick={() => addTag(index)}>
                {props.renderCandidate(value)}
              </button>
            </li>
          );
        })}
      </ul>
    );
  };

  const className = 'CityTag ' + (props.containerAttributes
    && props.containerAttributes.className)
    || '';

  return (
    <form {...props.containerAttributes} className={className}>
      <label className="Label" htmlFor={props.inputID}>{props.inputLabel}</label>
      <div className="Combined Field" onClick={focusField}>
        <div className="Combined Input Field">
          {renderTags()}

          <div className="Overlay">
            <input
              type="text"
              id={props.inputID}
              className="Field"
              ref={field}
              value={input}
              onInput={filterCandidates}
              onKeyDown={selectCandidates} />

            {tagIndex > -1 && renderCandidates()}
          </div>
        </div>
        <input className="primary Text Button Field Submit" type="submit" value={props.submitLabel} onClick={props.handleSubmit} />
      </div>
    </form>
  );
}

export function CityDialog(props) {
  return (
    <div className="Modal">
      <aside className="Dialog">
        <header className="Masthead">
          <h1 className="Heading">
            {props.heading}
          </h1>
          <nav>
            <button aria-label="Close" className="tertiary Icon Button Field" onClick={() => props.setVisible(false)}>
              <ReactSVG aria-hidden="true" src={closeIcon} />
            </button>
          </nav>
        </header>
        <div className="Content">
          {props.children}
        </div>
      </aside>
    </div>
  );
}
