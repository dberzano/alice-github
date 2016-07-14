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
      console.log("values> " + JSON.stringify(values,2,null));
      console.log("uri.query> " + uri.query);
      github.auth.login(values.code, function (err, token) {
        // Now we have a token. Let's create an authenticated client with it
        // and map the ADFS_LOGIN to the github username.
        client = github.client(token);
        client.get('/user', {}, function (err, status, body, headers) {
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.end(JSON.stringify(process.env, null, 2) + "\n\n" +
                  JSON.stringify(headers,     null, 2) + "\n\n" +
                  JSON.stringify(body,        null, 2) + "\n\n" +
                  JSON.stringify(Object.keys(req), null, 2) + "\n\n" +
                  JSON.stringify(req.headers, null, 2) + "\n\n" +
                  JSON.stringify(req.params,  null, 2));
        });
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
