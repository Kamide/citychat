import { useContext, useState } from 'react';

import { CityDialog, CityTag } from '../../cityform';
import { StoreContext } from '../../store';
import User from '../user/user';
import history from '../../history';

export default function Compose(props) {
  const [state] = useContext(StoreContext);
  const [tags, setTags] = useState([]);

  const compareUsers = (lhs, rhs) => lhs.id === rhs.id;
  const renderUser = (value) => <User user={value} hideLink={true} />;
  const handleFilter = (c, keyword) => c.name.toLowerCase().includes(keyword);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (tags.length) {
      props.setVisible(false);
      history.push('/app/chat/user/' + tags.map(t => t.id).join('-'));
    }
  }

  return (
    <CityDialog heading="Start a New Chat" setVisible={props.setVisible}>
      <CityTag
        inputID="newChatParticipants"
        inputLabel="Participants"
        submitLabel="Start Chat"
        tags={tags}
        setTags={setTags}
        candidates={state.relationships.friends}
        compareCandidates={compareUsers}
        renderTag={renderUser}
        renderCandidate={renderUser}
        handleFilter={handleFilter}
        handleSubmit={handleSubmit} />
    </CityDialog>
  );

}
