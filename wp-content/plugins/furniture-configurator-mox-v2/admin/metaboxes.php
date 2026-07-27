<?php

add_action( 'init', 'furniture_config_v2_admin_create_all' );

function furniture_config_v2_admin_create_all() {
    furniture_config_v2_admin_create_taxonomies();
    furniture_config_v2_admin_create_posttypes();
}

function furniture_config_v2_admin_create_posttypes() {
    register_post_type( 'config-templates',
        array(
            'labels' => array(
                'name' => __( 'Configurator Templates' ),
                'singular_name' => __( 'Configurator Template' )
            ),
            'public' => true,
            'show_ui' => true,
            'has_archive' => true,
            'rewrite' => array('slug' => 'config-templates'),
            'show_in_rest' => true,
			'taxonomies' => array( 
                'config-template-categories', 
            ),
            'supports' => array( 'title', 'thumbnail' ), 
        )
    );
}

function furniture_config_v2_admin_create_taxonomies() {
    register_taxonomy(
        'config-template-categories',
        [
            'config-templates',
        ],
        [
            'label'             => __( 'Template Categories', 'furniture-config' ),
            'hierarchical'      => true,
            'public'            => true,
            'show_ui'           => true,
            'show_in_menu'      => true,
            'show_admin_column' => true,
            'show_in_rest'      => true,
            'rewrite'           => [ 'slug' => 'config-template-categories' ],
        ]
    );
}

add_action('add_meta_boxes', function () {
    add_meta_box(
        'config_parameters',
        'Configurator',
        'render_configurator_sceen',
        'config-templates', 
        'normal',
        'default'
    );
});

function render_configurator_sceen($post) {
    global $post, $furniture_config_v2_plugin_url, $admin_furniture_config_v2_plugin_url, $admin_furniture_config_v2_template_parts_url;
    $postId = $post->ID;
    $version = rand(1, 10) . '0.0';
    $assets_url = $admin_furniture_config_v2_plugin_url .'/assets'; 
    $general_assets_url = $furniture_config_v2_plugin_url .'/assets'; 

    wp_enqueue_style(
        'mox-config-preview',
        $general_assets_url . '/css/bundle-room.css',
        [],
        '1.0'
    );

    // enqueue script
    wp_enqueue_script(
        'admin-furniture-config-room-script-js',
        $assets_url . '/js/script-room.js',
        array('jquery', 'jquery-ui-draggable', 'jquery-ui-droppable'),
        $version,
        true
    );

    add_filter('script_loader_tag', function($tag, $handle) {
        if ($handle === 'admin-furniture-config-room-script-js') {
            return str_replace('<script ', '<script type="module" ', $tag);
        }
        return $tag;
    }, 10, 2);

    wp_localize_script('admin-furniture-config-room-script-js', 'configDataRoom', [
        'ajaxurl' => admin_url('admin-ajax.php'),
        'assetsUrl' => $assets_url,
        'generalAssetsUrl' => $general_assets_url,
        'login_nonce'   => wp_create_nonce('ajax-login-nonce'),
    ]);

    include $admin_furniture_config_v2_template_parts_url .'/index.php'; 

}