# Course Connect

## Junior Design Project

###Intro

We use Express.js for our server. Express.js is a particular framework for Node.js, which provides a robust set of features for web and mobile applications.

For front end, we use Angular.js, a powerful framwork using [MVC](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) and [MVVM](https://en.wikipedia.org/wiki/Model_View_ViewModel) architectures that simplify our front end code and save us tremendous amount of time in development and testing.

### How do I get started?

#### Useful tutorials:
[Angular js Developer Guide](https://docs.angularjs.org/guide/introduction)

#### Run server

To run our server in Express.js, you will need to do the followings:

1. Install [Node.js](https://nodejs.org/download/).
2. Install NodeMonitor, which will restart the server whenever it detects a change of related files.
You can install the NodeMonitor by typing: `npm install -g nodemon` in your terminal. You don't need to worry about npm, because it came with Node.js.
3. If you don't have git, please intall [git](http://git-scm.com/downloads). Clone this repository by typing `git clone https://github.com/cffls/courseconnect.git`. After you cloned this repo, type `nodemon ./bin/www`. The server should start running.
4. Open a browser, type the following url: `http://localhost:3000/`. You should see a calendar.