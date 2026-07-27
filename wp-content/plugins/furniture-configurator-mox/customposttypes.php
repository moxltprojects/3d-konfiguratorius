<?php

add_action( 'init', 'furniture_config_create_all' );

function furniture_config_create_all() {
    furniture_config_create_taxonomies();
    furniture_config_create_posttypes();
    furniture_config_insert_default_furniture_types();
    furniture_config_insert_default_furniture_texture_types();
    furniture_config_insert_default_dynamic_components_categories();
    furniture_config_insert_default_dynamic_components_types();
    furniture_config_insert_default_furniture_material_types();
}

function furniture_config_create_posttypes() {
    register_post_type( 'config-furniture',
        array(
            'labels' => array(
                'name' => __( 'Configurator Furnitures' ),
                'singular_name' => __( 'Configurator Furniture' )
            ),
            'public' => true,
            'show_ui' => true,
            'has_archive' => true,
            'rewrite' => array('slug' => 'config-furnitures'),
            'show_in_rest' => true,
			'taxonomies' => array( 
                'config-furniture-type', 
            ),
            'supports' => array( 'title', 'excerpt', 'thumbnail' ), 
        )
    );

    register_post_type( 'furniture-texture',
        array(
            'labels' => array(
                'name' => __( 'Configurator Furniture Textures' ),
                'singular_name' => __( 'Configurator Furniture Texture' )
            ),
            'public' => true,
            'has_archive' => true,
            'rewrite' => array('slug' => 'furniture-textures'),
            'show_in_rest' => true,
            'show_ui' => true,
            'show_in_menu' => true,
            'menu_icon' => 'dashicons-text-page',
            'taxonomies' => array( 
                'furniture-texture-category',
                'furniture-texture-type',  
                'furniture-texture-brand', 
                'furniture-texture-thickness', 
            ),
            'supports' => array( 'title', 'excerpt', 'thumbnail' ), 
        )
    );

    register_post_type( 'furniture-component',
        array(
            'labels' => array(
                'name' => __( 'Configurator Furniture Components' ),
                'singular_name' => __( 'Configurator Furniture Component' )
            ),
            'public' => true,
            'has_archive' => true,
            'rewrite' => array('slug' => 'furniture-components'),
            'show_in_rest' => true,
            'show_ui' => true,
            'show_in_menu' => true,
            'menu_icon' => 'dashicons-text-page',
            'taxonomies' => array( 
                'furniture-component-category',
                'config-furniture-type', 
            ),
            'supports' => array( 'title', 'excerpt', 'thumbnail' ), 
        )
    );

    register_post_type( 'config-d-component',
        array(
            'labels' => array(
                'name' => __( 'Configurator Dynamic Components' ),
                'singular_name' => __( 'Configurator Dynamic Component' )
            ),
            'public' => true,
            'has_archive' => true,
            'rewrite' => array('slug' => 'config-d-components'),
            'show_in_rest' => true,
            'show_ui' => true,
            'show_in_menu' => true,
            'menu_icon' => 'dashicons-text-page',
            'taxonomies' => array( 
                'config-d-component-category',
                'config-d-component-type',
            ),
            'supports' => array( 'title', 'excerpt', 'thumbnail' ), 
        )
    );

    register_post_type( 'furniture-material',
        array(
            'labels' => array(
                'name' => __( 'Configurator Furniture Materials' ),
                'singular_name' => __( 'Configurator Furniture Material' )
            ),
            'public' => true,
            'has_archive' => true,
            'rewrite' => array('slug' => 'furniture-material'),
            'show_in_rest' => true,
            'show_ui' => true,
            'show_in_menu' => true,
            'menu_icon' => 'dashicons-text-page',
            'taxonomies' => array( 
                'furniture-material-type',
            ),
            'supports' => array( 'title', 'excerpt', 'thumbnail' ), 
        )
    );
}

function furniture_config_create_taxonomies() {
    register_taxonomy(
        'config-furniture-type',
        [
            'config-furniture',
            'furniture-component',
            'product',
			'furniture-texture',
        ],
        [
            'label'             => __( 'Furniture Types', 'furniture-config' ),
            'hierarchical'      => true,
            'public'            => true,
            'show_ui'           => true,
            'show_in_menu'      => true,
            'show_admin_column' => true,
            'show_in_rest'      => true,
            'rewrite'           => [ 'slug' => 'config-furniture-type' ],
        ]
    );
    
    register_taxonomy(
        'furniture-texture-category',
        ['furniture-texture'],
        [
            'label'             => __( 'Furniture Texture Categories', 'furniture-config' ),
            'hierarchical'      => true,
            'public'            => true,
            'show_ui'           => true,
            'show_in_menu'      => true,
            'show_admin_column' => true,
            'show_in_rest'      => true,
            'rewrite'           => [ 'slug' => 'furniture-texture-category' ],
        ]
    );

     register_taxonomy(
        'furniture-texture-type',
        ['furniture-texture'],
        [
            'label'             => __( 'Furniture Texture Types', 'furniture-config' ),
            'hierarchical'      => true,
            'public'            => true,
            'show_ui'           => true,
            'show_in_menu'      => true,
            'show_admin_column' => true,
            'show_in_rest'      => true,
            'rewrite'           => [ 'slug' => 'furniture-texture-type' ],
        ]
    );

    register_taxonomy(
        'furniture-texture-brand',
        ['furniture-texture'],
        [
            'label'             => __( 'Furniture Texture Brands', 'furniture-config' ),
            'hierarchical'      => true,
            'public'            => true,
            'show_ui'           => true,
            'show_in_menu'      => true,
            'show_admin_column' => true,
            'show_in_rest'      => true,
            'rewrite'           => [ 'slug' => 'furniture-texture-brand' ],
        ]
    );

    register_taxonomy(
        'furniture-texture-thickness',
        ['furniture-texture'],
        [
            'label'             => __( 'Furniture Texture Thickness', 'furniture-config' ),
            'hierarchical'      => true,
            'public'            => true,
            'show_ui'           => true,
            'show_in_menu'      => true,
            'show_admin_column' => true,
            'show_in_rest'      => true,
            'rewrite'           => [ 'slug' => 'furniture-texture-thickness' ],
        ]
    );

    register_taxonomy(
        'furniture-component-category',
        ['furniture-component'],
        [
            'label'             => __( 'Furniture Component Categories', 'furniture-config' ),
            'hierarchical'      => true,
            'public'            => true,
            'show_ui'           => true,
            'show_in_menu'      => true,
            'show_admin_column' => true,
            'show_in_rest'      => true,
            'rewrite'           => [ 'slug' => 'furniture-component-category' ],
        ]
    );
    register_taxonomy(
        'config-d-component-category',
        ['config-d-component'],
        [
            'label'             => __( 'Config Dynamic Component Categories', 'furniture-config' ),
            'hierarchical'      => true,
            'public'            => true,
            'show_ui'           => true,
            'show_in_menu'      => true,
            'show_admin_column' => true,
            'show_in_rest'      => true,
            'rewrite'           => [ 'slug' => 'config-d-component-category' ],
        ]
    );
    register_taxonomy(
        'config-d-component-type',
        ['config-d-component'],
        [
            'label'             => __( 'Config Dynamic Component Types', 'furniture-config' ),
            'hierarchical'      => true,
            'public'            => true,
            'show_ui'           => true,
            'show_in_menu'      => true,
            'show_admin_column' => true,
            'show_in_rest'      => true,
            'rewrite'           => [ 'slug' => 'config-d-component-type' ],
        ]
    );
    register_taxonomy(
        'furniture-material-type',
        ['furniture-material'],
        [
            'label'             => __( 'Furniture Material Types', 'furniture-config' ),
            'hierarchical'      => true,
            'public'            => true,
            'show_ui'           => true,
            'show_in_menu'      => true,
            'show_admin_column' => true,
            'show_in_rest'      => true,
            'rewrite'           => [ 'slug' => 'furniture-material-type' ],
        ]
    );
}

function furniture_config_insert_default_furniture_types() {
    global $furniture_type_bottom_name, $furniture_type_bottom_corner_name, $furniture_type_top_name, $furniture_type_top_corner_name, $furniture_type_full_name, $furniture_type_full_corner_name;
    $terms = [$furniture_type_bottom_name, $furniture_type_bottom_corner_name, $furniture_type_top_name, $furniture_type_top_corner_name, $furniture_type_full_name, $furniture_type_full_corner_name ];

    foreach ( $terms as $term ) {
        if ( ! term_exists( $term, 'config-furniture-type' ) ) {
            $view = wp_insert_term( $term, 'config-furniture-type' );
        }
    }
}

function furniture_config_insert_default_furniture_texture_types() {
    $terms = [ 'Base', 'Frame Brim', 'Frame', 'Front Brim' ];

    foreach ( $terms as $term ) {
        if ( ! term_exists( $term, 'furniture-texture-type' ) ) {
            $view = wp_insert_term( $term, 'furniture-texture-type' );
        }
    }
}

function furniture_config_insert_default_dynamic_components_categories() {
    global $CAT_EXTERIOR_NAME, $CAT_MATERIAL_NAME, $CAT_STRETCH_NAME;
    $terms = [ $CAT_EXTERIOR_NAME, $CAT_MATERIAL_NAME, $CAT_STRETCH_NAME ];

    foreach ( $terms as $term ) {
        if ( ! term_exists( $term, 'config-d-component-category' ) ) {
            $view = wp_insert_term( $term, 'config-d-component-category' );
        }
    }
}

function furniture_config_insert_default_dynamic_components_types() {
    global $TYPE_BOTTOM_NAME, $TYPE_HEIGTH_NAME, $TYPE_DOOR_NAME, $TYPE_FRONT_NAME, $TYPE_SIDE_NAME, $TYPE_DRAWER_NAME, $TYPE_TABLETOP_NAME;
    $terms = [ $TYPE_BOTTOM_NAME, $TYPE_HEIGTH_NAME, $TYPE_DOOR_NAME, $TYPE_FRONT_NAME, $TYPE_SIDE_NAME, $TYPE_DRAWER_NAME, $TYPE_TABLETOP_NAME ];

    foreach ( $terms as $term ) {
        if ( ! term_exists( $term, 'config-d-component-type' ) ) {
            $view = wp_insert_term( $term, 'config-d-component-type' );
        }
    }
}

function furniture_config_insert_default_furniture_material_types() {
    global $DYNAMIC_COMPONENT_NAME;
    $terms = [ $DYNAMIC_COMPONENT_NAME ];

    foreach ( $terms as $term ) {
        if ( ! term_exists( $term, 'furniture-material-type' ) ) {
            $view = wp_insert_term( $term, 'furniture-material-type' );
        }
    }
}


function furniture_config_disable_term_creation_js() {
    global $pagenow;

    if ( in_array( $pagenow, ['post-new.php', 'post.php'] ) ) {
        ?>
        <script>
            jQuery(document).ready(function($) {
                $('#config-furniture-type-tabs .category-add, #config-furniture-type .tagcloud').remove();
                $('#config-furniture-type-tabs .category-add, #furniture-texture-type .tagcloud').remove();
            });
        </script>
        <?php
    }
}
add_action( 'admin_footer', 'furniture_config_disable_term_creation_js' );

function create_current_client_table()
{
    global $wpdb, $wall_single, $walls_two;
    $parent_table_name = $wpdb->prefix . "config_client_settings";
    $child_table_name = $wpdb->prefix . "config_client_setting_furnitures";
    $wall_single = "single-wall";
    $walls_two = "with-corner";

    $charset_collate = $wpdb->get_charset_collate();
    
    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

    $parent_sql = "CREATE TABLE IF NOT EXISTS $parent_table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) unsigned NOT NULL,
        product_id bigint(20) unsigned NOT NULL,
        base_color_id varchar(100) NOT NULL,
        frame_color_id varchar(100) NOT NULL,
        room_type enum('$wall_single', '$walls_two') NOT NULL,
        room_height int NOT NULL,
        room_width int NOT NULL,
        room_depth int NOT NULL,
        bottom_full_depth int NOT NULL,
        top_depth int NOT NULL,
        bottom_height int NOT NULL,
        top_height int NOT NULL,
        full_height int NOT NULL,
        vertical_space int NOT NULL,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB $charset_collate;";

    dbDelta( $parent_sql );

    $wpdb->query("
        ALTER TABLE $parent_table_name
        ADD CONSTRAINT fk_user FOREIGN KEY (user_id)
        REFERENCES {$wpdb->prefix}users(ID) ON DELETE CASCADE
    ");

    $wpdb->query("
        ALTER TABLE $parent_table_name
        ADD CONSTRAINT fk_product FOREIGN KEY (product_id)
        REFERENCES {$wpdb->prefix}posts(ID) ON DELETE CASCADE
    ");

    $wpdb->query("
        ALTER TABLE $parent_table_name
        ADD CONSTRAINT fk_base_color FOREIGN KEY (base_color_id)
        REFERENCES {$wpdb->prefix}posts(ID) ON DELETE CASCADE
    ");

    $wpdb->query("
        ALTER TABLE $parent_table_name
        ADD CONSTRAINT fk_frame_color FOREIGN KEY (frame_color_id)
        REFERENCES {$wpdb->prefix}posts(ID) ON DELETE CASCADE
    ");

    // Child table
    $child_sql = "CREATE TABLE $child_table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        custom_id BIGINT NOT NULL UNIQUE,
        config_id mediumint(9) NOT NULL,
        furniture_id mediumint(9) NOT NULL,
        width int NOT NULL,
        furniture_position_mm json NOT NULL,
        model_original_size json NOT NULL,
        model_scaled_size json NOT NULL,
        model_position json NOT NULL,
        is_fitting TINYINT(1) NOT NULL,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB $charset_collate;";

    dbDelta( $child_sql );

    $wpdb->query("
        ALTER TABLE $child_table_name
        ADD CONSTRAINT fk_config FOREIGN KEY (config_id)
        REFERENCES $parent_table_name(id) ON DELETE CASCADE
    ");

    $wpdb->query("
        ALTER TABLE $child_table_name
        ADD CONSTRAINT fk_furniture FOREIGN KEY (furniture_id)
        REFERENCES {$wpdb->prefix}posts(ID) ON DELETE CASCADE
    ");
}
