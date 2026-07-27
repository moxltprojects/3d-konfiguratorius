<?php
/**
* Plugin Name: Furniture Configurator V2 - Mox
* Plugin URI: Trukmė
* Description: Furniture Configurator V2.
* Version: 0.1
* Author: Mox
* Author URI: https://www.mox.lt/
**/

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

require_once __DIR__ .'/db.php';
register_activation_hook(__FILE__, 'create_config_tables');
register_activation_hook(__FILE__, 'create_admin_config_templates_tables');

require_once __DIR__ .'/constants.php';
require_once __DIR__ .'/customposttypes.php';
require_once __DIR__ .'/customizer.php';
require_once __DIR__ .'/helper.php';
require_once __DIR__ .'/helper-product.php';
require_once __DIR__ .'/ajax.php';
require_once __DIR__ .'/wooactions.php';
require_once __DIR__ .'/shortcodes.php';
require_once __DIR__ .'/wooadmin.php';

require_once __DIR__ .'/shortcodes-room.php';
require_once __DIR__ .'/ajax-room.php';
require_once __DIR__ .'/helper-room.php';
require_once __DIR__ .'/admin/index.php';

function furniture_config_v2_enqueue_styles() {
}
add_action( 'wp_enqueue_scripts', 'furniture_config_v2_enqueue_styles', 20 );

function mox_enqueue_furniture_config_custom_scripts() 
{
    $product_page = false;
    $product_id = null;
    $category_page = is_archive();


    if(!$category_page) {
        global $post;
        $product_id = get_the_ID();
        $type = get_field('config_type', $product_id);
        $product_page = $type == 'Single Furniture';
    }

    // wp_enqueue_script(
    //     'script-room-config-preview-js',
    //     $assets_url . '/js/script-room-config-preview.js',
    //     [],
    //     $version,
    //     true
    // );
    // add_filter('script_loader_tag', function($tag, $handle) {
    //     if ($handle === 'script-room-config-preview-js') {
    //         return str_replace('<script ', '<script type="module" ', $tag);
    //     }
    //     return $tag;
    // }, 10, 2);

    // wp_localize_script('script-room-config-preview-js', 'configDataPreviewRoom', [
    //     'ajaxurl' => admin_url('admin-ajax.php'),
    //     'assetsUrl' => $assets_url,
    //     'login_nonce'   => wp_create_nonce('ajax-login-nonce'),
    // ]);

//     if ($category_page || $product_page) {
        global $furniture_config_v2_plugin_url;
        $version = rand(1, 10) . '0.0';
        $assets_url = $furniture_config_v2_plugin_url .'/assets';

        wp_enqueue_style(
            'furniture-config-style-css',
            $assets_url . '/css/bundle.css',
            array(), 
            $version, 
            'all'
        );

        if($product_page) {
            wp_enqueue_style(
                'furniture-config-single-product-style-css',
                $assets_url . '/css/single-product.css',
                array(), 
                $version, 
                'all'
            );
        }

        wp_enqueue_script(
            'furniture-config-script-js',
            $assets_url . '/js/script.js',
            array('jquery'),
            $version,
            true
        );
        
//         if($category_page) {
            wp_enqueue_script(
                'furniture-config-category-script-js',
                $assets_url . '/js/script-category.js',
                array('jquery'),
                $version,
                true
            );

            add_filter('script_loader_tag', function($tag, $handle) {
                if ($handle === 'furniture-config-category-script-js') {
                    return str_replace('<script ', '<script type="module" ', $tag);
                }
                return $tag;
            }, 10, 2);

            $upload_dir = wp_upload_dir();
            wp_localize_script('furniture-config-category-script-js', 'configDataCategory', [
                'ajaxurl' => admin_url('admin-ajax.php'),
                'assetsUrl' => $assets_url,
                'uploadsUrl' => trailingslashit($upload_dir['baseurl']),
                'login_nonce'   => wp_create_nonce('ajax-login-nonce'),
            ]);

            /************ products ***********/
            wp_enqueue_script(
                'furniture-config-products-script-js',
                $assets_url . '/js/script-products.js',
                array('jquery', 'jquery-ui-draggable', 'jquery-ui-droppable'),
                $version,
                true
            );

            add_filter('script_loader_tag', function($tag, $handle) {
                if ($handle === 'furniture-config-products-script-js') {
                    return str_replace('<script ', '<script type="module" ', $tag);
                }
                return $tag;
            }, 10, 2);

            wp_localize_script('furniture-config-products-script-js', 'configDataProducts', [
                'ajaxurl' => admin_url('admin-ajax.php'),
                'assetsUrl' =>  $assets_url,
                'login_nonce'   => wp_create_nonce('ajax-login-nonce'),
            ]);

            /************ room 3D ***********/

            wp_enqueue_style(
                'furniture-config-room-style-css',
                $assets_url . '/css/bundle-room.css',
                array(), 
                $version, 
                'all'
            );

            wp_enqueue_script(
                'furniture-config-room-script-js',
                $assets_url . '/js/script-room.js',
                array('jquery', 'jquery-ui-draggable', 'jquery-ui-droppable'),
                $version,
                true
            );

            add_filter('script_loader_tag', function($tag, $handle) {
                if ($handle === 'furniture-config-room-script-js') {
                    return str_replace('<script ', '<script type="module" ', $tag);
                }
                return $tag;
            }, 10, 2);

            wp_localize_script('furniture-config-room-script-js', 'configDataRoom', [
                'ajaxurl' => admin_url('admin-ajax.php'),
                'assetsUrl' => $assets_url,
                'login_nonce'   => wp_create_nonce('ajax-login-nonce'),
            ]);
//         } else if($product_page) {
            wp_enqueue_script(
                'furniture-single-config-script-js',
                $assets_url . '/js/script-product.js',
                array('jquery', 'jquery-ui-draggable', 'jquery-ui-droppable'),
                $version,
                true
            );

            add_filter('script_loader_tag', function($tag, $handle) {
                if ($handle === 'furniture-single-config-script-js') {
                    return str_replace('<script ', '<script type="module" ', $tag);
                }
                return $tag;
            }, 10, 2);

            $productFurnitureTypes = get_the_terms($product_id, 'config-furniture-type');
            $furnitureType = null;
            if(!empty($productFurnitureTypes)) {
                $furnitureType = $productFurnitureTypes[0]->slug;
            }
            wp_localize_script('furniture-single-config-script-js', 'configDataProduct', [
                'ajaxurl' => admin_url('admin-ajax.php'),
                'assetsUrl' => $assets_url,
                'login_nonce'   => wp_create_nonce('ajax-login-nonce'),
                'productId' => $product_id,
                'furnitureType' => $furnitureType,
            ]);
//         } 
//     } 
}
add_action('wp_enqueue_scripts', 'mox_enqueue_furniture_config_custom_scripts');

/******** 3D files *********/

// Allow .glb MIME type
function v2_custom_mime_types($mimes) {
    $mimes['glb'] = 'model/gltf-binary';
    $mimes['xml'] = 'application/xml';
    return $mimes;
}
add_filter('upload_mimes', 'v2_custom_mime_types');

// Fix filetype check for .glb uploads
function v2_fix_glb_check($data, $file, $filename, $mimes) {
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
add_filter('wp_check_filetype_and_ext', 'v2_fix_glb_check', 10, 4);

add_image_size(
    'custom-thumb', 
    300,       
    9999,           
    false     
);