var loadImage = require('blueimp-load-image');

function PhotoTaker(options) {
	
	var $btn = $(".app").find("button");
	var $input = $(".app").find("input");
	console.log($input)
	$(".take-photo").on("click", function() {
		$input.click()
	})
	$input.on("change", onImageInputChange)
	$(".close").on("click", handleClose)

	function handleClose(e) {
		$(e.currentTarget).closest(".vid").removeClass("show")
	}

	function onImageInputChange(e){
		console.log('Landing.onImageInputChange', e)
		
		var file = e.currentTarget.files[0];

		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');

		var imageWidth, 
			imageHeight, 
			imageOrientation = undefined;
		var imageLoaded = false;
		var imageMetaLoaded = false;
		var returnedImage
		// var exifInfo

		loadImage(
			file,
			(img) => {
				returnedImage = img
				imageHeight = img.height
				imageWidth = img.width
				imageLoaded = true
				if(checkFinished()) rotateAndSendImage()
			}
		)

		loadImage.parseMetaData(
			file,
			(data) => {
				console.log(data)
				if(data.exif) {
					imageOrientation = data.exif.get('Orientation')
				// } else {
					// imageOrientation = 1
				}
				// 3: 90 ccw, 6: portrait, 1: 90 cw, 8: 180
				imageMetaLoaded = true

				// exifInfo = data.exif.getAll()

				// console.log(imageOrientation)
				if(checkFinished()) rotateAndSendImage()
			}
		)

		function checkFinished() {
			return (imageLoaded && imageMetaLoaded)
		}

		function rotateAndSendImage() {

			if(
				imageOrientation === undefined ||
				imageOrientation === 3 || 
				imageOrientation === 1 || 
				imageOrientation === 0 ) 
			{
				canvas.width = imageWidth
				canvas.height = imageHeight
			} else {
				canvas.width = imageHeight
				canvas.height = imageWidth
			}

			console.log('imageOrientation', imageOrientation)
			console.log(canvas.width, canvas.height)
			

			switch(imageOrientation) {
			
				case 2:
					// horizontal flip
					ctx.translate(canvas.width, 0)
					ctx.scale(-1, 1)
					break
				case 3:
					// 180° rotate left
					ctx.translate(canvas.width, canvas.height)
					ctx.rotate(Math.PI)
					break
				case 4:
					// vertical flip
					ctx.translate(0, canvas.height)
					ctx.scale(1, -1)
					break
				case 5:
					// vertical flip + 90 rotate right
					ctx.rotate(0.5 * Math.PI)
					ctx.scale(1, -1)
					break
				case 6:
					// 90° rotate right
					ctx.rotate(0.5 * Math.PI)
					ctx.translate(0, -canvas.width )
					break
				case 7:
					// horizontal flip + 90 rotate right
					ctx.rotate(0.5 * Math.PI)
					ctx.translate(canvas.width, -canvas.height)
					ctx.scale(-1, 1)
					break
				case 8:
					// 90° rotate left
					ctx.rotate(-0.5 * Math.PI)
					ctx.translate(-canvas.height, 0)
					break
			}

			ctx.drawImage(returnedImage, 0, 0)


			var maxPixels = 3000000
			var scaleDown = 1
			if(imageHeight*imageWidth > maxPixels) {
				// FIXME: this is scaling down more than needed because it's scaling geometrically, not linearly
				scaleDown = maxPixels / ( imageHeight*imageWidth )
			}

			var resizeCanvas = document.createElement('canvas');
			resizeCanvas.width = canvas.width * scaleDown;
			resizeCanvas.height = canvas.height * scaleDown;
			resizeCanvas.getContext('2d').drawImage(canvas, 0, 0, resizeCanvas.width, resizeCanvas.height);

			var fixed = resizeCanvas.toDataURL();
			console.log("about to post image")
			$.ajax({
				type: "POST",
				data: { image: fixed },
				url: "/analyzephoto"
			})
			.done(function( obj ) {
				if(obj.name.toLowerCase && obj.name.toLowerCase === "at&t") {
					$(".video1").addClass("show");
					$(".video2").removeClass("show");
				} else {
					$(".video2").addClass("show");
					$(".video1").removeClass("show");
				}
			});


		}
	}


}

module.exports = PhotoTaker;

