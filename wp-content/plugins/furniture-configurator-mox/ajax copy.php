<?php

add_action('wp_ajax_render_config_furniture_content', 'render_config_furniture_content');
add_action('wp_ajax_nopriv_render_config_furniture_content', 'render_config_furniture_content');

function render_config_furniture_content() 
{
    if (!isset($_POST['product_id'])) {
        wp_send_json_error(['message' => 'Missing product data']);
    }

    if (!isset($_POST['image_block_height_px'])) {
        wp_send_json_error(['message' => 'Missing image block height data']);
    }

    $product_id = intval($_POST['product_id']);

    $config_ids = get_field('furniture', $product_id);

    if(!$config_ids || count($config_ids) == 0) return;
    
    $image_block_height_px = intval($_POST['image_block_height_px']);

    $currency_symbol = get_woocommerce_currency_symbol();

    /*********** zoom *******/

    $model_default_zoom = 10;
    $model_zoom_min = 5;
    $model_zoom_min = 20;


    /******* Dimensions *********/

    $saved_settings = get_current_settings($product_id);

    list (
        $furniture_list,
        $default_room_layout,

        $wall_height_min,
        $wall_height_max,
        $wall_height_standard,

        $wall_width_min,
        $wall_width_max,
        $wall_width_standard,

        $wall_depth_min,
        $wall_depth_max,
        $wall_depth_standard,

        $bottom_full_depth_standard,
        $bottom_full_depth_min,
        $bottom_full_depth_max,
        $top_depth_standard,
        $top_depth_min,
        $top_depth_max,

        $bottom_height_standard,
        $bottom_height_min,
        $bottom_height_max,
        $bottom_height_image,

        $top_height_standard,
        $top_height_min,
        $top_height_max,
        $top_height_image,

        $full_height_standard,
        $full_height_min,
        $full_height_max,
        $full_height_image,
        $largest_height_val,

        $vertical_space_standard,
        $vertical_space_min,
        $vertical_space_max,
    ) = get_default_dimensions($saved_settings, $product_id);

    /******* Textures *********/
    list (
        $default_base_texture,
        $default_base_texture_id,
        $default_frame_texture,
        $default_frame_texture_id,
    ) = get_default_textures($saved_settings, $product_id);

    $default_base_texture_img = get_the_post_thumbnail_url($default_base_texture_id, 'thumbnail');
    $default_frame_texture_img = get_the_post_thumbnail_url($default_frame_texture_id, 'thumbnail');

    list($total, $furniture_list_objects) = calculate_furniture_price($furniture_list, $default_base_texture_id, $default_frame_texture_id);

    $init_progress_step = 1;
    $image_file_name = 'config-image-'. $product_id .'__'. time() . '.png';

    ob_start();
    ?>

    <?php include __DIR__ .'/template-parts/index-loaded.php'; ?>

    <?php
    $content = ob_get_clean();

    wp_send_json_success([
        'content' => $content,
        'config_id' => $saved_settings ? $saved_settings[2] : null,
        'furniture_list' => $furniture_list_objects,
        'saved_settings' => $saved_settings,
        'image_file_name' => $image_file_name,
        'default_furniture_dimensions' => [
            'largest_height_val' => $largest_height_val,
            'vertical_space' => $vertical_space_standard,
            'bottom' => [
                'height' => $bottom_height_standard,
                'depth' => $bottom_full_depth_standard,
            ],
            'top' => [
                'height' => $top_height_standard,
                'depth' => $top_depth_standard,
            ],
            'full' => [
                'height' => $full_height_standard,
                'depth' => $bottom_full_depth_standard,
            ],
        ],
        'room_dimensions' => [
            'height' => $wall_height_standard,
            'depth' => $wall_depth_standard,
            'width' => $wall_width_standard,
        ],
        'textures' => [
            'base' => [
                'id' => $default_base_texture_id,
                'image' => $default_base_texture_img
            ],
            'frame' => [
                'id' => $default_frame_texture_id,
                'image' => $default_frame_texture_img
            ],
        ],
    ]);
}


add_action('wp_ajax_add_furniture_to_config_settings', 'add_furniture_to_config_settings');
add_action('wp_ajax_nopriv_add_furniture_to_config_settings', 'add_furniture_to_config_settings');

function add_furniture_to_config_settings() 
{
    if (!isset($_POST['product_id'])) {
        wp_send_json_error(['message' => 'Missing product data']);
    }

    if (!isset($_POST['furniture_id'])) {
        wp_send_json_error(['message' => 'Missing product data']);
    }

    if (!isset($_POST['furniture_width'])) {
        wp_send_json_error(['message' => 'Missing furniture width data']);
    }

    global $template_parts_url;

    $config_id = isset($_POST['config_id']) ? $_POST['config_id'] : null;
    $furniture_id = intval($_POST['furniture_id']);
    $product_id = intval($_POST['product_id']);

    $default_base_texture_id = intval($_POST['base_texture_id']);
    $default_frame_texture_id = intval($_POST['frame_texture_id']);

    $furniture_width = isset($_POST['furniture_width']) ? $_POST['furniture_width'] : null;

    $room_type = $_POST['room_type'];
    $room_height = intval($_POST['room_height']);
    $room_width = intval($_POST['room_width']);
    $room_depth = intval($_POST['room_depth']);

    $bottom_height_standard = intval($_POST['bottom_height']);
    $top_height_standard = intval($_POST['top_height']);
    $full_height_standard = intval($_POST['full_height']);
    $bottom_full_depth_standard = intval($_POST['bottom_full_depth']);
    $top_depth_standard = intval($_POST['top_depth']);
    $vertical_space = intval($_POST['vertical_space']);

    // $bottom_height_min = intval($_POST['bottom_height_min']);
    // $bottom_height_max = intval($_POST['bottom_height_max']);
    // $top_height_min = intval($_POST['top_height_min']);
    // $top_height_max = intval($_POST['top_height_max']);
    // $full_height_min = intval($_POST['full_height_min']);
    // $full_height_max = intval($_POST['full_height_max']);
    // $bottom_full_depth_min = intval($_POST['bottom_full_depth_min']);
    // $bottom_full_depth_max = intval($_POST['bottom_full_depth_max']);
    // $top_depth_min = intval($_POST['top_depth_min']);
    // $top_depth_max = intval($_POST['top_depth_max']);


    if($config_id) {
        $furniture_list_objects = add_furniture_to_settings_config($config_id, $furniture_id, $furniture_width);
    } else {
        $furniture_list_objects = create_new_settings(
            $product_id, 
            $furniture_id, 
            $default_base_texture_id,
            $default_frame_texture_id,
            $room_type,
            $room_height,
            $room_width,
            $room_depth,
            $bottom_full_depth_standard,
            $top_depth_standard,
            $bottom_height_standard,
            $top_height_standard,
            $full_height_standard,
            $furniture_width,
            $vertical_space
        );
    }

    $furniture_list = get_current_settings_furniture_list($config_id);
    $currency_symbol = get_woocommerce_currency_symbol();

    list($total, $furniture_list_objects) = calculate_furniture_price($furniture_list, $default_base_texture_id, $default_frame_texture_id);

    ob_start();
    ?>

    <?php include __DIR__ .'/template-parts/play-edit/cabinets/my-cabinet-item.php'; ?>

    <?php
    $content = ob_get_clean();

    $total = 

    wp_send_json_success([
        'item_html' => $content,
        'total' => $total,
    ]);
}


add_action('wp_ajax_save_config_furniture_canvas', 'save_config_furniture_canvas');
add_action('wp_ajax_nopriv_save_config_furniture_canvas', 'save_config_furniture_canvas');

function save_config_furniture_canvas() 
{
    if (!isset($_POST['canvas_content'])) {
        wp_send_json_error(['message' => 'Missing image']);
    }

    if (!isset($_POST['image_file_name'])) {
        wp_send_json_error(['message' => 'Missing image filename']);
    }

    $canvas_content = sanitize_text_field($_POST['canvas_content']);
    $image_file_name = sanitize_text_field($_POST['image_file_name']);

    $image_file_url = save_canvas_image($canvas_content, $image_file_name);

    $image_html = $image_file_url ? '<div class="image-block"><img src="'. $image_file_url .'"/></div>' : '';

    wp_send_json_success([
        'image_html' => $image_html,
    ]);
}

add_action('wp_ajax_change_image_html_display', 'change_image_html_display');
add_action('wp_ajax_nopriv_change_image_html_display', 'change_image_html_display');

function change_image_html_display() 
{
    if (!isset($_POST['image_html'])) {
        wp_send_json_error(['message' => 'Missing image data']);
    }

    if (!isset($_POST['data_type'])) {
        wp_send_json_error(['message' => 'Missing data type']);
    }

    if (!isset($_POST['value_type'])) {
        wp_send_json_error(['message' => 'Missing value type']);
    }

    if (!isset($_POST['value'])) {
        wp_send_json_error(['message' => 'Missing value']);
    }

    if (!isset($_POST['product_id'])) {
        wp_send_json_error(['message' => 'Missing product id']);
    }

    if (!isset($_POST['furniture_id'])) {
        wp_send_json_error(['message' => 'Missing furniture id']);
    }

    if (!isset($_POST['front_texture_id']) || !isset($_POST['corpus_texture_id'])) {
        wp_send_json_error(['message' => 'Missing texture data']);
    }

    $product_id = intval($_POST['product_id']);
    $furniture_id = intval($_POST['furniture_id']);  
    $front_texture_id = intval($_POST['front_texture_id']);   
    $corpus_texture_id = intval($_POST['corpus_texture_id']);   
    $data_type = sanitize_text_field($_POST['data_type']);
    $value_type = sanitize_text_field($_POST['value_type']);
    $value = sanitize_text_field($_POST['value']);
    $image_html = wp_kses_post($_POST['image_html']);

    $new_image_html = $image_html;
    $data = [];

    if($data_type === 'dimensions') {
        if (!isset($_POST['max_value'])) {
            wp_send_json_error(['message' => 'Missing max value']);
        }

        if (!isset($_POST['image_block_width_px'])) {
            wp_send_json_error(['message' => 'Missing dimensions']);
        }

        $image_block_width_px = floatval($_POST['image_block_width_px']);
        
        $value = (int) ($value);  
        $max_value = (int) $_POST['max_value'];  
        list($new_image_html, $value_percentage) = render_furniture_image_block_with_dimensions_data($image_html, $furniture_id, $image_block_width_px, $value_type, $value, $max_value);
        $data['value_percentage'] = $value_percentage;
    } else {
        list($new_image_html, $texture_data) = render_furniture_image_block_with_texture_data($image_html, $value_type, $value);
        
        $data['texture_data'] = $texture_data;
    } 

    $data['image_html'] = $new_image_html;
    $data['price'] = calculate_furniture_price($product_id, $furniture_id, $front_texture_id, $corpus_texture_id);
    ?>

    <?php
    wp_send_json_success($data);
}


add_action('wp_ajax_config_furniture_addtocart', 'config_furniture_addtocart');
add_action('wp_ajax_nopriv_config_furniture_addtocart', 'config_furniture_addtocart'); 

function config_furniture_addtocart() {
    if (!isset($_POST['product_id']) || !isset($_POST['furniture_id'])) {
        wp_send_json_error(['message' => 'Missing product data']);
    }
    
    $quantity = 1;
    $product_id = intval($_POST['product_id']);
    $furniture_id = intval($_POST['furniture_id']);
    $width = floatval($_POST['width']);
    $height = floatval($_POST['height']);
    $depth = floatval($_POST['depth']);
    $front_texture_id = sanitize_text_field($_POST['front_texture_id']);
    $corpus_texture_id = sanitize_text_field($_POST['corpus_texture_id']);
    $thumbnail_url = sanitize_text_field($_POST['thumbnail_url']);

    list($total, $front_price_total, $corpus_price_total) = calculate_furniture_price($product_id, $furniture_id, $front_texture_id, $corpus_texture_id);
    $xml_file_url = generate_xml($product_id, $furniture_id, $height, $width, $depth, $front_texture_id, $corpus_texture_id);
    
    $cart_item_data = [
        'config_items' => [$furniture_id],
        'dimensions' => [
            'width' => $width,
            'height' => $height,
            'depth' => $depth,
        ],
        'textures' => [
            'front' => $front_texture_id,
            'corpus' => $corpus_texture_id,
        ],
        'config_totals' => [
            'front_texture' => $front_price_total,
            'corpus_texture' => $corpus_price_total,
            'total' => $totals,
        ],
        'total' => $totals,
        'config_thumbnail_url' => $thumbnail_url,
        'xml_file_url' => $xml_file_url,
    ];

    $cart_item_key = WC()->cart->add_to_cart($product_id, $quantity, 0, [], $cart_item_data);

    if ($cart_item_key) {
        wp_send_json_success([
            'cart_count' => WC()->cart->get_cart_contents_count(),
        ]);
    } else {
        wp_send_json_error(['message' => 'Failed to add product.']);
    }
}



