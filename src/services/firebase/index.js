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

const dbRef = firebase.database().ref('web');

const yourId = Math.floor(Math.random() * 1000000000);

const sendMessage = data => {
  console.debug('sendMessage', data);
  // firebase
  //   .database()
  //   .ref('web')
  //   .set({
  //     data,
  //   });
  dbRef.set({ sender: yourId, message: JSON.stringify(data) });
};
export { sendMessage };
// //export default dbRef;

// export { sendMessage, yourId };
