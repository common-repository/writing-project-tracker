(function ( $ )  {
	var newLogItem = true;
	var clickedRowID = 0;

	var wptConstants = {
	  LOG_POST_ID : 'logPostId',
	  LOG_START_DATE: 'wtpjtr_log_start_date',
	  LOG_END_DATE: 'wtpjtr_log_end_date',
	  LOG_WORD_COUNT: 'wtpjtr_log_word_count',
	  LOG_NOTES: 'wtpjtr_log_notes',
	}



	jQuery(function () {
	   var bindDatePicker = function() {
			jQuery('.date').datetimepicker({
				 format : 'yyyy-mm-dd hh:ii',
			});
		}
	   bindDatePicker();
	 });
	jQuery(document).ready(function($){
		$('.my-color-field').wpColorPicker();
	});

	function wtpjtr_clearEditFields()
	{
		jQuery('.edit-control-group').find('input').each(function (){
			jQuery(this).val('');
		});
	}



	 function wtpjtr_buildLogTable(rowResults)
	 {
		if (rowResults != false)
			var rowString = '';
			jQuery('.log-table tr').remove();
			jQuery(rowResults).each(function (index, value) {
				rowString = '<tr class="wt-log-row" data-logid="' + value[wptConstants.LOG_POST_ID] + '">';
				rowString += '<td class="openEditFields" data-metakey="startdate">' + value[wptConstants.LOG_START_DATE] + '</td>';
				rowString += '<td class="openEditFields" data-metakey="enddate">' + value[wptConstants.LOG_END_DATE] + '</td>';
				rowString += '<td class="openEditFields" data-metakey="wordCount">' + value[wptConstants.LOG_WORD_COUNT] + '</td>';
				rowString += '<td class="openEditFields" data-metakey="notes">' + value[wptConstants.LOG_NOTES] + '</td>';
				rowString += '<td class="deleteLogRow" data-metakey="delete"><a href="#" class="btn"><span class="glyphicon glyphicon-trash"></span></a></td>';
				rowString += '</tr>';
				jQuery('.log-table').append(rowString);
			});
		}

		function wtpjtr_isLastDate(currentLastDate, date)
		{
			if (currentLastDate < date)
				return true;

			return false;
		}

		function wtpjtr_isStartDate(currentStartDate, date)
		{
			if (currentStartDate > date)
				return true;

			return false;
		}

	 function wtpjtr_buildStats(rowResults)
	 {
		 var estimatedWordCount = jQuery("#selectWTPProject").data('estWordCount');
		 var estimatedCompDate = jQuery("#selectWTPProject").data('estCompDate');

		if (rowResults != null)
		{
			var rowResultsCount = jQuery(rowResults).length;
			var totalWordCount = 0;
			var totalSessions = 0;
			var totalHours = 0;
			var lastDate;
			var startDate;
			var avgWordsPerHour = 0;
			var avgWordsPerSession = 0;
			var avgHoursPerSession = 0;
			var avgWordsPerDay = 0;
			var avgHoursPerDay = 0;
			var estRemainingHours = 0;
			var estRemainingDays = 0;
			var estWordCount = 0;
			var estTargetDate;
			var status = '';
			var dd;
			var mm;
			var y;
			var formattedCompDate;
			var formattedTargetDate;
			var formattedCompDateString;
			var formattedTargetDateString;
			var currentLastDate;
			var currentStartDate;
			//wt-logger-stats

			jQuery(rowResults).each(function(index, value) {
				if (value[wptConstants.LOG_WORD_COUNT] != '')
				 totalWordCount += parseInt(value[wptConstants.LOG_WORD_COUNT]);

				if (index == 0){
				 currentLastDate = lastDate = new Date(value[wptConstants.LOG_END_DATE]);
				 currentStartDate = startDate = new Date(value[wptConstants.LOG_START_DATE]);
			 }
				else {
					lastDate =  new Date(value[wptConstants.LOG_END_DATE]);
					startDate = new Date(value[wptConstants.LOG_START_DATE]);
				}

				 if (wtpjtr_isLastDate(currentLastDate, lastDate))
				 	currentLastDate = lastDate;

				if (wtpjtr_isStartDate(currentStartDate, startDate))
					currentStartDate = startDate;

				totalHours += Date.parse(value[wptConstants.LOG_END_DATE]) - Date.parse(value[wptConstants.LOG_START_DATE]);
			});

			totalHours = totalHours / 3600000;
			totalSessions = rowResultsCount;
			avgWordsPerHour = totalWordCount / totalHours.toFixed(2);
			avgHoursPerSession = totalHours / totalSessions;
			avgWordsPerSession = totalWordCount / totalSessions;
			var daysSinceStart = (Date.parse(currentLastDate) - Date.parse(currentStartDate))/3600000/24;

			daysSinceStart = daysSinceStart < 1 ? 1 : daysSinceStart;
			avgWordsPerDay = totalWordCount / daysSinceStart
			avgHoursPerDay = totalHours / daysSinceStart;

			var selectedOption = jQuery("#selectWTPProject option:selected");
			var estimatedWordCount = jQuery(selectedOption).data('estwordcount');
			estRemainingWords = estimatedWordCount - totalWordCount;
			estRemainingHours = estRemainingWords / avgWordsPerHour;
			estRemainingSessions = estRemainingHours / avgHoursPerSession;
			estRemainingDays = estRemainingWords / avgWordsPerDay;


			var estCompDateString = jQuery(selectedOption).data('estcompdate').split('-');
			dd = estCompDateString[2];
			mm = estCompDateString[1];
			y = estCompDateString[0]
			var formattedEstCompDate = mm + '/'+ dd + '/'+ y;
			var estCompDate = new Date(formattedEstCompDate);  //date author estimated
			formattedTargetDateString = jQuery.now();
			formattedTargetDate = new Date(formattedTargetDateString);

			if (estRemainingDays > 0)
			{
				formattedTargetDate.setDate(formattedTargetDate.getDate() + estRemainingDays);
				dd = formattedTargetDate.getDate();
				mm = formattedTargetDate.getMonth() + 1;
				y = formattedTargetDate.getFullYear();

				formattedTargetDateString = mm + '/'+ dd + '/'+ y;
			}

			jQuery('.status-label').removeClass('red-color').removeClass('green-color').removeClass('blue-color');
			if (new Date(formattedTargetDate) > new Date(estCompDate))
			{
				status = 'Behind Schedule';
				jQuery('.status-label').addClass('red-color');
			}
			else if (new Date(formattedTargetDate) < new Date(estCompDate)){
				status = 'Ahead Of Schedule';
				jQuery('.status-label').addClass('green-color');
			}
			else{
				status = 'Right On Schedule';
				jQuery('.status-label').addClass('blue-color');
			}

			jQuery('.status-label').text('Status: ' + status );
			jQuery('.total-word-count-label').text('Total Word Count: ' + totalWordCount.toString());
			jQuery('.total-sessions-label').text('Total Sessions: ' + totalSessions.toString());
			jQuery('.start-date-label').text('Date Started: ' + wtpjtr_formatDate(currentStartDate));
			jQuery('.last-date-label').text('Date Last Worked: ' + wtpjtr_formatDate(currentLastDate));
			jQuery('.words-per-hour-label').text('Words Per Hour: ' + avgWordsPerHour.toFixed(2).toString());
			jQuery('.words-per-session-label').text('Avg. Words (Session): ' + avgWordsPerSession.toFixed(2).toString());
			jQuery('.words-per-day-label').text('Avg Words (Day): ' + avgWordsPerDay.toFixed(2).toString());
			jQuery('.hours-per-session-label').text('Hours Per Session: ' + avgHoursPerSession.toFixed(2).toString());
			jQuery('.hours-per-day-label').text('Hours Per Day (24 hours): ' + avgHoursPerDay.toFixed(2).toString());
			jQuery('.remaining-hours-label').text('Est Remaining Hours: ' + estRemainingHours.toFixed(2).toString());
			jQuery('.remaining-sessions-label').text('Est Remaining Sessions: ' + estRemainingSessions.toFixed(2).toString());
			jQuery('.est-target-date-label').text('Est Completion: ' + formattedEstCompDate);
			jQuery('.est-total-word-count-label').text('Est Words: ' + estimatedWordCount );
			jQuery('.est-comp-date-label').text('Est Completion Date: ' + formattedTargetDateString );
		}
		else
		{
			jQuery('.status-label').text('Status: ' + '' );
			jQuery('.total-word-count-label').text('Total Word Count: ' + '');
			jQuery('.total-sessions-label').text('Total Sessions: ' + '');
			jQuery('.start-date-label').text('Date Started: ' + '');
			jQuery('.last-date-label').text('Date Last Worked: ' + '');
			jQuery('.words-per-hour-label').text('Words Per Hour: ' + '');
			jQuery('.words-per-session-label').text('Avg. Words Per Session: ' + '');
			jQuery('.words-per-day-label').text('Words Per Day (24 hours): ' + '');
			jQuery('.hours-per-session-label').text('Hours Per Session: ' + '');
			jQuery('.hours-per-day-label').text('Hours Per Day (24 hours): ' + '');
			jQuery('.remaining-hours-label').text('Est Remaining Hours: ' + '');
			jQuery('.remaining-sessions-label').text('Est Remaining Sessions: ' + '');
			jQuery('.est-target-date-label').text('Target Completion Date: ' + '');
			jQuery('.est-total-word-count-label').text('Estimated Word Count: ');
			jQuery('.est-comp-date-label').text('Est Completion Date: ' + '');
		}
	 }

	 jQuery('.animate-check').on


	 $('.log-table').on("click", "tr td.openEditFields", function(e) {

		var rowid = jQuery(this).parent('tr').data('logid');
		var startDate = new Date(jQuery(this).parent('tr').find('td[data-metakey="startdate"]').html());
		var endDate = new Date(jQuery(this).parent('tr').find('td[data-metakey="enddate"]').html());
		var wordCount = jQuery(this).parent('tr').find('td[data-metakey="wordCount"]').html();
		var notes = jQuery(this).parent('tr').find('td[data-metakey="notes"]').html();

		jQuery('#startDatePicker').datetimepicker().datetimepicker('setDate', startDate);
		jQuery('#endDatePicker').datetimepicker().datetimepicker('setDate', endDate);
		jQuery('.word-count-input').val(wordCount);
		jQuery('.notes-input').val(notes);
		jQuery('.edit-control-group').slideDown(500);
		jQuery('#btnAddLog').prop('disabled', true);
		jQuery('#btnShowShortcode').prop('disabled', true);
		jQuery('#selectWTPProject').prop('disabled', true);
		newLogItem = false;
		clickedRowID = rowid;
	});


	$('.log-table').on("click", "tr td.deleteLogRow", function(e) {
			var logID = jQuery(this).parent('tr').data('logid');
			var postID = jQuery('#selectWTPProject').val();
			var nonce = wtpjtr_ScriptInformation.nonces;
			if (logID > 0){
			jQuery.ajax({
				type:'POST',
				url: 'admin-ajax.php',
				data: {
				 action: 'delete_log',
				 postid: postID,
				 logid: logID,
				 nonce_data: nonce
			 },
				success: function (output) {
					jQuery('#selectWTPProject').change();
				},
				error: function(data) {

				}
			});
	}
});

	 function wtpjtr_blankEditControls()
	 {
		jQuery('#startDatePicker').datetimepicker().datetimepicker('setDate', '');
		jQuery('#endDatePicker').datetimepicker().datetimepicker('setDate', '');
		jQuery('.word-count-input').val('');
		jQuery('.notes-input').val('');
	 }
	  jQuery(document).ready(function () {
			jQuery(".animate-check").change();

			jQuery("#selectWTPProject").change();
			jQuery('#selectWTPProject').unbind('change');
			jQuery('#selectWTPProject').change(function () {
			var nonce = wtpjtr_ScriptInformation.nonces;
			var postID = jQuery('#selectWTPProject').val();
			if (postID != '000')
			{
				jQuery.ajax({
					type:'POST',
					url: 'admin-ajax.php',
					data: {
					 action: 'select_change_callback',
					 postid: postID,
					 nonce_data: nonce
					},
					success: function (output) {
						if (output.length > 3)
						{
							output = jQuery.parseJSON(output);

							wtpjtr_buildLogTable(output);
							wtpjtr_buildStats(output);
							jQuery('.edit-control-group').hide();
							jQuery('#shortcodeSelections').hide();
							jQuery('#btnAddLog').removeClass('hidden');
							jQuery('#btnShowShortcode').removeClass('hidden');
							jQuery('#logTableContainer').removeClass('hidden');
							if (!jQuery('.no-rows').hasClass('hidden'))
								jQuery('.no-rows').addClass('hidden');
						}
						else
						{
							jQuery('.log-table tr').remove();
							jQuery('#logTableContainer').removeClass('hidden');
							jQuery('#btnAddLog').removeClass('hidden');
							jQuery('#btnShowShortcode').removeClass('hidden');
							if (jQuery('.no-rows').hasClass('hidden'))
								jQuery('.no-rows').removeClass('hidden');
							wtpjtr_buildStats(null);
						}
					},
					error: function(data) {
						 console.log("data", data.status);
						jQuery('.log-table tr').remove();
						wtpjtr_buildStats(null);
					}
				});
			}
			else
			{
				jQuery('.log-table tr').remove();
				jQuery('.edit-control-group').hide();
				jQuery('#shortcodeSelections').hide();
				if (!jQuery('#btnAddLog').hasClass('hidden'))
					jQuery('#btnAddLog').addClass('hidden');

				if (!jQuery('#btnShowShortcode').hasClass('hidden'))
					jQuery('#btnShowShortcode').addClass('hidden');

				if (!jQuery('#logTableContainer').hasClass('hidden'))
					jQuery('#logTableContainer').addClass('hidden');

				if (!jQuery('.no-rows').hasClass('hidden'))
					jQuery('.no-rows').addClass('hidden');

				wtpjtr_buildStats(null);
			}
		});

		jQuery('.word-count-input').on('keydown', function (e) {
			if (jQuery.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
				 // Allow: Ctrl+A, Command+A
				(e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
				 // Allow: home, end, left, right, down, up
				(e.keyCode >= 35 && e.keyCode <= 40)) {
					 // let it happen, don't do anything
					 return;
			}
			// Ensure that it is a number and stop the keypress
			if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
				e.preventDefault();
			}
		});

		function wtpjtr_checkEndDate()
		{
			var endDate = jQuery('#end-date-input').val();
			var startDate = jQuery('#start-date-input').val();
			if ((startDate != '') && (endDate != '') && (startDate > endDate)){
				wtpjtr_addErrorMessage(jQuery('#end-date-input'), 'Enter End Date after Start Date.');
			}
			else if (endDate == '')
			{
				wtpjtr_addErrorMessage(jQuery('#end-date-input'), 'Enter an End Date.');
			}
			else {
				wtpjtr_removeErrorMessage(jQuery('#end-date-input'));
			}
		}

		function wtpjtr_checkStartDate()
		{
			var startDate = jQuery('#start-date-input').val();
			if (startDate == '')
				wtpjtr_addErrorMessage(jQuery('#start-date-input'), 'Enter a Start Date');
			else
			{
				wtpjtr_removeErrorMessage(jQuery('#start-date-input'));
				wtpjtr_checkEndDate();
			}
		}

		function wtpjtr_checkWordCount()
		{
			if (jQuery('.word-count-input').val() == '')
				wtpjtr_addErrorMessage(jQuery('.word-count-input'), 'Enter Word Count');
			else
				wtpjtr_removeErrorMessage(jQuery('.word-count-input'));
		}

		jQuery('.word-count-input').change(function() {
			wtpjtr_checkWordCount();
		});

		jQuery('.word-count-input').blur(function() {
			wtpjtr_checkWordCount();
	  });

		jQuery('#startDatePicker').datetimepicker().on('changeDate', function() {
			wtpjtr_checkStartDate();
		});

		jQuery('#start-date-input').blur(function() {
			wtpjtr_checkStartDate();
		});
		jQuery('#endDatePicker').datetimepicker().on('changeDate', function(){
			wtpjtr_checkEndDate();
		});

		jQuery('#end-date-input').blur(function () {
			wtpjtr_checkEndDate();
		});

		function wtpjtr_addErrorMessage(control, message)
		{
			if (!jQuery(control).parent().hasClass('has-error'))
			{
				jQuery(control).parent().addClass('has-error');
				if (jQuery(control).parent().hasClass('date'))
					jQuery(control).parent().after('<span class="error-message">' + message + '</span>');
				else
					jQuery(control).after('<span class="error-message">' + message + '</span>');
			}
		}

		function wtpjtr_removeErrorMessage(control)
		{
			jQuery(control).parent().removeClass('has-error');
			if (jQuery(control).parent().hasClass('date'))
			{
				if (control.parent().next().hasClass('errormessage'))
					if (jQuery(control).parent().hasClass('date'))
						jQuery(control).parent().next().remove();
			}
			else
				jQuery(control).next().remove();
		}


		function wtpjtr_validateEdits()
		{
			var passed = true;
			var startDate = jQuery('#start-date-input').val()
			var endDate = jQuery('#end-date-input').val();
			var wordCount = jQuery('.word-count-input').val();
			if (startDate == '')
			{
				wtpjtr_addErrorMessage(jQuery('#start-date-input'), 'Enter a Start Date');
				passed = false;
			}
			else
				wtpjtr_removeErrorMessage(jQuery('#start-date-input'));
			if (endDate == '')
			{
				wtpjtr_addErrorMessage(jQuery('#end-date-input'), 'Enter an End Date');
				passed = false;
			}
			else if ((startDate != '') && (endDate != '') && (endDate <= startDate))
			{
				wtpjtr_addErrorMessage(jQuery('#end-date-input'), 'Enter End Date After Start Date.');
				passed = false;
			}
			else
				wtpjtr_removeErrorMessage(jQuery('#end-date-input'));

			if (wordCount == '')
			{
				wtpjtr_addErrorMessage(jQuery('.word-count-input'), 'Enter a Word Count');
				passed = false;
			}
			else
				wtpjtr_removeErrorMessage(jQuery('.word-count-input'));

			return passed;
		}

		jQuery(".animate-check").change(function() {
				jQuery(".duration-input").prop("disabled", !this.checked);
		});

		jQuery("#btnCopyShortcode").click(function (e) {
			var shortcode = jQuery("#shortcodeScript");
			jQuery(shortcode).focus();
			jQuery(shortcode).select();
			document.execCommand('copy');
			return false;
		});

		jQuery('#btnCreateShortcode').click(function() {
			var projectID           =  jQuery('#selectWTPProject').val();
			var type			    =  jQuery('.project-bar-type').val();
			var color				=  jQuery('.stroke-color').val();
			var fontColor			=  jQuery('.font-color').val();
			var trailColor 			=  jQuery('.trail-color').val();
			var chartWidth 			=  jQuery('.width-input').val();
			var strokeWidth			=  jQuery('.stroke-input').val();
			var animateBar			=  jQuery('.animate-check').prop('checked');
			var title 		        =  jQuery('.sc-title-check').prop('checked');
			var description	        =  jQuery('.sc-description-check').prop('checked');
			var estWordCount      =  jQuery('.sc-target-count-check').prop('checked')
			var estDueDate	    =  jQuery('.sc-target-due-date-check').prop('checked');
			var imageUrl           =  jQuery('.sc-image-check').prop('checked');
			var totalWordCount    =  jQuery('.sc-total-word-count-check').prop('checked');
			var totalHours         =  jQuery('.sc-total-hours-check').prop('checked');
			var avgWordsPerHour  =  jQuery('.sc-avg-words-hour-check').prop('checked');
			var targetDate         =  jQuery('.sc-days-remaining-check').prop('checked');
			var estCompletionDate =  jQuery('.sc-estimate-comp-date-check').prop('checked');
			var lockProgressBar	=  jQuery('.sc-loop-check').prop('checked');
			var lockDate           =  jQuery('.freeze-date-input').val();
			var easing				=  jQuery('.progress-bar-easing').val();
			var fontSize 			=  jQuery('.font-size-input').val();
			var durationTime = jQuery('.duration-input').val();
			durationTime = durationTime !== "" ? durationTime * 1000 : 1000;
			var nonce = wtpjtr_ScriptInformation.nonces;

			jQuery.ajax({
				type:'POST',
				url: 'admin-ajax.php',
				async: true,
				data: {
					action: 'run_shortcode_generator',
					projectid          			:	projectID,
					type			            :    type,
					color						:   color,
					chartWidth					:   chartWidth,
					sWidth						:   strokeWidth,
					title 		                :    title,
					description	           		:    description,
					est_word_count             	:    estWordCount,
					est_due_date	            :    estDueDate,
					use_image_url                  	:    imageUrl,
					total_word_count           	:    totalWordCount,
					total_hours                	:    totalHours,
					avg_words_per_hour         	:    avgWordsPerHour,
					target_date                	:    targetDate,
					est_completion_date        	:    estCompletionDate,
					lock_progress_bar	        :    lockProgressBar,
					lock_date                  	:    lockDate,
					easing						:    easing,
					fontsize					:    fontSize,
					fontcolor					:    fontColor,
					trailcolor					: 	 trailColor,
					animate						: 	 animateBar,
					duration : durationTime,
					nonce_data: nonce

				},
				success: function (output) {
					jQuery('.shortcode-script').val(jQuery.parseJSON(output));
					jQuery('#btnCopyShortcode').prop('disabled', false);
				},
				error: function(data) {
					console.log('data', data);
					jQuery('#btnCopyShortcode').prop('disabled', true);

				}
			});
		});

		function wtpjtr_setStatesOnButtonClick(disabled)
		{
			jQuery('#btnAddLog').prop('disabled', disabled);
			jQuery('.log-table').prop('disabled', disabled);
			jQuery('#btnShowShortcode').prop('disabled', disabled);
			jQuery('#selectWTPProject').prop('disabled', disabled);

		}
		jQuery('#btnCancelShortcode').click(function() {
			jQuery('#shortcodeSelections').slideUp('slow');
			wtpjtr_setStatesOnButtonClick(false);
			e.stopPropagation();
		});

		jQuery('#btnAddLog').click(function (e) {
			jQuery('.edit-control-group').slideDown('slow');
			wtpjtr_setStatesOnButtonClick(true);
			newLogItem = true;
			e.stopPropagation();
		});

		jQuery('#btnShowShortcode').click(function (e) {
			jQuery('#shortcodeSelections').slideDown('slow');
			wtpjtr_setStatesOnButtonClick(true);
			jQuery('#btnCopyShortcode').prop('disabled', true);
			e.stopPropagation();
		});

		jQuery('#btnCancelLog').unbind().click(function (e) {
			jQuery('.edit-control-group').slideUp('slow');
			wtpjtr_setStatesOnButtonClick(false);
			wtpjtr_clearEditFields();
			newLogItem = false;
		});

		 jQuery('#btnSaveLog').unbind().click(function (e) {
			if (newLogItem)
				clickedRowID = -1;
			var postId = jQuery('#selectWTPProject').val();
			var startDate = jQuery('#start-date-input').val();
			var endDate = jQuery('#end-date-input').val();
			var wordCount = jQuery('.word-count-input').val();
			var Notes = jQuery('.notes-input').val();
			var nonce = wtpjtr_ScriptInformation.nonces;
			if (wtpjtr_validateEdits())
			{
			 jQuery.ajax({
				 type:'POST',
				 url: 'admin-ajax.php',
				 data: {
					 action: 'save_log_callback',
					 postid: postId,
					 startdate: startDate,
					 enddate: endDate,
					 wordcount: wordCount,
					 notes: Notes,
					 logrowid: clickedRowID,
					 nonce_data: nonce
				 },
				 success: function (output) {
					newLogItem = false;
					jQuery('#selectWTPProject').change();
					wtpjtr_setStatesOnButtonClick(false);
					jQuery('.edit-control-group').slideUp('slow');
					wtpjtr_clearEditFields();
					return false;
				 },
				 error: function(data) {
					 console.log(data);
				 }
			 });
			}
			e.stopPropagation();
			return false;
		 });
	  });

	  function wtpjtr_formatDate(dateVal) {
		var newDate = new Date(dateVal);

		var sMonth = wtpjtr_padValue(newDate.getMonth() + 1);
		var sDay = wtpjtr_padValue(newDate.getDate());
		var sYear = newDate.getFullYear();

		return sMonth + '/' + sDay + '/' + sYear;
	}

	function wtpjtr_padValue(value) {
		return (value < 10) ? '0' + value : value;
	}
})(jQuery);
