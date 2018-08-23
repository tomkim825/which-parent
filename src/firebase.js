import firebase from 'firebase/app';
import 'firebase/storage';

const config = {
    apiKey: "AIzaSyAfMomQhiipmtHYBc-5Odytsgz47CAS9q0",
    authDomain: "mom-or-dad.firebaseapp.com",
    databaseURL: "https://mom-or-dad.firebaseio.com",
    projectId: "mom-or-dad",
    storageBucket: "mom-or-dad.appspot.com",
    messagingSenderId: "346751856796"
};
firebase.initializeApp(config);
export default firebase;