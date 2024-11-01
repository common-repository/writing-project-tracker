<?php
//PROJECT constants
define("WRITING_PROJECT_TRACKER", "writing_project_tracker");
define("WRITING_PROJECT_TRACKER_ACTIVE", "wtpjtr_active");
define("WRITING_PROJECT_TRACKER_EST_WORD_COUNT", "wtpjtr_estwordcount");
define("WRITING_PROJECT_TRACKER_EST_COMP_DATE", "wtpjtr_estcompleteddate");
define("WRITING_PROJECT_TRACKER_POST_TYPE", 'wtpjtr_project');

 //LOG DB CONSTANTS
 define("LOG_META_WTPJTR_KEY_VALUE", "wtpjtr_log_item");
 define("LOG_META_WTPJTR_START_DATE", 'wtpjtr_log_start_date');
 define("LOG_META_WTPJTR_END_DATE", 'wtpjtr_log_end_date');
 define("LOG_META_WTPJTR_WORD_COUNT", 'wtpjtr_log_word_count');
 define("LOG_META_WTPJTR_NOTES", 'wtpjtr_log_notes');

 //QUERY CONSTANT STRINGS
 define("GET_LOG_WTPJTR_BY_LOGID", "select meta_value, meta_key from wp_postmeta where post_id = %d and meta_key = 'wtpjtr_log_start_date' and meta_value = %s");
?>
