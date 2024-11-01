<?php
function wtpjtr_write_track_shortcode_build_project_html( $atts)
{
	$atts = shortcode_atts( array(
		'projectid' => 0,
		'type' => 'circle',
		'swidth' => "10",
		'chartwidth' => '100',
		'title' => false,
		'color' => '#000000',
		'font_color' => '#ffffff',
		'description' => false,
		'est_word_count' => false,
		'est_due_date' => false,
		'use_image_url' => false,
		'total_word_count' => false,
		'total_hours' => false,
		'avg_words_per_hour' => false,
		'target_date' => false,
		'est_completion_date' => false,
		'lock_progress_bar' => false,
		'easing' => '',
		'font_size' => '25',
		'trailcolor' => '#ffffff',
		'animate' => false,
		'duration' => 3000,
		'lock_date' => ''), $atts, 'wtpjtr_displayproject');

	if ($atts['projectid'] > 0)
	{
    $current_project = get_post($atts['projectid']);
		$log_ids =  get_post_meta($atts['projectid'], LOG_META_WTPJTR_KEY_VALUE);
		$total_est_words = get_post_meta($current_project->ID, WRITING_PROJECT_TRACKER_EST_WORD_COUNT, true);
		$total_words = 0;
    $total_progress = 0;

		foreach ($log_ids as  $meta_key_post=>$meta_value_post)
		{
			if ($meta_value_post != "0"){
				$log_info = get_post_meta($meta_value_post, LOG_META_WTPJTR_WORD_COUNT);
				if (count($log_info) == 1)
					$total_words += $log_info[0];
			}
		}
		if ($total_words > 0)
    {
      $total_progress = ((($total_words - $total_est_words) / $total_est_words) + 1) ;
      $total_progress = ($total_progress > 1) ? $total_progress = 1 : ($total_progress < .01) && ($total_progress > 0) ? .01 : $total_progress;
    }
	}
wp_enqueue_script('shortcode_script', $src = plugins_url('../../includes/js/shortcode.js', __FILE__), array('jquery'));

$chart_container = str_replace(array('{', '}', '-'), '',  'container-progress-' . com_create_guid());

$progress_bar_script =  'jQuery("document").ready(function () { ';
if ($atts['type'] == 'circle')
  $bar_type = 'var bar = new ProgressBar.Circle("#' . $chart_container . '", {' ;
else if ($atts['type'] == 'linear')
  $bar_type = 'var bar = new ProgressBar.Line("#' . $chart_container . '", {' ;
else
  $bar_type = 'var bar = new ProgressBar.SemiCircle("#' . $chart_container . '"  , {' ;
$progress_bar_script .= $bar_type . 'strokeWidth: ' . $atts['swidth'] . ',
            easing: "' . $atts['easing'] . '",
            duration: ' . $atts['duration']  . ',
            color: "' . $atts['color'] . ' ",
            trailColor:  "' . $atts['trailcolor'] . ' ",
            trailWidth: "' . $atts['swidth'] . ' ",
            svgStyle: null,
            step: function (state,' . $atts['type'] . ') {
            var value = Math.round(' . $atts['type'] . '.value() * 100);
            if (value == 0)
              ' . $atts['type'] . '.setText("");
            else
              ' . $atts['type'] . '.setText(value + "%");
            }
           });
          bar.text.style.fontSize = "' . $atts['font_size'] . 'px";
          bar.text.style.color = "' . $atts['font_color'] . '";';

if ($atts['animate'] == "true")
  $progress_bar_script .= 'bar.animate(' . $total_progress . ');  ';
else
  $progress_bar_script .= 'bar.set(' . $total_progress . '); ';

$progress_bar_script .= '});';

wp_add_inline_script ('shortcode_script', $progress_bar_script);

return "<div class='container-progress' id=" . $chart_container . " style='width:" . $atts["chartwidth"] . "%;'></div>";

}
?>
