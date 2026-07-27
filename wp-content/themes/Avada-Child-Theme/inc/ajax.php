<?php 

add_action('wp_ajax_get_product_taxonomy_terms', 'get_product_taxonomy_terms_callback');
add_action('wp_ajax_nopriv_get_product_taxonomy_terms', 'get_product_taxonomy_terms_callback');

function get_product_taxonomy_terms_callback() {
    if (empty($_POST['taxonomy'])) wp_send_json_error();

    $taxonomy = sanitize_text_field($_POST['taxonomy']);
    $terms = my_get_product_taxonomy_terms(['product_taxonomy' => $taxonomy]);

    wp_send_json_success($terms);
}