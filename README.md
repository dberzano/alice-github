This is a simple web application to be used to Map SSO users to their
Github counterparts.

Authentication flow at:

https://developer.github.com/v3/oauth/#web-application-flow

# Deploying

In order to deploy this you need to first [register an application in
Github](https://github.com/settings/applications/new). As authorization
callback you need to specify the URL where this application will appear, e.g.:

    https://mydomain.com/auth

Once you have done this you need to define the following environment variables:

- GITHUB_CLIENT_ID: the client ID given by Github for your application.
- GITHUB_SECRET: the secret provided by Github for your application.
- GITHUB_API: the endpoint for github API. Most likely `htts://github.com/api/v3`.

