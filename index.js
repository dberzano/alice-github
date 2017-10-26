// Web application which authenticates to github
var http = require('http')
    url  = require('url');

function nocache(d) {
  var resp = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  };
  for (k in d) {
    resp[k] = d[k];
  }
  return resp;
}

// Web server
http.createServer(function (req, res) {
  uri = url.parse(req.url);
  if (uri.pathname == "/health") {
    res.writeHead(200, nocache({"Content-Type": "text/plain"}));
    res.end("ok");
  }
  else if (uri.pathname == "/check") {
    res.writeHead(200, nocache({"Content-Type": "text/html"}));

    var user = req.headers["adfs_login"];
    var name = req.headers["adfs_fullname"];
    var groups = req.headers["adfs_group"];
    groups = (groups === undefined) ? [] : groups.split(";");

    if (user !== undefined && name !== undefined && groups.indexOf("alice-member") >= 0) {
      content = "<p>Dear " + name + ", your CERN username is <tt>" + user + "</tt> " +
                "and you have been identified as a legitimate ALICE user!</p>";
    }
    else {
      content = "<p>You have not been identified as a legitimate ALICE user. Please contact " +
                "<tt>alice-analysis-tutorial-committee@cern.ch</tt> for support.</p>";
    }

    var txt = "<!doctype html>"                            +
              "<html lang=\"en\">"                         +
              "<head>"                                     +
              "<meta charset=\"utf-8\">"                   +
              "<title>The HTML5 Herald</title>"            +
              "<style>"                                    +
              "body { font: 10pt helvetica, sans-serif; }" +
              "</style>"                                   +
              "</head>"                                    +
              "<body>"                                     +
              "<h1>Hi!</h1>"                               +
              content                                      +
              "</body>"                                    +
              "</html>";
    res.end(txt);
  }
  else {
    res.writeHead(404, nocache({"Content-Type": "text/plain"}));
    res.end("Sorry, path not found.");
  }
}).listen(8888);

console.log("Server started on 8888");
