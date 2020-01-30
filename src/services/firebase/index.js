import * as firebase from 'firebase';

const config = {
  apiKey: 'AIzaSyDrilrSBNrRytPpWTXObT-OFrcGS-Pqqpg',
  authDomain: 'elderlyvideocall.firebaseapp.com',
  databaseURL: 'https://elderlyvideocall.firebaseio.com',
  projectId: 'elderlyvideocall',
  storageBucket: 'elderlyvideocall.appspot.com',
  messagingSenderId: '752308920589',
  appId: '1:752308920589:web:1ab725a18bfdf2d5bb5044',
  measurementId: 'G-J8R1TC23S6',
};

firebase.initializeApp(config);

const peopleRef = firebase.database().ref('people');

function getPerson(name) {
  return peopleRef
    .orderByChild('name')
    .equalTo(name)
    .once('value')
    .then(snapshot => {
      const matchedPeople = [];
      snapshot.forEach(childSnapshot => {
        const id = childSnapshot.key;
        const person = childSnapshot.val();
        matchedPeople.push({ id, ...person });
      });

      return matchedPeople.length >= 1 ? matchedPeople[0] : null;
    });
}

function createPerson(name) {
  return peopleRef.push({ name, inCommingPerson: null, inCallingPerson: null }).key;
}

function onPersonAdded(callback = () => null) {
  return peopleRef.on('child_added', snapshot =>
    callback({ id: snapshot.key, name: snapshot.val().name }),
  );
}

function startOffer({ callerID, calleeID }, callback) {
  const ref = firebase.database().ref(`people/${calleeID}/offer`);

  // Set value of the offer
  ref.set({ callerID, isAnswer: false });

  // Create off function, let use to close the reference
  function off() {
    ref.off();
  }

  function cancleCalling() {
    ref.remove();
    off();
  }

  function updateRoomID(roomID) {
    ref.update({ roomID });
  }

  ref.on('value', snapshot => {
    const offer = snapshot.val();
    if (offer) {
      callback({ ...offer, updateRoomID }, off);
      return;
    }
    callback(null, off);
  });

  return cancleCalling;
}

function listeningOffer(id, callback) {
  const ref = firebase.database().ref(`people/${id}/offer`);

  function cancle() {
    ref.remove();
  }

  ref.on('value', snapshot => {
    const offer = snapshot.val();
    if (offer) {
      function answer() {
        ref.update({ isAnswer: true });
      }

      callback({ ...offer, cancle, answer });
      return;
    }
    callback(null);
  });
}

export { getPerson, createPerson, onPersonAdded, startOffer, listeningOffer };
