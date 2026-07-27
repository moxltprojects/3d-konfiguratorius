<?php

add_action('wp_ajax_render_config_furniture_content', 'render_config_furniture_content');
add_action('wp_ajax_nopriv_render_config_furniture_content', 'render_config_furniture_content');

function render_config_furniture_content() 
{
    if (!isset($_POST['product_id'])) {
        wp_send_json_error(['message' => 'Missing product data']);
    }

    // if (!isset($_POST['image_block_height_px'])) {
    //     wp_send_json_error(['message' => 'Missing image block height data']);
    // }

    $product_id = intval($_POST['product_id']);

    $config_ids = get_field('furniture', $product_id);

    if(!$config_ids || count($config_ids) == 0) return;
    
    // $image_block_height_px = intval($_POST['image_block_height_px']);

    $currency_symbol = get_woocommerce_currency_symbol();

    /*********** zoom *******/

    $model_default_zoom = 10;
    $model_zoom_min = 5;
    $model_zoom_min = 20;

    /******* Dimensions *********/
    $user_id = get_current_user_id();
    $config_id = isset($_POST['config_id']) ? $config_id : null;
    $saved_settings = get_current_settings($product_id, $config_id, $user_id);

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

    $default_frame_depth = (int) get_theme_mod('default_frame_depth', 16);
    $default_front_depth = (int) get_theme_mod('default_front_depth', 16);

    /******* Textures *********/
    list (
        $default_base_texture,
        $default_base_texture_id,
        $default_base_brim_texture,
        $default_base_brim_texture_id,
        $default_frame_texture,
        $default_frame_texture_id,
        $default_frame_brim_texture,
        $default_frame_brim_texture_id,
    ) = get_default_textures($saved_settings, $product_id);

    $default_base_texture_img = get_the_post_thumbnail_url($default_base_texture_id, 'thumbnail');
    $default_base__brim_texture_img = get_the_post_thumbnail_url($default_base_brim_texture_id, 'thumbnail');
    $default_frame_texture_img = get_the_post_thumbnail_url($default_frame_texture_id, 'thumbnail');
    $default_frame_brim_texture_img = get_the_post_thumbnail_url($default_frame_brim_texture_id, 'thumbnail');

    list($default_base_texture_price, $default_frame_texture_price) = get_furniture_texture_prices($default_base_texture_id, $default_frame_texture_id);

    list (
        $bottomItems,
        $bottom_corner_items,
        $topItems,
        $topCornerItems,
        $fullItems,
        $fullCornerItems
    ) = get_furniture_filtered_by_type($config_ids);

    $init_progress_step = 1;
    $image_file_name = 'config-image-'. $product_id .'__'. time() . '.png';

    ob_start();
    ?>

    <?php include __DIR__ .'/template-parts/index-loaded.php'; ?>

    <?php
    $content = ob_get_clean();

    list(
        $bottom_width_standard,
        $bottom_depth_standard,
        $top_width_standard,
        $top_depth_standard,
        $full_width_standard,
        $full_depth_standard
    ) = get_bottom_corner_furniture_dimensions($bottom_corner_items, $bottom_corner_item_id, $topCornerItems, $top_corner_item_id, $fullCornerItems, $full_corner_item_id);


    wp_send_json_success([
        'content' => $content,
        'config_id' => $saved_settings ? $saved_settings[2] : $config_id,
        'total' => $totals,
        'furniture_list' => $furniture_list_objects,
        'saved_settings' => $saved_settings,
        'display_image_files' => [
            'bottom' => $bottom_height_image,
            'top' => $top_height_image,
            'full' => $full_height_image,
        ],
        'default_furniture_dimensions' => [
            'largest_height_val' => $largest_height_val,
            'vertical_space' => $vertical_space_standard,
            'bottom' => [
                'height' => $bottom_height_standard,
                'min_height' => $bottom_height_min,
                'depth' => $bottom_full_depth_standard,
                'min_depth' => $bottom_full_depth_min,
            ],
            'top' => [
                'height' => $top_height_standard,
                'min_height' => $top_height_min,
                'depth' => $top_depth_standard,
                'min_depth' => $top_depth_min,
            ],
            'full' => [
                'height' => $full_height_standard,
                'min_height' => $full_height_min,
                'depth' => $bottom_full_depth_standard,
                'min_depth' => $bottom_full_depth_min,
            ],
        ],
        'corner_furniture_data' => [
            'furniture_id' => $bottom_corner_item_id,
            'default_width' => $bottom_width_standard,
            'default_depth' => $bottom_depth_standard,
            'bottom' => [
                'id' => $bottom_corner_item_id,
                'width' => $bottom_width_standard,
                'depth' => $bottom_depth_standard,
            ],
            'top' => [
                'id' => $top_corner_item_id,
                'width' => $top_width_standard,
                'depth' => $top_depth_standard,
            ],
            'full' => [
                'id' => $full_corner_item_id,
                'width' => $full_width_standard,
                'depth' => $full_depth_standard,
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
                'image' => $default_base_texture_img,
                'price' => $default_base_texture_price,
            ],
            'base_brim' => [
                'id' => $default_base_brim_texture_id,
                'image' => $default_base_brim_texture_img,
                'price' => $default_base_brim_texture_price,
            ],
            'frame' => [
                'id' => $default_frame_texture_id,
                'image' => $default_frame_texture_img,
                'price' => $default_frame_texture_price,
            ],
            'frame_brim' => [
                'id' => $default_frame_brim_texture_id,
                'image' => $default_frame_brim_texture_img,
                'price' => $default_frame_brim_texture_price,
            ],
        ],
    ]);
}


add_action('wp_ajax_add_furniture_item_to_config_settings', 'add_furniture_item_to_config_settings');
add_action('wp_ajax_nopriv_add_furniture_item_to_config_settings', 'add_furniture_item_to_config_settings');

function add_furniture_item_to_config_settings() 
{
    if (!isset($_POST['custom_id'])) {
        wp_send_json_error(['message' => 'Missing custom id']);
    }

    if (!isset($_POST['furniture_id'])) {
        wp_send_json_error(['message' => 'Missing product data']);
    }

    if (!isset($_POST['furniture_width'])) {
        wp_send_json_error(['message' => 'Missing furniture width data']);
    }

    if (!isset($_POST['furniture_position'])) {
        wp_send_json_error(['message' => 'Missing furniture position data']);
    }

    if (!isset($_POST['item_total'])) {
        wp_send_json_error(['message' => 'Missing item total data']);
    }

    global $template_parts_url;

    $furniture_id = intval($_POST['furniture_id']);
    $furniture_post = get_post( $furniture_id );

    if (!$furniture_post) {
        wp_send_json_error(['message' => 'Furniture post does not exist']);
    }

    $custom_id = intval($_POST['custom_id']);

    $item_width = isset($_POST['furniture_width']) ? $_POST['furniture_width'] : null;
    $height = intval($_POST['furniture_height']);
    $depth = intval($_POST['furniture_depth']);
    $furniture_position_mm = json_encode($_POST['furniture_position']);
    $item_total = number_format($_POST['item_total'], 2, '.', '');

    $item_type = get_furniture_type($furniture_id);
    $item_type_slug = $item_type->slug;
    $type = $item_type_slug;

    $width_obj = get_field('width', $furniture_id);
    $item_width_min = $width_obj['min'];
    $item_width_max = $width_obj['max'];

    if($item_width < $item_width_min || $item_width > $item_width_max) {
        $item_width = $item_width_min;
    }

    // $item_woocommerce = get_field('woocommerce', $furniture_id);
    // $price = floatval($item_woocommewoocommerce['regular_price']);
    // $price = round(floatval($price > 0 ? $price : 0), 2);
    // $price_cm3 = floatval($item_woocommerce['price_for_cm3']);
    // $price_cm3 = round(floatval($price_cm3 > 0 ? $price_cm3 : 0), 2);
    // $discount_price = floatval($item_woocommerce['discount_price']);
    // $discount_price = round(floatval($discount_price > 0 ? $discount_price: 0), 2);
    // $discount_price_cm3 = 0;
    // $item_price = $discount_price > 0 ? $discount_price : $price;
    // $item_price_cm3 = $discount_price_cm3 > 0 ? $discount_price_cm3 : $price_cm3;

    list(
        $display_price,
        $regular_price,
        $discount_price,
        $display_price_cm3,
        $regular_price_cm3,
        $discount_price_cm3,
    ) = get_item_prices($furniture_id);
    // list(
    //     $item_total,
    //     $display_price,
    //     $regular_price,
    //     $discount_price,
    //     $display_price_cm3,
    //     $regular_price_cm3,
    //     $discount_price_cm3
    // ) = calculateItemPrice(
    //     $furniture_id, 
    //     $item_width_min, 
    //     $height_min, 
    //     $depth_min,
    //     $item_width,
    //     $height,
    //     $depth
    // );

    $currency_symbol = get_woocommerce_currency_symbol();


    ob_start();
    include __DIR__ .'/template-parts/play-edit/cabinets/my-cabinet-item.php'; 
    $my_content = ob_get_clean();

    ob_start();
    include __DIR__ .'/template-parts/summary/summary-cabinet-item.php'; 
    $summary_content = ob_get_clean();


    wp_send_json_success([
        'my_item_html' => $my_content,
        'summary_item_html' => $summary_content,
    ]);
}


add_action('wp_ajax_save_config_settings', 'save_config_settings');
add_action('wp_ajax_nopriv_save_config_settings', 'save_config_settings');

function save_config_settings() 
{
    $user_id = get_current_user_id();

    if(!$user_id) {
        wp_send_json_error(['message' => 'User not logged in']);
    }

    $main_settings = isset($_POST['main_settings']) ? json_decode(stripslashes($_POST['main_settings']), true) : null;
    $furniture_list = isset($_POST['furniture_list']) ? json_decode(stripslashes($_POST['furniture_list']), true) : null;
    $config_id = isset($_POST['config_id']) ? intval($_POST['config_id']) : null;

    if($main_settings) {
        if($config_id > 0) {
            $updated = update_existing_settings($config_id, $user_id, $main_settings);

            if(!$updated) {
                wp_send_json_error(['message' => 'Failed updating the settings']);
            }
        } else {
            $config_id = create_new_settings($user_id, $main_settings);
        }
    }

    if(!$config_id) {
        wp_send_json_error(['message' => 'Missing configurator item']);
    }
         
    if(!is_null($furniture_list)) {
        $successfully_added = add_furniture_to_settings_config($config_id, $furniture_list);

        if(!$successfully_added) {
            wp_send_json_error(['message' => 'Failed saving furniture items.']);
        }
    }

    wp_send_json_success([
        'message' => 'Saved!',
        'config_id' => $config_id,
        'furniture_list' => get_current_settings_furniture_list($config_id),
    ]);
}


add_action('wp_ajax_custom_ajax_add_to_cart', 'custom_ajax_add_to_cart');
add_action('wp_ajax_nopriv_custom_ajax_add_to_cart', 'custom_ajax_add_to_cart'); // Allow guests

function custom_ajax_add_to_cart() {

    if (!isset($_POST['user_id'])) {
        wp_send_json_error(['message' => 'Missing user data']);
    }

    if (!isset($_POST['config_id'])) {
        wp_send_json_error(['message' => 'Missing config data']);
    }

    if (!isset($_POST['product_id'])) {
        wp_send_json_error(['message' => 'Missing product data']);
    }

    if (!isset($_POST['main_settings'])) {
        wp_send_json_error(['message' => 'No settings data']);
    }

    if (!isset($_POST['furniture_list'])) {
        wp_send_json_error(['message' => 'No furniture data']);
    }

    $user_id = intval($_POST['user_id']);
    $main_settings = json_decode(stripslashes($_POST['main_settings']));
    $furniture_list = json_decode(stripslashes($_POST['furniture_list']));
    $product_id = intval($_POST['product_id']);
    $quantity = 1;
    $thumbnail_name = 'config-image-'. time() . '.png';

    $thumbnail_file_url = save_image($thumbnail_name);

    $cart_item_data = [
        'config_totals' => null,
        'main_settings' => $main_settings,
        'furniture_list' => $furniture_list,
        'config_thumbnail_url' => $thumbnail_file_url,
    ];

    $cart_item_key = WC()->cart->add_to_cart($product_id, $quantity, 0, [], $cart_item_data);

    if ($cart_item_key) {
        wp_send_json_success([
            'message' => 'Product added successfully!',
        ]);
    } else {
        wp_send_json_error(['message' => 'Failed to add product.']);
    }
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

add_action('wp_ajax_nopriv_ajax_login', 'ajax_login'); // not logged in
add_action('wp_ajax_ajax_login', 'ajax_login');  
function ajax_login() {
    check_ajax_referer('ajax-login-nonce', 'security');

    $info = [];
    $info['user_login']    = sanitize_user($_POST['username']);
    $info['user_password'] = $_POST['password'];
    $info['remember']      = true;

    $user = wp_signon($info, false);

    if (is_wp_error($user)) {
        wp_send_json_error(['message' => 'Invalid username or password.']);
    } else {
        wp_send_json_success([
            'user_id' => $user->ID,
            'message' => 'Login successful!'
        ]);
    }
}

add_action('wp_ajax_nopriv_ajax_register', 'ajax_register');
add_action('wp_ajax_ajax_register', 'ajax_register'); 
function ajax_register() {
    check_ajax_referer('ajax-login-nonce', 'security');

    $username = sanitize_user($_POST['username']);
    $email    = sanitize_email($_POST['email']);
    $password = $_POST['password'];

    if (username_exists($username) || email_exists($email)) {
        wp_send_json_error(['message' => 'Username or email already exists.']);
    }

    $user_id = wp_create_user($username, $password, $email);

    if (is_wp_error($user_id)) {
        wp_send_json_error(['message' => 'Registration failed.']);
    }

    // Optionally auto-login new users
    wp_set_current_user($user_id);
    wp_set_auth_cookie($user_id);

    wp_send_json_success([
        'user_id' => $user_id,
        'message' => 'Registration successful!'
    ]);
}
