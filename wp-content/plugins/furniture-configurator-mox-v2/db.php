<?php

// Fallback definitions so this file works even if wp-config.php hasn't been
// updated yet. The values must match the define()s in wp-config.php.
if ( ! defined( 'CONFIG_USER_TABLE_NAME' ) ) {
    define( 'CONFIG_USER_TABLE_NAME', 'config_user_settings' );
}
if ( ! defined( 'CONFIG_USER_PRODUCTS_TABLE_NAME' ) ) {
    define( 'CONFIG_USER_PRODUCTS_TABLE_NAME', 'config_user_setting_products' );
}
if ( ! defined( 'CONFIG_USER_COUNTERTOP_INSTANCES_TABLE_NAME' ) ) {
    define( 'CONFIG_USER_COUNTERTOP_INSTANCES_TABLE_NAME', 'config_user_countertop_instances' );
}

function create_config_tables()
{
    global $wpdb, $WALL_SINGLE, $WALL_DOUBLE;
    $parent_table_name      = $wpdb->prefix . CONFIG_USER_TABLE_NAME;
    $child_table_name       = $wpdb->prefix . CONFIG_USER_PRODUCTS_TABLE_NAME;
    $instances_table_name   = $wpdb->prefix . CONFIG_USER_COUNTERTOP_INSTANCES_TABLE_NAME;

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
        water_supply_enabled TINYINT(1) NOT NULL DEFAULT 0,
        water_supply_distance int NOT NULL DEFAULT 250,
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
        component_type VARCHAR(255) DEFAULT NULL,
        -- options LONGTEXT NOT NULL,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB $charset_collate;";

    dbDelta( $child_sql );


    $wpdb->query("
        ALTER TABLE $child_table_name
        ADD CONSTRAINT fconfig_config FOREIGN KEY (config_id)
        REFERENCES $parent_table_name(id) ON DELETE CASCADE
    ");

    // Countertop instances table — one row per bottom furniture piece per countertop
    $instances_sql = "CREATE TABLE $instances_table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        config_id mediumint(9) NOT NULL,
        countertop_custom_id BIGINT NOT NULL,
        bottom_custom_id BIGINT NOT NULL,
        width int NOT NULL DEFAULT 0,
        depth int NOT NULL DEFAULT 0,
        furniture_position_mm LONGTEXT NOT NULL,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB $charset_collate;";

    dbDelta( $instances_sql );

    $wpdb->query("
        ALTER TABLE $instances_table_name
        ADD CONSTRAINT fconfig_countertop_config FOREIGN KEY (config_id)
        REFERENCES $parent_table_name(id) ON DELETE CASCADE
    ");
}

function migrate_config_tables_water_supply() {
    if (get_option('fc_water_supply_migrated')) return;

    global $wpdb;
    $parent_table_name = $wpdb->prefix . 'config_user_settings';

    $columns = $wpdb->get_col("SHOW COLUMNS FROM {$parent_table_name}", 0);
    if (!in_array('water_supply_enabled', $columns)) {
        $wpdb->query("ALTER TABLE {$parent_table_name} ADD COLUMN water_supply_enabled TINYINT(1) NOT NULL DEFAULT 0 AFTER space_bottom");
    }
    if (!in_array('water_supply_distance', $columns)) {
        $wpdb->query("ALTER TABLE {$parent_table_name} ADD COLUMN water_supply_distance int NOT NULL DEFAULT 250 AFTER water_supply_enabled");
    }

    update_option('fc_water_supply_migrated', 1);
}
add_action('init', 'migrate_config_tables_water_supply');

function migrate_config_tables_component_type() {
    if (get_option('fc_component_type_migrated')) return;

    global $wpdb;
    $child_table_name = $wpdb->prefix . 'config_user_setting_products';

    $columns = $wpdb->get_col("SHOW COLUMNS FROM {$child_table_name}", 0);
    if (!in_array('component_type', $columns)) {
        $wpdb->query("ALTER TABLE {$child_table_name} ADD COLUMN component_type VARCHAR(255) DEFAULT NULL AFTER is_fitting");
    }

    update_option('fc_component_type_migrated', 1);
}
add_action('init', 'migrate_config_tables_component_type');


function migrate_config_tables_countertop_instances() {
    global $wpdb;

    $instances_table = $wpdb->prefix . CONFIG_USER_COUNTERTOP_INSTANCES_TABLE_NAME;

    // Always check whether the table actually exists — the option may have been
    // set by a previous run that used the wrong constant name and created nothing.
    $table_exists = $wpdb->get_var(
        $wpdb->prepare( 'SHOW TABLES LIKE %s', $instances_table )
    ) === $instances_table;

    if ( $table_exists ) {
        // Table exists but may be missing columns added in later versions.
        $columns = $wpdb->get_col( "SHOW COLUMNS FROM `{$instances_table}`", 0 );
        if ( ! in_array( 'bottom_custom_id', $columns ) ) {
            $wpdb->query( "ALTER TABLE `{$instances_table}` ADD COLUMN bottom_custom_id BIGINT NOT NULL DEFAULT 0 AFTER countertop_custom_id" );
        }
        update_option( 'fc_countertop_instances_migrated', 1 );
        return;
    }

    $charset_collate = $wpdb->get_charset_collate();
    $parent_table    = $wpdb->prefix . 'config_user_settings';

    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

    $sql = "CREATE TABLE $instances_table (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        config_id mediumint(9) NOT NULL,
        countertop_custom_id BIGINT NOT NULL,
        bottom_custom_id BIGINT NOT NULL,
        width int NOT NULL DEFAULT 0,
        depth int NOT NULL DEFAULT 0,
        furniture_position_mm LONGTEXT NOT NULL,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB $charset_collate;";

    dbDelta( $sql );

    $wpdb->query("
        ALTER TABLE $instances_table
        ADD CONSTRAINT fconfig_countertop_config FOREIGN KEY (config_id)
        REFERENCES $parent_table(id) ON DELETE CASCADE
    ");

    update_option( 'fc_countertop_instances_migrated', 1 );
}
add_action('init', 'migrate_config_tables_countertop_instances');
