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
        const childData = childSnapshot.val();
        matchedPeople.push(childData);
      });

      return matchedPeople.length >= 1 ? matchedPeople[0] : null;
    });
}

function createPerson(name) {
  return peopleRef.push({ name, inCommingPerson: null, inCallingPerson: null });
}

function subPeople(callback = () => null) {
  return peopleRef.on('child_added').then(snapshot => callback(snapshot.val()));
}

export { getPerson, createPerson, subPeople };
