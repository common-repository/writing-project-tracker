<?php
/*
	Plugin Name: Writing Project Tracker
	Plugin URI: something something
	Description: Track progress on your writing projects against projected word count and completion date
	Version: 1.0.0
	Author: Michael Heinrich
	Author URI: https://www.oxsteam.com
	License: GPL-2.0+
	License URI: http://www.gnu.org/licenses\gpl-2.0.txt
	Text Domain: writing-project-tracker
	Domain Path: something
*/

namespace Writing_Project_Tracker;

if( ! defined( 'ABSPATH' ) ) {
    return;
}

$atts;

class WritingProjectTracker
{
	/**
	*
	* @return void;
	*/

	public function wtpjtr_load() {
		include_once 'includes/const/constants.php';
		include_once 'includes/interface/admin-interface.php';
    include_once 'includes/interface/functions.php';
    include_once 'includes/shortcode/functions.php';
	}
}

function wtpjtr_writing_project_tracker_load(){
		$pg = new WritingProjectTracker();
		$pg->wtpjtr_load();
}

add_action('admin_enqueue_scripts', 'Writing_Project_Tracker\wtpjtr_writing_project_tracker_load_admin_scripts');
add_action('admin_print_styles', 'Writing_Project_Tracker\wtpjtr_writing_project_tracker_load_admin_styles');
add_action('plugins_loaded', 'Writing_Project_Tracker\wtpjtr_writing_project_tracker_load');

function wtpjtr_writing_project_tracker_load_admin_styles() {
	wp_register_style($handle = 'wt_bootstrap', $src = plugins_url('includes/bootstrap-4.4.1-dist/css/bootstrap.min.css', __FILE__), $deps = array(), $ver = '1.0.0', $media = 'all');
	wp_enqueue_style('wt_bootstrap');

	wp_register_style($handle = 'wt-datepicker', $src = plugins_url('includes/css/bootstrap-datetimepicker.min.css', __FILE__), $deps = array(), $ver = '1.0.0', $media = 'all');
    wp_enqueue_style('wt-datepicker');

	wp_register_style($handle = 'wt-admin-css-all', $src = plugins_url('includes/css/wt-styles.css', __FILE__), $deps = array(), $ver = '1.0.0', $media = 'all');
    wp_enqueue_style('wt-admin-css-all');
}

function wtpjtr_writing_project_tracker_load_admin_scripts() {
	wp_register_script('wt-modernizr', $src = plugins_url('includes/js/modernizr-custom.js', __FILE__), array('jquery'));
	wp_enqueue_script( 'wt-modernizr' );

	wp_register_script('wt_bootstrap', $src = plugins_url('includes/bootstrap-4.4.1-dist/js/bootstrap.min.js', __FILE__), array('jquery'));
	wp_enqueue_script('wt_bootstrap');

	wp_register_script('wt-datepicker', $src = plugins_url('includes/js/bootstrap-datetimepicker.min.js', __FILE__), array('jquery'));
	wp_enqueue_script( 'wt-datepicker' );

	wp_enqueue_style( 'wp-color-picker' );
  wp_enqueue_script( 'wt-color-picker', plugins_url('includes/js/wt-script.js', __FILE__ ), array( 'wp-color-picker' ), false, true );

  $dataToPass = array(
      'nonces' => wp_create_nonce('wtpjtr_nonceCallback')
  );
	wp_register_script('wt-script', $src = plugins_url('includes/js/wt-script.js', __FILE__), array('jquery'));
  wp_localize_script('wt-script', 'wtpjtr_ScriptInformation', $dataToPass);
	wp_enqueue_script( 'wt-script', 'wtpjtr_active' );

  wp_register_script('wt-progress', $src = plugins_url('includes/js/progressbar.min.js', __FILE__), array('jquery'));
  wp_enqueue_script( 'wt-progress' );
}

add_shortcode('wtpjtr_displayproject', 'wtpjtr_write_track_shortcode_build_project_html');


register_activation_hook( __FILE__, 'Writing_Project_Tracker\wtpjtr_writing_project_tracker_plugin_activation' );
function wtpjtr_writing_project_tracker_plugin_activation() {
	if ( ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	add_option( 'write_tracke_activated', time() );
}

add_action( 'admin_init','Writing_Project_Tracker\wtpjtr_writing_project_tracker_plugin_initialize' );
function wtpjtr_writing_project_tracker_plugin_initialize() {
    if( is_admin() && get_option( 'write_track_plugin_activation' ) == 'just-activated' ) {
    delete_option( 'write_track_plugin_activation' );
        flush_rewrite_rules();
    }
}

register_deactivation_hook(__FILE__, 'Writing_Project_Tracker\wtpjtr_writing_project_tracker_plugin_deactivation');
function wtpjtr_writing_project_tracker_plugin_deactivation() {
	//do something here later
}


function wtpjtr_is_write_tracker_deactivating() {
	return is_admin() && isset( $_GET['action'] ) && isset( $_GET['plugin'] ) && 'deactivate' === $_GET['action'] && 'write-tracker/writing-tracker.php' === $_GET['plugin'];
}

add_action ('init', 'Writing_Project_Tracker\writing_project_tracker_register_post_type');
function writing_project_tracker_register_post_type() {
	if (wtpjtr_is_write_tracker_deactivating()){
		return;
	}

	$labels = array(
		'name'               => _x( 'Write Track', 'post type general name', 'write-track' ),
		'singular_name'      => _x( 'Write Track Item', 'post type singular name', 'write-track' ),
		'menu_name'          => _x( 'Write Track', 'admin menu', 'write-tracker' ),
		'name_admin_bar'     => _x( 'Write Track Items', 'add new on admin bar', 'write-track' ),
		'all_items'          => __( 'All Projects', 'write-track' ),
		'add_new_item'       => __( 'Add New Project', 'write-track' ),
		'edit_item'			 => __( 'Edit Project', 'write-track'),
	);

	$args = array (
		'labels'             => $labels,
		'public'             => true,
		'publicly_queryable' => true,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'query_var'          => true,
		'rewrite'            => array( 'slug' => 'writing-project' ),
		'menu_icon' => 'dashicons-format-quote',
		'capability_type'    => 'post',
		'has_archive'        => true,
		'hierarchical'       => false,
		'menu_position'      => null,
		'supports'           => array( 'title', 'editor', 'author', 'thumbnail', 'excerpt', 'comments','custom-fields' )
	);
	register_post_type(WRITING_PROJECT_TRACKER_POST_TYPE, $args);

	$log_labels = array (
		'name'				=> _x( 'Write Track Log', 'post type general name', 'write-track'),
		'singular_name'		=> _x( 'Write Track Log Item', 'post type singular name', 'write-track')
	);

	$log_args = array (
		'labels'			=> $log_labels,
		'public'			=> true,
		'publicly_queryable' => true,
		'show_ui'            => false,
		'show_in_menu'       => false,
		'capability_type'    => 'post',
		'has_archive'        => true,
		'hierarchical'       => false,
		'menu_position'      => null,
		'supports'           => array('' )

	);
	register_post_type(LOG_META_WTPJTR_KEY_VALUE, $log_args);
	flush_rewrite_rules();


}

function wtpjtr_writing_project_tracker_shortcode_callbacks() {
  wp_register_script('wt-progress', $src = plugins_url('includes/js/progressbar.min.js', __FILE__), array('jquery'));
  wp_enqueue_script( 'wt-progress' );

}
add_action('wp_enqueue_scripts', 'Writing_Project_Tracker\wtpjtr_writing_project_tracker_shortcode_callbacks');



add_action('init', 'Writing_Project_Tracker\wtpjtr_writing_project_tracker_register_project_type_taxonomy');
function wtpjtr_writing_project_tracker_register_project_type_taxonomy() {
	$labels = array(
		'name'              => _x( 'Project Types', 'taxonomy general name', 'write-tracker' ),
		'singular_name'     => _x( 'Project Type', 'taxonomy singular name', 'write-tracker' ),
		'search_items'      => __( 'Search Project Types', 'write-tracker' ),
		'all_items'         => __( 'All Project Types', 'write-tracker' ),
		'edit_item'         => __( 'Edit Project Type', 'write-tracker' ),
		'update_item'       => __( 'Update Project Type', 'write-tracker' ),
		'add_new_item'      => __( 'Add New Project Type', 'write-tracker' ),
		'new_item_name'     => __( 'New Project Type', 'write-tracker' ),
		'menu_name'         => __( 'Project Type', 'write-tracker' ),
	);

	$args = array(
		'hierarchical'      => true,
		'labels'            => $labels,
		'show_ui'           => true,
		'show_admin_column' => true,
		'query_var'         => true,
		'rewrite'           => array( 'slug' => 'genre' ),
	);
	register_taxonomy('wt_item_type',WRITING_PROJECT_TRACKER_POST_TYPE, $args);

}

add_action('save_post_wtpjtr_project', 'Writing_Project_Tracker\wtpjtr_writing_project_tracker_save_events_meta'); // save the custom fields
function wtpjtr_writing_project_tracker_save_events_meta($post_id) {

	// verify this came from the our screen and with proper authorization,
	// because save_post can be triggered at other times
    $check_active = false;
    $complete_date = "";
	  $word_count = "";
    if(isset($_POST["check_active"]))
    {
        $check_active = sanitize_text_field($_POST["check_active"]);
    }
    update_post_meta($post_id, WRITING_PROJECT_TRACKER_ACTIVE, $check_active == "" ? "false" : "true");

    if(isset($_POST["txtgoalcompletedate"]))
    {
		if (wtpjtr_validateDate($_POST["txtgoalcompletedate"], 'Y-m-d'))
			$complete_date = sanitize_text_field($_POST["txtgoalcompletedate"]);
    }
    update_post_meta($post_id, WRITING_PROJECT_TRACKER_EST_COMP_DATE, $complete_date);

    if(isset($_POST["txtestwordcount"]))
    {
		if (is_numeric($_POST["txtestwordcount"]))
			$word_count = sanitize_text_field($_POST["txtestwordcount"]);
    }
    update_post_meta($post_id, WRITING_PROJECT_TRACKER_EST_WORD_COUNT, $word_count);
}
