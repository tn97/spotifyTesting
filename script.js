var spotify_CLIENT = "31ad0b6fdc1c4b9bad8f0b5fa7836d06";

var stateKey = 'spotify_auth_state';

// initiate spotify
var spotifyApi = new SpotifyWebApi();

var ajaxResponse;

/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */
// NO NEED TO WORRY ABOUT THIS
function getHashParams() {
  var hashParams = {};
  var e,
    r = /([^&;=]+)=?([^&;]*)/g,
    q = window
      .location
      .hash
      .substring(1);
  while (e = r.exec(q)) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
// NO NEED TO WORRY ABOUT THIS
function generateRandomString(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// on load, try to pull access_token from URL parameters
// localhost:8000?access_token=[token]&state=[state]
var params = getHashParams();
console.log(params);

// save access_token, state, and stored state into variables
var access_token = params.access_token,
  state = params.state,
  storedState = localStorage.getItem(stateKey);

// if there's an access_token and state is either null OR doesn't equal stored
// state, then let user know there's an issue with authentication
if (access_token && (state == null || state !== storedState)) {
  console.log("You need to login.");
} else {

  // set access token to spotify api wrapper
  spotifyApi.setAccessToken(access_token);

  spotifyApi.getUserPlaylists()
  // does not require anything inside the parenthesis.
  .then(function(data) {
    console.log('User playlists', data);
  }, function(err) {
    console.error(err);
  });

  // if authentication is successful, remove item from localStorage
  localStorage.removeItem(stateKey);
  // if there's an access token, get user information
  if (access_token) {
    $
      .ajax({
        url: 'https://api.spotify.com/v1/me',
        headers: {
          'Authorization': 'Bearer ' + access_token
        }
      })
      .then(function (response) {
        console.log(response);
        console.log("this is the 'response' to the ajax request.")
        $("#login-button").hide();
        ajaxResponse = response;
      });
  }
}

// login button to get access token
$('#login-button')
  .on('click', function () {

    var client_id = spotify_CLIENT; // Your client id
    var redirect_uri = 'https://tn97.github.io/spotifyTesting/'; // Your redirect uri

    // generate random state key
    var state = generateRandomString(16);

    // set state in localStorage (will read when we get it back)
    localStorage.setItem(stateKey, state);
    // Set scope for authentication privileges
    var scope = 'streaming user-read-birthdate user-read-private user-read-email user-read-playba' +
        'ck-state user-modify-playback-state';

    // build out super long url
    var url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(client_id);
    url += '&scope=' + encodeURIComponent(scope);
    url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
    url += '&state=' + encodeURIComponent(state);

    // change pages and go to the spotify login page
    window.location = url;
  });

