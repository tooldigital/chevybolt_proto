const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const https = require('https');
const _ = require('lodash');

const LGRequest = function(base64, HOST_NAME) {
	return new Promise((resolve, reject) => {
		var rootDir = __dirname + '/tmp/';
		if (!fs.existsSync(rootDir)){
		    fs.mkdirSync(rootDir);
		}

		base64 = base64.replace('data:image/jpeg;base64,', '');
		base64 = base64.replace('data:image/png;base64,', '');
		var fileName = 'tmp' + new Date().getTime() + '.jpg';
		var tmpPath = rootDir + fileName;
		// var webPath = 'http://' + HOST_NAME + '/tmp/' + fileName;
		var webPath = 'http://' + HOST_NAME + "/" + fileName;

		function saveTempImage() {
			fs.writeFile(tmpPath, new Buffer(base64, "base64"), sendRequest);
		}
		saveTempImage();

		function sendRequest(err) {

			if(err){
				reject(err)
				return
			}
			var developerKey = 'a69a23fdde680d7ea30d20c92068331ebbbcc4d6';
			var imageUrl = webPath;
		  	var post_data = querystring.stringify({
				'developerKey' : developerKey,
				'imageUrl': imageUrl
			});
			var post_options = {
		    	host: 'www.logograb.com',
		    	path: '/api/v2/detectLogos.json?developerKey='+developerKey+'&imageUrl='+imageUrl,
		    	method: 'GET',
		    	headers: {
		    	    'Content-Type': 'application/x-www-form-urlencoded',
		    	    'Content-Length': Buffer.byteLength(post_data)
		    	}
			};

			var response = "";

			var post_req = https.request(post_options, function(res) {
				res.setEncoding('utf8');
				res.on('data', function (chunk) {
				    response += chunk;
				});
				res.on('end', function() {
					console.log(response)
					try {
			      		var resp = JSON.parse(response);
			      		// console.log(resp)
			      		if(resp.data) {
		      				console.log('=========> LOGOGRAB RESPONSE', resp.data.detections)
				      		console.log('');console.log('');console.log('');console.log('');

				      		var tmp = [];
				      		resp.data.detections.forEach(function(item) {
				      			if( item.validated === 1 ) {
				      				tmp.push(item);
				      			}
				      		})
				      		var high = 0;
				      		var hIDX = null;
				      		tmp.forEach(function(item, idx) {
				      			if(item.validationFlags[0]>high) {
				      				high = item.validationFlags[0];
				      				hIDX = idx;
				      			}
				      		})
				      		firstDetection = tmp[hIDX];
			      			if(firstDetection) {
			      				var retArr = [];

					      			retArr = firstDetection;
					      		resolve(retArr);
					      	} else {
					      		resolve([]);
					      	}
					    } else {
			      			resolve([]);
		      			}
					} catch(e) {
						resolve([])
					}
		      		
				})
			});
			// http.request(options, callback).end();
			post_req.write(post_data);
			post_req.end();

		}


	}).catch(function(err) {
		console.error('promise error', err.message)
		reject(err)
	})

}


module.exports = LGRequest;