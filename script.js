$(document).ready(function () {
  var spotify_CLIENT = "31ad0b6fdc1c4b9bad8f0b5fa7836d06";
  var stateKey = 'spotify_auth_state';
  var bearer_token = "BQAjrnk9wVlAyJCN1k1GdJbSlHPzAFnlkNWb93vNHxjSzumkWvmfFtuaM1itpyx6GfbmG3Z3MiUExNQ7tWiUdTZ7Qs5bPlrM9Uk6Yge8c66_LQeSmMCAJo9CeNFAe21jgkNTAXYUycknpV4fSjEfkEMa2Yrm46Q43Dd1cun5re_IOxaeXyM5lYF8fqom7wKG2rqj90N8cvPzcxOp6g";

  // initiate spotify
  var spotifyApi = new SpotifyWebApi();
  var result;
  var globaluserID = "";
  var spotifyURI = "";
  var dev_id = "";
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

    // spotifyApi.getUserPlaylists()
    // // does not require anything inside the parenthesis.
    // .then(function(data) {
    //   console.log('User playlists', data);
    // }, function(err) {
    //   console.error(err);
    // });

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
          $("#playlists").show();
          result = response;

          // Profile Picture
          var proPic = result.images[0].url;
          var imageSrc = $("<img>");
          imageSrc.attr("src", proPic)
          $("#profile-info").append(imageSrc);

          // finds the ID of the user
          var userID = result.id;
          globaluserID = userID;
        });
      // getting a list of the user's playlist
      $.ajax({
        url: "https://api.spotify.com/v1/me/playlists",
        method: "GET",
        headers: {
          'Authorization': "Bearer " + access_token
        }
      }).then(function (response) {
        result = response;
        console.log(result);
        for (var i = 0; i < result.items.length; i++) {
          var playlistItem = $("<button>").text(result.items[i].name);
          playlistItem.addClass("btn playlistBtn playlistItem");
          console.log(result.items[i].name);
          playlistItem.attr("data-value", result.items[i].id);
          console.log(result.items[i].id);
          playlistItem.appendTo($("#playlists"));
        }
      })
    }

  }


  // login button to get access token
  $('#login-button')
    .on('click', function () {

      var client_id = spotify_CLIENT; // Your client id
      var redirect_uri = 'http://localhost:8000'; // Your redirect uri

      // generate random state key
      var state = generateRandomString(16);

      // set state in localStorage (will read when we get it back)
      localStorage.setItem(stateKey, state);
      // Set scope for authentication privileges
      var scope = 'streaming user-read-birthdate user-read-private user-read-email user-read-playba' +
        'ck-state user-modify-playback-state playlist-read-private app-remote-control';

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

  $(document).on("click", ".playlistItem", function () {
    $.ajax({
      url: "https://api.spotify.com/v1/playlists/" + $(this).attr("data-value") + "/tracks",
      method: "GET",
      headers: {
        'Authorization': "Bearer " + access_token
      }
    }).then(function (response) {
      $("#tracks").show();
      result = response;
      console.log(response);
      var result = response;
      for (var i = 0; i < result.items.length; i++) {
        var trackBtn = $("<button>").text(result.items[i].track.name);
        trackBtn.addClass("btn trackBtn trackItem");
        var trackID = result.items[i].track.id;
        trackBtn.attr("data-value", trackID);
        trackBtn.attr("data-uri", result.items[i].track.uri);
        trackBtn.appendTo($("#tracks"));
      }
    })
  })

  $(document).on("click", ".trackItem", function () {
    // $.ajax({
    //   url: "https://api.spotify.com/v1/tracks/" + $(this).attr("data-value"),
    //   method: "GET",
    //   headers: {
    //     'Authorization': "Bearer " + access_token
    //   }
    // }).then(function (response) {
    //   result = response;
    //   console.log(result);
    // })
    // play track
    $.ajax({
      url: "https://api.spotify.com/v1/me/player/play?device_id=" + dev_id,
      method: "PUT",
      data: {
        "uris": [$(this).attr("data-uri")]
      },
      headers: {
        'Authorization': "Bearer " + access_token,
      }
      // headers stuff
    }).then(function (result) {
      console.log(result);
    }).catch(function(err) {
      console.log(err);
    })
  })

  window.onSpotifyWebPlaybackSDKReady = () => {
    const token = 'BQDFDkBnHcrdLfXDEASdBh79mm53LmvDSGDnhhfj4qN_Jm-yPNW8fym3I9YQwp_92VQbtUAGUYw5ov4thOX77gJrL1y1xVVHK1d9J6WXbPAtHUsEtm4etkAfz4uYMrT3WsES_LQ1RKXfif97QZGbmj6hIGr1Zr3WIkbUpc4';
    const player = new Spotify.Player({
      name: 'UtilSuit Player',
      getOAuthToken: cb => { cb(token); }
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Playback status updates
    player.addListener('player_state_changed', state => { console.log(state); });

    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      dev_id = device_id;
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    player.connect();

    // get spotify devices and find device you want
    $.ajax({
      url: "https://api.spotify.com/v1/me/player/devices",
      method: "GET",
      headers: {
        'Authorization': "Bearer " + access_token
      }
      // headers
    }).then(function (result) {
      const webPlayer = result.devices.find(player => {
        return player.name === "UtilSuite Player"
      })
      // set active player to browser
      $.ajax({
        url: "https://api.spotify.com/v1/me/player",
        method: "PUT",
        data: {
          "device_ids": [webPlayer.id],
          "play": true
        },
        // headers stuff
      }).then(function (data) {
        console.log(data)
      })
    })

  };

})

