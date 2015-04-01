

$(document).ready( function () {
	
	$('select').change( function () {
		calculateSchedule();
	});
	
	$('#daily').timepicker({
		onClose: function (timeText, inst) {
			if (timeText == ''){
				timeText = '00:00';
				$('#daily').val(timeText);
			}
			
			var fields = timeText.split(':');
			$('div.planChoice select option:checked').attr('selected',false);
			
			$('select[name=hours] option[value='+parseInt(fields[0])+']').attr('selected',true);
			$('select[name=minutes] option[value='+parseInt(fields[1])+']').attr('selected',true);
			$('select[name=seconds] option[value=0]').attr('selected',true);
			
			calculateSchedule();
		}
	});
	
	$('#tabs').tabs();
	updateTabParameters();
	setParameter();
	
	if($('#daily').val() == '' && $('input[name=schedule]').val() != '')
		$('.selectMode[data-group=when] .selectModeOff').click();
});


$(document).ready( function () {
	$('div.selectMode span').each( function () {
		var group = $(this).parent('div.selectMode').data('group');
		var value = $(this).text();
		
		$(this).find('input[type=checkbox]').remove();
		$(this).append('<input type="checkbox" name="'+group+'SelectMode" value="'+value+'" style="display: none;" />');
		
		$(this).find('input[type=checkbox]').attr('checked', !$(this).hasClass('selectModeOff'));
	})
});

$(document).delegate('div.selectMode span.selectModeOff', 'click', function () {
	var group = $(this).parent('div.selectMode').data('group');
	$(this).add($(this).siblings('span')).toggleClass('selectModeOff').each( function () {
		$(this).find('input[type=checkbox]').attr('checked', !$(this).hasClass('selectModeOff'));
	});
	$('div.planChoice[data-group='+group+']').toggle('fast');
});


function calculateSchedule() {
	var schedule = [];
	$.each( ['seconds', 'minutes', 'hours', 'days', 'months', 'weekdays'], function () {
		schedule.push( $('select[name='+this+'] option:checked').map(function(){return $(this).val();}).toArray().join(',') );
	});
	
	$('input[name=schedule]').val(schedule.join(';'));
	$('p#scheduleInEnglish').html(getScheduleToEnglish());
}

$(document).ready( function () {
	$('p#scheduleInEnglish').html(getScheduleToEnglish());
});



$(document).on('change', '#formWorkflowSchedule select[name=workflow_id_select]', function() {
	updateTabParameters();
});

function updateTabParameters(){
	var workflow_id = $('#formWorkflowSchedule [name=workflow_id_select]').val();
	$( "#formWorkflowSchedule #paramsTab #paramsTabForm" ).html('');
	$('#schedule_workflow_parameter_'+workflow_id).clone().appendTo( "#formWorkflowSchedule #paramsTab #paramsTabForm" );
}

function setParameter(){
	$("#paramsTab input[name=schedule_parameters]").val($('#paramsTabForm input[type=text]').serialize());
}


jQuery.fn.toArrayNoStar = function(modifier) {
	var element = $(this[0]);
	var options = element.find('option:checked');
	options = options.map(function(){return parseInt($(this).attr('value'));}).toArray().filter(function(val){return !isNaN(val)});
	if (modifier)
		options = $.map(options,modifier);
	return options;
}


function getScheduleToEnglish () {
	
	var seconds = $('select[name=seconds]').toArrayNoStar();
	var minutes = $('select[name=minutes]').toArrayNoStar();
	var hours = $('select[name=hours]').toArrayNoStar();
	var daysOfMonth = $('select[name=days]').toArrayNoStar( function (val) { return val+1; } );
	var months = $('select[name=months]').toArrayNoStar();
	var weekdays = $('select[name=weekdays]').toArrayNoStar();
	return scheduleToEnglish(seconds, minutes, hours, daysOfMonth, months, weekdays);
}

function scheduleToEnglish (seconds, minutes, hours, daysOfMonth, months, weekdays) {
	
	// hours
	var timeString = '';
	if (hours.length == 0 && minutes.length == 0 && seconds.length == 0) {
		timeString = 'every second!';
	} else {
		
		if (hours.length == 0) hours = ['**'];
		if (minutes.length == 0) minutes = ['**'];
		if (seconds.length == 0) seconds = ['**'];
		
		var times = [];
		for (var h=0; h<hours.length; h++) {
			for (var m=0; m<minutes.length; m++) {
				for (var s=0; s<seconds.length; s++) {
					times.push(
						tiMe(hours[h])
						+ ':' +
						tiMe(minutes[m])
						+
						(seconds[s] ? ':'+tiMe(seconds[s]) : '')
					);
				}
			}
		}
		timeString = commaAnd(times);
	}
	
	// days of month
	var daysOfMonthString = '';
	if (daysOfMonth.length > 0) {
		daysOfMonth = $.map(daysOfMonth, function (day) { return suffixMe(day); });
		daysOfMonthString += 'Every ' + commaAnd(daysOfMonth);
	} else {
		daysOfMonthString += 'Every day';
	}
	
	// months
	var monthsString = '';
	if (months.length > 0) {
		months = $.map(months, function (month) {
			return monthMe(month);
		});
		monthsString = commaAnd(months);
	} else {
		monthsString = daysOfMonth.length > 0 ? 'every month' : '';
	}
	
	// weekdays
	var weekdaysString = '';
	if (weekdays.length > 0)
		weekdaysString = ' (but only '+commaAnd($.map(weekdays,weekMe))+')';
	
	return daysOfMonthString + (monthsString ? ' of ' : '') + monthsString + (weekdaysString) + ' at ' + timeString;
}

function commaAnd (arr) {
	var allButLast = arr.slice(0,arr.length-1);
	return allButLast.join(', ') + (allButLast.length > 0 ? ' and ' : '') + arr[arr.length-1];
}

function suffixMe (number) {
	number = number.toString();
	
	switch (number % 10) {
		case 1:
			return number+'st';
		case 2:
			return number+'nd';
		case 3:
			return number+'rd';
		default:
			return number+'th';
	}
}

function monthMe (month) {
	return ['January','February','March','April','May','June','July','August','September','October','November','December'][month];
}

function tiMe (time) {
	if (time == '**') return '**';
	return time < 10 ? '0' + time : time;
}

function weekMe (day) {
	return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][day] + 's';
}