<?php 

/******** change price for specific users ********/

add_action('woocommerce_before_calculate_totals', 'custom_update_cart_price');
function custom_update_cart_price($cart) {
    if (is_admin() && !defined('DOING_AJAX')) return; // Prevent changes in the admin panel

    foreach ($cart->get_cart() as $cart_item_key => &$cart_item) {
        $product = $cart_item['data'];
        $product_id = $cart_item['product_id']; 
        $product_type = get_field('config_type', $product_id);

        if($product_type != 'Draggable config') continue;

        $price = $product->get_regular_price();
        if (isset($cart_item['furniture_list']) && $cart_item['furniture_list'] !== '') {
            $main_settings = $cart_item['main_settings'];  
            $furniture_list = $cart_item['furniture_list'];  

            if(is_checkout()) {
                list($main_settings, $furniture_list, $total) = calculate_and_save_furniture_price($main_settings, $furniture_list);
                
                WC()->cart->cart_contents[$cart_item_key]['product_type']  = $product_type;
                WC()->cart->cart_contents[$cart_item_key]['config_totals']  = $total;
                WC()->cart->cart_contents[$cart_item_key]['main_settings']  = $main_settings;
                WC()->cart->cart_contents[$cart_item_key]['furniture_list'] = $furniture_list;
                
                $price = $total;
            } else {
                $default_base_texture_id = $main_settings->base_color_id;
                $default_frame_texture_id = $main_settings->frame_color_id;

                list($total) = calculate_furniture_price($main_settings, $furniture_list, $default_base_texture_id, $default_frame_texture_id);
                $price = $total;
            }

        }

        $product->set_price($price);
    }
}

add_filter('woocommerce_cart_item_thumbnail', 'replace_product_image_in_cart', 10, 3);
function replace_product_image_in_cart($image, $cart_item, $cart_item_key) {
    if (isset($cart_item['config_thumbnail_url']) && $cart_item['config_thumbnail_url']) { 
        $custom_image_url = $cart_item['config_thumbnail_url'];  
        $image = '<img src="' . $custom_image_url . '" alt="Custom Image" />';
    }
    return $image;
}

add_filter('woocommerce_order_item_get_formatted_meta_data', 'hide_custom_order_item_meta', 10, 2);

function hide_custom_order_item_meta($formatted_meta, $item) {
    foreach ($formatted_meta as $key => $meta) {
        if (in_array($meta->key, array(
            '_product_type',
            '_main_settings',
            '_furniture_list',
            '_config_totals',
            '_config_thumbnail_url',
			'_xml_file_url'
        ))) {
            unset($formatted_meta[$key]);
        }
    }

    return $formatted_meta;
}

add_action('woocommerce_checkout_create_order_line_item', 'save_custom_cart_data_to_order_item', 20, 4);

function save_custom_cart_data_to_order_item($item, $cart_item_key, $values, $order) {
    $main_settings = isset($values['main_settings']) ? $values['main_settings'] : null;
    $furniture_list = isset($values['furniture_list']) ? $values['furniture_list']: null;

    if(!$main_settings || !$furniture_list) return;

    $item->add_meta_data('_product_type', $values['product_type']);

    $xml_file_url = generate_xml_file($main_settings, $furniture_list);
    $item->add_meta_data('_xml_file_url', $xml_file_url);

    $item->add_meta_data('_main_settings', $values['main_settings']);
    $item->add_meta_data('_furniture_list', $values['furniture_list']);

    $item->add_meta_data('_config_totals', $values['config_totals']);

    if (isset($values['config_thumbnail_url'])) {
        $item->add_meta_data('_config_thumbnail_url', $values['config_thumbnail_url']);
    }
}

add_action('woocommerce_order_status_completed', 'on_order_payment_complete');

function on_order_payment_complete($order_id) {
    $order = wc_get_order($order_id);

    foreach ($order->get_items() as $item_id => $item) {
        $xml_file_url = $item->get_meta('_xml_file_url');

        if ($xml_file_url) {
			add_order_id_to_xml($xml_file_url, $order_id);
        }
    }
}


