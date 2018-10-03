(function () {

  /* Initialize firebase */
  let config = {
    apiKey: "AIzaSyBlFJVRhkxDSUCRCZatc_d9mbShWfr9Xug", databaseURL: "https://wot-1819-85183.firebaseio.com",
  }
  firebase.initializeApp(config);

  /* Global variables */
  const sign_up = document.getElementById('sign-up');
  const sign_in = document.getElementById('sign-in');
  const sign_out = document.getElementById('sign-out');
  const reset = document.getElementById('reset');
  const email = document.getElementById('email');
  const grid = document.querySelector('.grid__wrapper');
  const password = document.getElementById('password');


  function clearGrid() {
    while (grid.firstChild) {
      grid.removeChild(grid.firstChild);
    }
  }

  function drawElements(array) {
    clearGrid();
    let index = 0;
    array.forEach((letter) => {
      const new_elem = document.createElement('div');
      if (letter === 'dy') { new_elem.classList.add('grid__color--dy'); new_elem.setAttribute('data-val', 'dy'); }
      if (letter === 'ly') { new_elem.classList.add('grid__color--ly'); new_elem.setAttribute('data-val', 'ly'); }
      if (letter === 'db') { new_elem.classList.add('grid__color--db'); new_elem.setAttribute('data-val', 'db'); }
      if (letter === 'lb') { new_elem.classList.add('grid__color--lb'); new_elem.setAttribute('data-val', 'lb'); }
      if (letter === 'dg') { new_elem.classList.add('grid__color--dg'); new_elem.setAttribute('data-val', 'dg'); }
      if (letter === 'lg') { new_elem.classList.add('grid__color--lg'); new_elem.setAttribute('data-val', 'lg'); }
      if (letter === 'dr') { new_elem.classList.add('grid__color--dr'); new_elem.setAttribute('data-val', 'dr'); }
      if (letter === 'lr') { new_elem.classList.add('grid__color--lr'); new_elem.setAttribute('data-val', 'lr'); }
      if (letter === 'e') { new_elem.classList.add('grid__color--e'); new_elem.setAttribute('data-val', 'e') }
      new_elem.setAttribute('data-id', index);
      new_elem.classList.add('grid__item');
      new_elem.addEventListener('click', () => {
        let pattern = GetGridAsArray();
        let dv = new_elem.getAttribute('data-val');
        const di = parseInt(new_elem.getAttribute('data-id'));
        let backDoorArr = [47, 55, 63];
        let frontDoorArr = [40, 48, 56];
        let pv = '';
        if (dv.substring(0, 1) === 'd') {
          pv = 'l'
        } else if (dv.substring(0, 1) === 'l') {
          pv = 'd'
        } else {
          pv = 'e'
        }
        if (di === 47 || di === 55 || di === 63) {
          backDoorArr.forEach((id) => {
            pattern[id] = pv + dv.substring(1, 2);
          });
        } else if (di === 40 || di === 48 || di === 56) {
          frontDoorArr.forEach((id) => {
            pattern[id] = pv + dv.substring(1, 2);
          })
        } else {
          pattern[parseInt(new_elem.getAttribute('data-id'))] = pv + dv.substring(1, 2);
        }
        console.log(pattern);
        PushToFirebase(pattern);
      });
      grid.appendChild(new_elem);
      index++;
    });
  }

  function PushToFirebase(pattern) {
    const user = firebase.auth().currentUser;
    if (user) {
      const ref = firebase.database().ref(`domotica/${user.uid}`);
      const promise = ref.set(pattern);
      promise.then(e => {
        console.log('Succesfully inserted data');
      });
      promise.catch(e => {
        console.log('An error occured: ' + e.message);
      });
    } else {
      console.log('Je zit niet ingelogd.');
    }
  }

  function GetGridAsArray() {
    const grid_items = document.querySelectorAll('.grid__item');
    let pattern = [];
    grid_items.forEach((item) => {
      pattern.push(item.getAttribute('data-val'));
    });
    return pattern;
  }

  function ResetAll() {
    let arr = ["e", "e", "dy", "e", "e", "dy", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "e", "db", "e", "e", "e", "e", "e", "e", "db", "e", "e", "dy", "e", "e", "dy", "e", "e", "dg", "e", "e", "e", "e", "e", "e", "dr", "dg", "e", "e", "e", "e", "e", "e", "dr", "dg", "e", "e", "db", "db", "e", "e", "dr"];
    PushToFirebase(arr);
  }

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log('Logged in!');
      firebase.database().ref(`domotica/${user.uid}`).on('value', (snapshot) => {
        drawElements(snapshot.val());
      });
    } else {
      console.log('Not logged in!');
    }
  });

  function SignUp(email, password) {
    firebase.auth().createUserWithEmailAndPassword(email, password).then(() => {
      console.log('Successully signed up.');
      ResetAll();
    }).catch((error) => {
      console.log(error);
    });
  }

  function SignIn(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
      console.log('Successfully logged in.')
    }).catch((error) => {
      console.log(error);
    });
  }

  function SignOut() {
    firebase.auth().signOut().then(() => {
      console.log('Succesfully signed out.');
    }).catch((error) => {
      console.log(error);
    });
  }

  sign_in.addEventListener('click', (e) => {
    e.preventDefault();
    SignIn(email.value, password.value);
  });

  sign_up.addEventListener('click', (e) => {
    e.preventDefault();
    SignUp(email.value, password.value);
  });

  sign_out.addEventListener('click', (e) => {
    e.preventDefault();
    SignOut();
  });

  reset.addEventListener('click', (e) => {
    e.preventDefault();
    ResetAll();
  })

}());