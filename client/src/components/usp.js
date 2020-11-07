import { Component, Fragment } from 'react';

export default class USP extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: ''
    };

    this.talk = this.talk.bind(this);
  }

  talk(event) {
    event.preventDefault();
    fetch(`${process.env['REACT_APP_API_URL'] || 'http://localhost:5000'}/`)
      .then(response => response.json())
      .then(data => this.setState(data));
  }

  render() {
    return (
      <Fragment>
        <h1>USP</h1>
        <p className="mv-3">Unique Selling Proposition</p>

        <form method="get" onSubmit={this.talk}>
          <input type="submit" value="Talk to citychat-server" />
        </form>

        <p className="mv-3">{this.state.data}</p>
      </Fragment>
    );
  }
}
