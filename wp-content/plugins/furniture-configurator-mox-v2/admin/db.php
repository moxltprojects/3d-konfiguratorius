<?php

function create_admin_config_templates_tables()
{
    global $wpdb;
    $parent_table_name = $wpdb->prefix . ADMIN_CONFIG_TEMPLATE_TABLE_NAME;
    $child_table_name = $wpdb->prefix . ADMIN_CONFIG_TEMPLATE_PRODUCTS_TABLE_NAME;

    $charset_collate = $wpdb->get_charset_collate();
    
    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

    $parent_sql = "CREATE TABLE $parent_table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        post_id BIGINT(20) UNSIGNED NOT NULL UNIQUE,
        textures LONGTEXT NOT NULL,
        components LONGTEXT NOT NULL,
        room_height int NOT NULL,
        room_width int NOT NULL,
        room_depth int NOT NULL,
        bottom_height int NOT NULL,
        bottom_depth int NOT NULL,
        top_height int NOT NULL,
        top_depth int NOT NULL,
        full_height int NOT NULL,
        full_depth int NOT NULL,
        space_bottom int NOT NULL,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB $charset_collate;";

    dbDelta( $parent_sql );

    $result = $wpdb->query("
        ALTER TABLE $parent_table_name
        ADD CONSTRAINT fconfig_admin_post
        FOREIGN KEY (post_id)
        REFERENCES {$wpdb->prefix}posts(ID)
        ON DELETE CASCADE
    ");

    if ($result === false) {
        error_log($wpdb->last_error);
    }

    // Child table
    $child_sql = "CREATE TABLE $child_table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        post_id BIGINT(20) UNSIGNED NOT NULL,
        custom_id BIGINT NOT NULL UNIQUE,
        room_type VARCHAR(20),
        product_id mediumint(9) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        furniture_type VARCHAR(255) NOT NULL,
        model_src VARCHAR(255) NOT NULL,
        thumbnail_type VARCHAR(255) DEFAULT NULL,
        thumbnail_id mediumint(9) DEFAULT 0,
        postcard_thumbnail_id mediumint(9) DEFAULT 0,
        prices LONGTEXT NOT NULL,
        width int NOT NULL,
        height int NOT NULL,
        depth int NOT NULL,
        space_bottom int default NULL,
        furniture_position_mm LONGTEXT NOT NULL,
        rotation float DEFAULT NULL,
        is_fitting TINYINT(1) NOT NULL,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB $charset_collate;";

    dbDelta( $child_sql );

    $result = $wpdb->query("
        ALTER TABLE $child_table_name
        ADD CONSTRAINT fconfig_admin_config
        FOREIGN KEY (post_id)
        REFERENCES {$wpdb->prefix}posts(ID)
        ON DELETE CASCADE
    ");

    if ($result === false) {
        error_log($wpdb->last_error);
    }
}
