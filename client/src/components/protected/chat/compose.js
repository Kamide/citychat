import { useEffect, useState } from 'react';

import { fetchRetry, protectedRoute, request } from '../../api';
import { CityTag } from '../../cityform';
import User from '../user/user';
import history from '../../history';

export default function Compose(props) {
  const [tags, setTags] = useState([]);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    fetchRetry(protectedRoute('/self/friends'),
      request({
        method: 'GET', credentials: true
      }))
        .then(data => {
          if (data && Object.keys(data).length) {
            setCandidates(data.friends);
          }
        });
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
    <CityTag
      inputID="newParticipant"
      inputLabel="To"
      submitLabel="Start Conversation"
      tags={tags}
      setTags={setTags}
      candidates={candidates}
      compareCandidates={compareUsers}
      renderTag={renderUser}
      renderCandidate={renderUser}
      handleFilter={handleFilter}
      handleSubmit={handleSubmit} />
  );

}
