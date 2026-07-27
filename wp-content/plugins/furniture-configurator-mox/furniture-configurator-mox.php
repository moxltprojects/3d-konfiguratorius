<?php
/**
* Plugin Name: Furniture Configurator - Mox
* Plugin URI: Trukmė
* Description: Furniture Configurator.
* Version: 0.1
* Author: Mox
* Author URI: https://www.mox.lt/
**/

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

require_once __DIR__ .'/constants.php';
require_once __DIR__ .'/customizer.php';
require_once __DIR__ .'/customposttypes.php';
require_once __DIR__ .'/helper.php';
require_once __DIR__ .'/elementshtml.php';
require_once __DIR__ .'/helperhtml.php';
require_once __DIR__ .'/ajax.php';
require_once __DIR__ .'/generatexml.php';
require_once __DIR__ .'/wooactions.php';
require_once __DIR__ .'/shortcodes.php';
require_once __DIR__ .'/wooadmin.php';


register_activation_hook( __FILE__, 'create_current_client_table' );

function furniture_config_enqueue_styles() {
}
add_action( 'wp_enqueue_scripts', 'furniture_config_enqueue_styles', 20 );

// /* Register JS Scripts */
// function furniture_config_register_threejs_scripts() {
//     if (is_product()) {
//         global $plugin_url;
//         $version = rand(1, 10) . '0.0';
//         $assets_url = $plugin_url .'/assets';

//         wp_enqueue_script( 'three-js', $assets_url . '/js/three/three.module.js', array(), $version, true );
//         wp_enqueue_script( 'three-orbitControls-js', $assets_url . '/js/three/OrbitControls.js', array(), $version, true );
//         wp_enqueue_script( 'three-GLTFLoader-js', $assets_url . '/js/three/GLTFLoader.js', array(), $version, true );

//         add_filter('script_loader_tag', function($tag, $handle) {
//             if ($handle === 'three-js' || $handle === 'three-orbitControls-js' || $handle === 'three-GLTFLoader-js' || $handle === 'init-js') {
//                 return str_replace('<script ', '<script type="module" ', $tag);
//             }
//             return $tag;
//         }, 10, 2);

//     }
// }
// add_action('wp_enqueue_scripts', 'furniture_config_register_threejs_scripts', 20);

function mox_enqueue_draggable_scripts() {

    if (is_product()) {
        global $plugin_url, $post;
        $product_id = get_the_ID();
        $type = get_field('config_type', $product_id);

        if($type == 'Draggable config') {
            $version = rand(1, 10) . '0.0';
            $assets_url = $plugin_url .'/assets';

            wp_enqueue_script('draggable-js', $assets_url . '/js/draggable/draggable.bundle.js', array('jquery'), $version, true);
            wp_enqueue_script('html2-canvas', $assets_url . '/js/html2Canvas/bundle.min.js', array(), $version, true);

            wp_enqueue_script('jquery-ui-draggable');
            wp_enqueue_script('jquery-ui-droppable');
        }
    }
}
add_action('wp_enqueue_scripts', 'mox_enqueue_draggable_scripts');

function mox_enqueue_custom_scripts() {

    if (is_product()) {
        global $plugin_url, $post;
        $product_id = get_the_ID();
        $type = get_field('config_type', $product_id);
        if($type == 'Draggable config') {

            $version = rand(1, 10) . '0.0';
            $assets_url = $plugin_url .'/assets';

            wp_enqueue_style(
                'config-style-css',
                $assets_url . '/css/bundle.css',
                array(), 
                $version, 
                'all'
            );
            wp_enqueue_script(
                'config-script-js',
                $assets_url . '/js/script.js',
                array('jquery', 'jquery-ui-draggable', 'jquery-ui-droppable'),
                $version,
                true
            );

            add_filter('script_loader_tag', function($tag, $handle) {
                if ($handle === 'config-script-js') {
                    return str_replace('<script ', '<script type="module" ', $tag);
                }
                return $tag;
            }, 10, 2);

            wp_localize_script('config-script-js', 'configData', [
                'ajaxurl' => admin_url('admin-ajax.php'),
                'assetsUrl' => $assets_url,
                'login_nonce'   => wp_create_nonce('ajax-login-nonce')
            ]);
        }
    }
}
add_action('wp_enqueue_scripts', 'mox_enqueue_custom_scripts');

/******** 3D files *********/

// Allow .glb MIME type
function custom_mime_types($mimes) {
    $mimes['glb'] = 'model/gltf-binary';
    $mimes['xml'] = 'application/xml';
    return $mimes;
}
add_filter('upload_mimes', 'custom_mime_types');

// Fix filetype check for .glb uploads
function fix_glb_check($data, $file, $filename, $mimes) {
    $ext = pathinfo($filename, PATHINFO_EXTENSION);

    if (strtolower($ext) === 'glb') {
        return [
            'ext'  => 'glb',
            'type' => 'model/gltf-binary',
            'proper_filename' => $filename,
        ];
    }

    return $data;
}
add_filter('wp_check_filetype_and_ext', 'fix_glb_check', 10, 4);

