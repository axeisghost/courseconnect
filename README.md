# courseconnect

## Junior Design Project

### How do I get started?

#### Run server

We use Express.js for our server. Express.js is a particular framework for Node.js, which provides a robust set of features for web and mobile applications.

To run our server in Express.js, you will need to do the following:

1. Install [Node.js](https://nodejs.org/download/).
2. Install [Express.js](http://expressjs.com/starter/installing.html).
3. Install NodeMonitor, which will retart the server whenever it detects a change of related files.
You can install the NodeMonitor by typing: `npm install node-monitor` in your terminal. You don't need to worry about npm, because it came with Node.js.
4. If you don't have git, please intall [git](http://git-scm.com/downloads). Clone this repository by typing `git clone https://github.com/cffls/courseconnect.git`, type `nodemon ./courseconnectserr/bin/www`. The server should start running.


#### Run a client page

Navigate to `./webapp`, open `json.html` in a browser, you should see a calendar, and the agenda sent from the server.

