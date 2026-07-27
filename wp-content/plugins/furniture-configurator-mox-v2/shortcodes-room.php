<?php

add_action('init', 'shortcodes_furniture_config_v2_room');
function shortcodes_furniture_config_v2_room() {
    add_shortcode('mox_furniture_config_room', 'mox_furniture_config_room_shortcode');
    add_shortcode('mox_furniture_config_preview', 'mox_furniture_config_preview_shortcode');
}

function mox_furniture_config_room_shortcode()
{
    global $post;

    $user_id = get_current_user_id();
    $user_id = $user_id == 0 ? null : $user_id;

    ob_start();
    ?>

    <?php include __DIR__ .'/template-parts/room/index.php'; ?>
    
    <?php
    return ob_get_clean();
}

function mox_furniture_config_preview_shortcode() 
{
    $configId = $_GET['id'] ?? null;
    if(!$configId) return;
    global $furniture_config_v2_plugin_url;
    $version = rand(1, 10) . '0.0';
    $assets_url = $furniture_config_v2_plugin_url .'/assets';

    wp_enqueue_style(
        'mox-config-preview',
        $assets_url . '/css/bundle-room.css',
        [],
        '1.0'
    );

    // enqueue script
    wp_enqueue_script(
        'script-room-config-preview-js',
        $assets_url . '/js/script-room-config-preview.js',
        [],
        $version,
        true
    );
    add_filter('script_loader_tag', function($tag, $handle) {
        if ($handle === 'script-room-config-preview-js') {
            return str_replace('<script ', '<script type="module" ', $tag);
        }
        return $tag;
    }, 10, 2);

    wp_localize_script('script-room-config-preview-js', 'configDataPreviewRoom', [
        'ajaxurl' => admin_url('admin-ajax.php'),
        'assetsUrl' => $assets_url,
        'login_nonce'   => wp_create_nonce('ajax-login-nonce'),
    ]);

    ob_start();
    ?>
    <style></style>

    <?php include __DIR__ .'/template-parts/room/config-preview/index.php'; ?>
    
    <?php
    return ob_get_clean();
}