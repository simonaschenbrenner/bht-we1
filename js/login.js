/* 
 * Web Engineering WS 20/21
 * Semsterprojekt SPA "Blogger"
 * Gruppe 12
 * Simon Nunez Aschenbrenner (908606)
 * 
 * Übernommen von Prof. Dr. Simone Strippgen
 */

"use strict";

(function () {

    var GoogleAuth;
    var SCOPE = 'https://www.googleapis.com/auth/blogger';

    function handleClientLoad() {

        // Load the API's client and auth2 modules.
        // Call the initClient function after the modules load.
        gapi.load('client:auth2', initClient);
    }

    function initClient() {

        // Retrieve the discovery document for version 3 of Google Drive API.
        // In practice, your app can retrieve one or more discovery documents.
        var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/blogger/v3/rest';

        // Initialize the gapi.client object, which app uses to make API requests.
        // Get API key and client ID from API Console.
        // 'scope' field specifies space-delimited list of access scopes.
        gapi.client.init({

            'discoveryDocs': [discoveryUrl],
            'clientId': 'google_api_client_id',  // TODO
            'scope': SCOPE

        }).then(function () {

            GoogleAuth = gapi.auth2.getAuthInstance();

            // Listen for sign-in state changes.
            GoogleAuth.isSignedIn.listen(updateSigninStatus);

            // Handle initial sign-in state. (Determine if user is already signed in.)
            var user = GoogleAuth.currentUser.get();
            setSigninStatus();

            // Call handleAuthClick function when user clicks on "Sign In/Authorize" button.
            $('#sign-in-or-out-button').click(function () {
                handleAuthClick();
            });
        });
    }

    function handleAuthClick() {

        if (GoogleAuth.isSignedIn.get()) {
            // User is authorized and has clicked 'Sign out' button.
            GoogleAuth.signOut();
        } else {
            // User is not signed in. Start Google auth flow.
            GoogleAuth.signIn();
        }
    }

    function setSigninStatus(isSignedIn) {
        var user = GoogleAuth.currentUser.get();
        var isAuthorized = user.hasGrantedScopes(SCOPE);

        if (isAuthorized) {
            console.log(`login.setSigninStatus(${isAuthorized})`);
            $('#sign-in-or-out-button').html('Abmelden');
            $('#auth-status').html('Angemeldet bei Google');
            model.setLoggedIn(true);
            router.navigateToPage(window.location.pathname);
        } else {
            console.log(`login.setSigninStatus(${isAuthorized})`);
            $('#sign-in-or-out-button').html('Anmelden');
            $('#auth-status').html('Abgemeldet bei Google'); 
            model.setLoggedIn(false);
            router.navigateToPage('/'); 
        }
    }

    function updateSigninStatus(isSignedIn) {
        setSigninStatus();
    }
    
    // After Loading, handleClientLoad is called
    window.addEventListener("load", handleClientLoad);

})();
