import { useEffect, useState } from 'react';

import { Fetcher, protectedRoute, request } from '../../api';
import { CityDialog, CityTag } from '../../cityform';
import User from '../user/user';
import history from '../../history';

export default function Compose(props) {
  const [tags, setTags] = useState([]);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const fetcher = new Fetcher();

    fetcher.retry(protectedRoute('/self/friends'),
      request({
        method: 'GET', credentials: true
      }))
        .then(data => {
          if (Fetcher.isNonEmpty(data)) {
            setCandidates(data.friends);
          }
        });

    return () => fetcher.abort();
  }, []);

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
        candidates={candidates}
        compareCandidates={compareUsers}
        renderTag={renderUser}
        renderCandidate={renderUser}
        handleFilter={handleFilter}
        handleSubmit={handleSubmit} />
    </CityDialog>
  );

}
