<?php 

function create_config_tables()
{
    global $wpdb, $WALL_SINGLE, $WALL_DOUBLE;
    $parent_table_name = $wpdb->prefix . CONFIG_USER_TABLE_NAME;
    $child_table_name = $wpdb->prefix . CONFIG_USER_PRODUCTS_TABLE_NAME;

    $charset_collate = $wpdb->get_charset_collate();
    
    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

    $parent_sql = "CREATE TABLE $parent_table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) unsigned NOT NULL,
        textures LONGTEXT NOT NULL,
        ai_textures LONGTEXT DEFAULT NULL,
        temp_ai_textures LONGTEXT DEFAULT NULL,
        components LONGTEXT DEFAULT NULL,
        room_type VARCHAR(20) NOT NULL,
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
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        -- texture_base64 TEXT DEFAULT NULL,
        -- texture_color VARCHAR(20) DEFAULT NULL,
        -- texture_attachment_id BIGINT(20) UNSIGNED DEFAULT NULL,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB $charset_collate;";

    dbDelta( $parent_sql );

    $wpdb->query("
        ALTER TABLE $parent_table_name
        ADD CONSTRAINT fconfig_user FOREIGN KEY (user_id)
        REFERENCES {$wpdb->prefix}users(ID) ON DELETE CASCADE
    ");

    // Child table
    $child_sql = "CREATE TABLE $child_table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        custom_id BIGINT NOT NULL,
        config_id mediumint(9) NOT NULL,
        product_id mediumint(9) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        furniture_type VARCHAR(255) NOT NULL,
        model_src VARCHAR(255) NOT NULL,
        attachment_type VARCHAR(255) DEFAULT NULL,
        -- attachment_base64 TEXT DEFAULT NULL,
        attachment_id BIGINT(20) UNSIGNED DEFAULT NULL,
        temp_attachment_id BIGINT(20) UNSIGNED DEFAULT NULL,
        has_brand_texture TINYINT(1) DEFAULT 0,
        -- thumbnail_id mediumint(9) DEFAULT 0,
        -- postcard_thumbnail_id mediumint(9) DEFAULT 0,
        prices LONGTEXT NOT NULL,
        width int NOT NULL,
        height int NOT NULL,
        depth int NOT NULL,
        space_bottom int DEFAULT NULL,
        furniture_position_mm LONGTEXT NOT NULL,
        rotation float DEFAULT NULL,
        -- model_original_size LONGTEXT NOT NULL,
        -- model_scaled_size LONGTEXT NOT NULL,
        -- model_position LONGTEXT NOT NULL,
        is_fitting TINYINT(1) NOT NULL,
        -- options LONGTEXT NOT NULL,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB $charset_collate;";

    dbDelta( $child_sql );

    $wpdb->query("
        ALTER TABLE $child_table_name
        ADD CONSTRAINT fconfig_config FOREIGN KEY (config_id)
        REFERENCES $parent_table_name(id) ON DELETE CASCADE
    ");
}
