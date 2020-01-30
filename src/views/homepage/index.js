import React, { useState, useEffect } from 'react';
import Videostream from 'components/videostream';
import * as firebase from 'services/firebase';
import { createRoom, joinRoomById, hangUp, openUserMedia } from 'services/WebRTCConnection';

const callTypes = {
  incoming: 'INCOMING',
  outgoing: 'OUTGOING',
  idle: 'IDLE',
  calling: 'CALLING',
};

function Homepage() {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [people, setPeople] = useState([]);
  const [currentPerson, setCurrentPerson] = useState(null);
  const [call, setCall] = useState({ type: callTypes.idle, calleeID: null, callerID: null });

  useEffect(() => {
    firebase.onPersonAdded(newPerson => setPeople(prev => [...prev, newPerson]));
  }, []);

  useEffect(() => {
    if (currentPerson) {
      const { id } = currentPerson;
      firebase.listeningOffer(id, async offer => {
        if (offer) {
          if (offer.roomID && call.type !== callTypes.calling) {
            await joinRoomById(offer.roomID);
            setCall({
              type: callTypes.calling,
              callerID: offer.callerID,
              cancle: () => {
                offer.cancle();
                hangUp();
                setLocalStream(null);
                setRemoteStream(null);
              },
            });
          } else {
            setCall({
              type: callTypes.incoming,
              callerID: offer.callerID,
              answer: () => {
                offer.answer();
                initStreams();
              },
              cancle: offer.cancle,
            });
          }

          return;
        }
        setCall({ type: callTypes.idle });
      });
    }
  }, [currentPerson]);

  async function initStreams() {
    const { localStream, remoteStream } = await openUserMedia();

    setLocalStream(localStream);
    setRemoteStream(remoteStream);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const name = e.target.elements['name'].value;
    let person = await firebase.getPerson(name);
    if (!person) {
      const newPersonID = await firebase.createPerson(name);
      person = { id: newPersonID, name };
    }
    setCurrentPerson(person);
  }

  function startCalling(calleePerson) {
    try {
      const calleeID = calleePerson.id;
      const callerID = currentPerson.id;

      setCall({ type: callTypes.outgoing, calleeID });

      const callMeta = { callerID, calleeID };
      const cancle = firebase.startOffer(callMeta, async (offer, off) => {
        // Whether the calling is null then stop waiting on the outgoing call.
        if (!offer) {
          off();
          setCall({ type: callTypes.idle });

          return;
        }

        if (offer.isAnswer && !offer.roomID) {
          const roomID = await createRoom();
          offer.updateRoomID(roomID);
        }
      });

      setCall(prev => ({
        ...prev,
        cancle: () => {
          cancle();
          hangUp();
          setLocalStream(null);
          setRemoteStream(null);
        },
      }));

      initStreams();
    } catch (e) {
      setCall({ type: callTypes.idle });
    }
  }

  return (
    <section className="homepage">
      {currentPerson ? (
        <div>Logged in as {currentPerson.name}</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="name-input">Name</label>
          <input name="name" id="name-input" placeholder="Please enter your name" />
          <button type="submit">Login</button>
        </form>
      )}
      {call.type === callTypes.outgoing ? (
        <div>calling to {call.calleeID}</div>
      ) : call.type === callTypes.incoming ? (
        <div>{call.callerID} is calling</div>
      ) : null}
      {call.answer && <button onClick={call.answer}>Answer calling</button>}
      {call.cancle && <button onClick={call.cancle}>Stop calling</button>}
      <div className="stream">
        <Videostream
          src={localStream}
          autoplay
          mute
          layout={{ position: 'absolute', width: '120px', height: '140px' }}
        />
        <Videostream src={remoteStream} autoplay layout={{ width: '400px', height: '700px' }} />
      </div>
      <ul>
        {people
          .filter(person => !currentPerson || person.name !== currentPerson.name)
          .map(person => (
            <li key={person.id}>
              <span>{person.name}</span>
              {currentPerson && call.type === callTypes.idle && (
                <button onClick={() => startCalling(person)}>Call</button>
              )}
            </li>
          ))}
      </ul>
    </section>
  );
}

export default Homepage;
