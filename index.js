// Web application which authenticates to github
var http = require('http')
  , url = require('url')
  , qs = require('querystring')
  , github = require('octonode');

// GITHUB_CLIENT_ID and GITHUB_SECRET should be registered in Github
// GITHUB_API should be something like htts://github.com/api/v3
// WEB_URL should be https:
//  webUrl: 'https://optional-internal-github-enterprise'
// Build the authorization config and url
var auth_url = github.auth.config({
  id: process.env.GITHUB_CLIENT_ID,
  secret: process.env.GITHUB_SECRET,
  apiUrl: process.env.GITHUB_API
}).login(['user']);

// Store info to verify against CSRF
var state = auth_url.match(/&state=([0-9a-z]{32})/i);

// Web server
http.createServer(function (req, res) {
  uri = url.parse(req.url);
  // Redirect to github login
  if (uri.pathname=='/login') {
    res.writeHead(302, {'Content-Type': 'text/plain', 'Location': auth_url})
    res.end('Redirecting to ' + auth_url);
  }
  // Callback url from github login
  else if (uri.pathname=='/auth') {
    var values = qs.parse(uri.query);
    // Check against CSRF attacks
    if (!state || state[1] != values.state) {
      res.writeHead(403, {'Content-Type': 'text/plain'});
      res.end('');
    } else {
      github.auth.login(values.code, function (err, token) {
        // Now we have a token. Let's create an authenticated client with it
        // and map the ADFS_LOGIN to the github username.
        client = github.client(token);
        var info = client.get('/user');
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(info);
      });
    }
  }
  else if (uri.pathname == "/pull-request-hook") {
    // Pull request hook should push PR for later
    // processing.
  }
  else if (uri.pathname == "/health") {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('{"status": "ok"}');
  } else {
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end('');
  }
}).listen(8888);

console.log('Server started on 8888');
