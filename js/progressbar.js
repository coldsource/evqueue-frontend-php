$(document).ready(function() {
	
	$('body').find('div.progressBar').each(function(){
		
		var maxVal = parseInt($(this).attr("maxval"));
		var actualVal = parseInt($(this).attr("actualval"));
		
		if (actualVal > maxVal){
			actualVal=maxVal;
		}
		
		var percent = Math.round((actualVal * 100) / maxVal * 100)/100;
		//var progressBarWidth = percent * $(this).width() / 100;
		var progressBarWidth = percent;
		$(this).find('div').css("background-color", getcolor(percent));
		$(this).find('div').animate({
			width : progressBarWidth+"%"
		}, 500).html(percent + "%&nbsp;");
	});
	
	$('body').find('div.progressBar2').each(function(){
		
		var maxVal = parseInt($(this).attr("maxval"));
		var actualVal = parseInt($(this).attr("actualval"));
		
		if (actualVal>maxVal){
			actualVal=maxVal;
		}		
		
		var percent = Math.round((actualVal * 100) / maxVal * 100)/100;
		var progressBarWidth = percent;
		$(this).find('div').css("background-color", getcolor(percent));
		$(this).find('div').animate({
			width : progressBarWidth+"%"
		}, 500);
		
	});
	
});


function getcolor(pct) {

	if (pct == 0) {
		return '#FFFFFF';
	}

	var color1 = '#2FED72'; // green
	var color2 = '#F59547'
	var color3 = '#ED2F2F'; // red

	if (pct < 50) {
		return color1
	} else if (pct < 80) {
		return color2
	} else {
		return color3
	}

}
