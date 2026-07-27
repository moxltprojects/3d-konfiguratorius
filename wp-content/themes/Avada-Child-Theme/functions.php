<?php

require_once 'inc/shortcodes.php';
require_once 'inc/helper.php';
require_once 'inc/ajax.php';
require_once 'inc/moxai_stand.php';

function theme_enqueue_styles() {
    wp_enqueue_style( 'child-style', get_stylesheet_directory_uri() . '/style.css', [] );
    wp_enqueue_style( 'custom-style', get_stylesheet_directory_uri() . '/assets/css/bundle.css', [] );
    wp_enqueue_style( 'lity-style', get_stylesheet_directory_uri() . '/assets/lity/lity.min.css', [] );
    // wp_enqueue_style( 'trukme-style', get_stylesheet_directory_uri() . '/assets/swiper/bundle.min.css', [] );
}
add_action( 'wp_enqueue_scripts', 'theme_enqueue_styles', 20 );

function avada_lang_setup() {
	$lang = get_stylesheet_directory() . '/languages';
	load_child_theme_textdomain( 'Avada', $lang );
}
add_action( 'after_setup_theme', 'avada_lang_setup' );


function change_price_filter_step() {
	return 1;
}
add_filter( 'woocommerce_price_filter_widget_step', 'change_price_filter_step', 10, 3 );

/* Register JS Scripts */
function avada_register_js_scripts() {
    $version = '1.0.0';
    // wp_enqueue_script( 'trukme-swiper', get_stylesheet_directory_uri() . '/assets/swiper/bundle.min.js');
    wp_enqueue_script( 'lity-script', get_stylesheet_directory_uri() . '/assets/lity/lity.min.js');
    wp_enqueue_script( 'avada-custom_scripts', get_stylesheet_directory_uri() . '/assets/js/custom_script.js');



    if (is_archive()) {
        wp_enqueue_script( 'mox-blockui-js', get_stylesheet_directory_uri() . '/assets/js/jquery.blockUI.js', array('jquery'), $version, true );
        wp_enqueue_script( 'mox-validate-js', get_stylesheet_directory_uri() . '/assets/js/validate.min.js', array('jquery'), $version, true );
        wp_enqueue_script( 'mox-sweetalert2-js', get_stylesheet_directory_uri() . '/assets/js/sweetalert2.all.min.js', array('jquery'), $version, true );
        wp_enqueue_script( 'mox-marked-js', get_stylesheet_directory_uri() . '/assets/js/marked.min.js', array('jquery'), $version, true );
        wp_enqueue_script( 'mox-moxaistandjs', get_stylesheet_directory_uri() . '/assets/js/moxai_stand.js', array('jquery'), $version, true );
        wp_enqueue_script( 'mox-moxaifurnitureanalyzerjs', get_stylesheet_directory_uri() . '/assets/js/moxai_furniture_analyzer.js', array('jquery'), $version, true );
    }


    wp_localize_script( 'avada-custom_scripts', 'theme_vars', array(
        'home' => get_home_url(),
        'templateUrl' => get_stylesheet_directory_uri(),
        'ajax_url' => admin_url( 'admin-ajax.php' ),
        'wc_ajax_url' => esc_url( WC_AJAX::get_endpoint( "%%endpoint%%" ) ),
        'nonce' => wp_create_nonce('theme'),
        'cart_url' => wc_get_cart_url(),
    )); 

}
add_action('wp_enqueue_scripts', 'avada_register_js_scripts');

add_action('wp_head', function () {
    // Patikriname, ar ACF įskiepis yra aktyvus
    if ( ! function_exists('get_field') ) {
        return; 
    }

    $dev_mode = get_field('dev_mode','option') ?? 0;
    $live_api_base_url = get_field('live_api_base_url','option') ?? '';
    $dev_api_base_url = get_field('dev_api_base_url','option') ?? '';
    $api_base_url = $dev_mode ? $live_api_base_url : $dev_api_base_url;

    $api_vars = array(
        'dev_mode' => $dev_mode,
        'api_base_url' => $api_base_url,
    );

    echo '<script>window.api_vars = ' . wp_json_encode($api_vars) . ';</script>';
}, 5);
