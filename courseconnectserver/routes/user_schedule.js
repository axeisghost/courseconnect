var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send([
				{
					title: 'temporary test',
					start: '2015-09-01T11:00:00',
					end:'2015-09-01T13:00:00',
					backgroundColor:'rgb(0,255,0)',
					borderColor:'rgb(255,255,255)',
					dow:[3]
				}
			]);
});

module.exports = router;
