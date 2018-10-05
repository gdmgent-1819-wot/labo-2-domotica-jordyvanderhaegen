(function () {

  /**
   * Initialize firebase
   */
  let config = {
    apiKey: "AIzaSyBlFJVRhkxDSUCRCZatc_d9mbShWfr9Xug", databaseURL: "https://wot-1819-85183.firebaseio.com",
  }
  firebase.initializeApp(config);

  /**
   * Global variables
   */
  const sign_up = document.getElementById('sign-up');
  const sign_in = document.getElementById('sign-in');
  const sign_out = document.getElementById('sign-out');
  const reset = document.getElementById('reset');
  const room_1__light_1 = document.getElementById('room_1__light_1');
  const room_2__light_1 = document.getElementById('room_2__light_1');
  const room_3__light_1 = document.getElementById('room_3__light_1');
  const room_4__light_1 = document.getElementById('room_4__light_1');
  const room_1__outlet_1 = document.getElementById('room_1__outlet_1');
  const room_2__outlet_1 = document.getElementById('room_2__outlet_1');
  const room_3__outlet_1 = document.getElementById('room_3__outlet_1');
  const room_4__outlet_1 = document.getElementById('room_4__outlet_1');
  const room_3__door_1 = document.getElementById('room_3__door_1');
  const room_4__door_1 = document.getElementById('room_4__door_1');
  const temp_hum = document.getElementById('temp_hum');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const grid = document.querySelector('.grid__wrapper');
  const auth_container = document.querySelector('.auth-container');
  const actions_container = document.querySelector('.actions-container');
  let patternArr = [];
  let temp = '';
  let hum = '';

  /**
   * Clears every child in the grid
   */
  function clearGrid() {
    while (grid.firstChild) {
      grid.removeChild(grid.firstChild);
    }
  }
  /**
   * Changes the color of an element depending on the current state.
   * @param {Number} index 
   * @returns Pattern Array
   */
  function toggleElement(index) {
    const element = patternArr[index];
    const toggleValue = (value) => {
      if (value === 255) { return 128; }
      else if (value === 128) { return 255; }
      else { return 0; }
    }
    let new_element = element.map(toggleValue);
    patternArr[index] = new_element;
    return patternArr;
  }

  /**
   * Changes the color of multiple elements depending on the current state.
   * @param {Array<Number>} index 
   */
  function toggleDoorElement(index) {
    index.forEach(element => {
      const el = patternArr[element];
      let p = el.findIndex(x => x === 255);
      if (p === 1) { el[0] = 255; el[1] = 0 }
      else if (p === 0) { el[0] = 0; el[1] = 255 }
      patternArr[element] = el;
    });
    return patternArr;
  }

  /**
   * Adds node elements to the grid.
   * Assigns the right colors retrieved from firebase.
   * @param {Array<Array<Number>>} array 
   */
  function drawElements(array) {
    clearGrid();
    let index = 0;
    array.forEach((colorArray) => {
      const new_element = document.createElement('div');
      new_element.style.backgroundColor = `rgb(${colorArray[0]},${colorArray[1]},${colorArray[2]})`;
      new_element.classList.add('grid__item');
      grid.appendChild(new_element);
    });
  }

  /**
   * Pushes the global patternArray to the current users' reference.
   * @param {Array<Array<Number>>} pattern 
   */
  function PushToFirebase(pattern) {
    const user = firebase.auth().currentUser;
    if (user) {
      const ref = firebase.database().ref(`domotica/${user.uid}/pattern`);
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

  /**
   * Resets the current status of the patternArray.
   */
  function ResetAll() {
    let patternArr = [[0, 0, 0], [0, 0, 0], [255, 255, 0], [0, 0, 0], [0, 0, 0], [255, 255, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 255], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 255], [0, 0, 0], [0, 0, 0], [255, 255, 0], [0, 0, 0], [0, 0, 0], [255, 255, 0], [0, 0, 0], [0, 0, 0], [0, 255, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [255, 0, 0], [0, 255, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [255, 0, 0], [0, 255, 0], [0, 0, 0], [0, 0, 0], [0, 0, 255], [0, 0, 255], [0, 0, 0], [0, 0, 0], [255, 0, 0],];
    PushToFirebase(patternArr);
  }

  /**
   * Loads the current pattern for the logged in user.
   */
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log('Logged in!');
      firebase.database().ref(`domotica/${user.uid}`).on('value', (snapshot) => {
        drawElements(snapshot.val().pattern);
        patternArr = snapshot.val().pattern;
        temp_hum.innerHTML = `${snapshot.val().temp}°C ${snapshot.val().hum}%`;
        actions_container.style.display = 'block';
        auth_container.style.display = 'none';
      });
    } else {
      console.log('Not logged in!');
      auth_container.style.display = 'block';
      actions_container.style.display = 'none';
      clearGrid();
    }
  });

  /**
   * Signs up a user using firebase.
   * @param {String} email 
   * @param {String} password 
   */
  function SignUp(email, password) {
    firebase.auth().createUserWithEmailAndPassword(email, password).then(() => {
      console.log('Successully signed up.');
      ResetAll();
    }).catch((error) => {
      console.log(error);
    });
  }

  /**
   * Signs in a user using firebase.
   * @param {String} email 
   * @param {*String} password 
   */
  function SignIn(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
      console.log('Successfully logged in.')
    }).catch((error) => {
      console.log(error);
    });
  }

  /**
   * Signs out the current logged in user.
   */
  function SignOut() {
    firebase.auth().signOut().then(() => {
      console.log('Succesfully signed out.');
    }).catch((error) => {
      console.log(error);
    });
  }
  /**
   * Attach all buttons to their corresponding functions.
   */

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
  });

  room_1__light_1.addEventListener('click', () => {
    PushToFirebase(toggleElement(2));
  });

  room_2__light_1.addEventListener('click', () => {
    PushToFirebase(toggleElement(5));
  });

  room_3__light_1.addEventListener('click', () => {
    PushToFirebase(toggleElement(34));
  });

  room_4__light_1.addEventListener('click', () => {
    PushToFirebase(toggleElement(37));
  });

  room_1__outlet_1.addEventListener('click', () => {
    PushToFirebase(toggleElement(24));
  });

  room_2__outlet_1.addEventListener('click', () => {
    PushToFirebase(toggleElement(31));
  });

  room_3__outlet_1.addEventListener('click', () => {
    PushToFirebase(toggleElement(59));
  });

  room_4__outlet_1.addEventListener('click', () => {
    PushToFirebase(toggleElement(60));
  });

  room_3__door_1.addEventListener('click', () => {
    PushToFirebase(toggleDoorElement([40, 48, 56]));
  });

  room_4__door_1.addEventListener('click', () => {
    PushToFirebase(toggleDoorElement([47, 55, 63]));
  });

}());

