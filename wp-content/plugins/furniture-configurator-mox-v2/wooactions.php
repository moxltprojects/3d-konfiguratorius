<?php 

// // 1. Capture main_settings when adding to cart (via AJAX or normal add)
// add_filter('woocommerce_add_cart_item_data', function ($cart_item_data, $product_id, $variation_id) {
//     if (isset($_POST['main_settings'])) {
//         $main_settings = json_decode(stripslashes($_POST['main_settings']), true);

//         if (!empty($main_settings)) {
//             // Store settings in cart item
//             $cart_item_data['main_settings'] = $main_settings;

//             // Create a unique hash based on settings
//             $cart_item_data['unique_key'] = md5(json_encode($main_settings));
//         }
//     }
//     return $cart_item_data;
// }, 10, 3);

// 2. Make sure WooCommerce uses our unique hash when generating cart ID
add_filter('woocommerce_cart_id', function($cart_id, $product_id, $variation_id, $variation, $cart_item_data) {

    if ( isset($cart_item_data['merge_key']) ) {
        return $cart_id . '_' . $cart_item_data['merge_key'];
    }

    return $cart_id;

}, 10, 5);

// // 3. Show settings inside Cart/Checkout (optional)
// add_filter('woocommerce_get_item_data', function ($item_data, $cart_item) {

//     if(is_checkout()) return;

//     if (!empty($cart_item['config_settings'])) {
//         $config_settings   = $cart_item['config_settings'];

//         $db_data = $config_settings['db_data'] ?? null;
//         $general_settings = $config_settings['general_settings'] ?? null;

//         if(!$db_data) return;

//         if(isset($db_data['width'])) {
//             $width = $db_data['width'];
//             $height = $db_data['height'];
//             $depth = $db_data['depth'];
//             $item_data[] = [
//                 'display' => '<div class="dimensions-container"><p>'
//                            . sprintf(__(
//                                 '<strong>H: </strong>%s, <strong>W: </strong>%s, <strong>D: </strong>%s', 
//                                 'furniture-config'), 
//                                 $height,
//                                 $width,
//                                 $depth,
//                             )
//                            . '</p></div>',
//             ];
//         }

//         if(isset($general_settings['brand_texture']) && !empty($general_settings['brand_texture'])) {
//             $brand_texture = $general_settings['brand_texture'];

//             $brandContent = '<div class="brand-texture-container">'
//                 . '<p><strong>Brand Texture:</strong></p>';

//             if(isset($brand_texture['color'])) {
//                 $brandContent .= '<div class="color-block" style="background-color:'. $brand_texture['color'] .'"></div></div>';

//                 $item_data[] = [
//                     'display' => $brandContent,
//                 ];
//             } else if(isset($brand_texture['attachment']->attachment_id)) {
//                 $image_url = wp_get_attachment_url(
//                     $brand_texture['attachment']->attachment_id
//                 );

//                 $brandContent .= '
//                     <div>
//                         <img 
//                             src="' . esc_url($image_url) . '" 
//                         >
//                     </div>
//                 </div>';

//                 $item_data[] = [
//                     'display' => $brandContent,
//                 ];
//             }
//         }

//         if(isset($general_settings['textures'])) {
//             $textures = $general_settings['textures'];

//             foreach($textures as $texture) {
//                 $texture = (array) $texture;
//                 $texture_id = $texture['id'];
//                 $typeName = '';

//                 if(isset($texture['type'])) {
//                     $typeSlug = $texture['type'];
//                     $term = get_furniture_type_by_slug($typeSlug);
      
//                     if($term && !is_wp_error($term)) {
//                         $typeName = $term->name;
//                     }
//                 } else {
//                     $types = get_the_terms($texture_id, 'furniture-texture-type');
//                     $typeName = '';
//                     if(!empty($types[0])) {
//                         $typeName = $types[0]->name;
//                     }
//                 }
                
//                 $item_data[] = [
//                     'display' => '<div class="texture-container">'
//                             . '<p><strong>'. $typeName .':</strong></p>' 
//                             . get_the_post_thumbnail($texture_id, 'thumbnail')
//                             . '<p class="heading">'. esc_html(get_the_title($texture_id)) . '</p>'
//                             . '</div>',
//                 ];
//             }
//         }

//         if(isset($general_settings['components'])) {
//             $components = $general_settings['components'];
//             $components_html = '';

//             foreach($components as $key => $component) {
//                 $children = $component['children'];
//                 if(empty($children)) {
//                     continue;
//                 }
//                 $parent_id = $children[0]['parent_id'];
//                 $component_term = get_term($parent_id, 'furniture-component-category');
//                 if (is_wp_error($component_term) || empty($component_term)) {
//                     continue;
//                 } 

//                 $term_name = $component_term->name;
//                 $components_html .= '<div class="component-item"><p><strong>'. $term_name .'</strong></p>';
//                 $children_names = [];
//                 foreach($children as $child) {
//                     $id = $child['id'];
//                     $title = get_the_title($id);
//                     $children_names[] = $title;
//                 }
//                 $children_names_html = implode(', ', $children_names);
//                 $components_html .= '<p>'. $children_names_html. '</p></div>';
//             }

//             $item_data[] = [
//                 'display' =>  '<div class="furniture-container">'
//                            . $components_html
//                            . '</div>',
//             ];
//         }

//         if(isset($general_settings['product_components'])) {
//             $components = $general_settings['product_components'];
//             $components_html = '<div><p><strong>Product Specific Components</strong></p>';

//             foreach($components as $key => $component) {
              
//                 if(isset($component['id'])) {
//                     $parent_id = $component['id'];

//                     if(!$parent_id) {
//                         continue;
//                     }
//                     $components_html .= '<div class="component-item"><p><strong>'. get_the_title($parent_id) .'</strong></p>';
//                 } else {
//                     $children = $component['children'];
//                     $parent_id = $component['parent_id'];
//                     $components_html .= '<div class="component-item"><p><strong>'. get_the_title($parent_id) .': </strong>';

//                     if(!empty($children)) {
//                         $children_names = [];
//                         foreach($children as $child) {
//                             $id = $child['id'];
//                             $title = get_the_title($id);
//                             $children_names[] = $title;
//                         }
//                         $children_names_html = implode(', ', $children_names);
//                         $components_html .= '<span>'. $children_names_html. '</span>';
//                     } 

//                     $components_html .= '</p>';
//                 }
               
//             }

//             $item_data[] = [
//                 'display' =>  '<div class="furniture-container">'
//                            . $components_html
//                            . '</div>',
//             ];
//         }
//     }
//     return $item_data;
// }, 10, 2);

add_filter('woocommerce_get_item_data', function ($item_data, $cart_item) {

    if (is_checkout()) {
        return $item_data;
    }

    if (empty($cart_item['config_settings'])) {
        return $item_data;
    }

    $config_settings  = $cart_item['config_settings'];
    $db_data          = $config_settings['db_data'] ?? null;
    $general_settings = $config_settings['general_settings'] ?? null;

    if (!$db_data) {
        return $item_data;
    }

    $db_data = (array) $db_data;

    /**
     * Dimensions
     */
    if (isset($db_data['width'], $db_data['height'], $db_data['depth'])) {
        $item_data[] = [
            'name'    => __('Dimensions', 'furniture-config'),
            'display' => sprintf(
                '<span class="fc-dimensions">H: %s, W: %s, D: %s</span>',
                esc_html($db_data['height']),
                esc_html($db_data['width']),
                esc_html($db_data['depth'])
            ),
        ];
    }

    if (empty($general_settings)) {
        return $item_data;
    }

    $general_settings = (array) $general_settings;

    /**
     * Brand texture
     */
    if (!empty($general_settings['brand_texture'])) {
        $brand_texture = (array) $general_settings['brand_texture'];

        if (!empty($brand_texture['color'])) {
            $item_data[] = [
                'name'    => __('Brand Texture', 'furniture-config'),
                'display' => sprintf(
                    '<span class="fc-color-block" style="background-color:%s"></span>',
                    esc_attr($brand_texture['color'])
                ),
            ];
        } elseif (!empty($brand_texture['attachment'])) {
            $attachment = (array) $brand_texture['attachment'];
            $attachment_id = $attachment['attachment_id'] ?? null;

            if ($attachment_id) {
                $image_url = wp_get_attachment_url((int) $attachment_id);

                if ($image_url) {
                    $item_data[] = [
                        'name'    => __('Brand Texture', 'furniture-config'),
                        'display' => sprintf(
                            '<span class="fc-cart-image">
                                <img src="%s" alt="">
                            </span>',
                            esc_url($image_url)
                        ),
                    ];
                }
            }
        }
    }

    /**
     * Textures
     */
    if (!empty($general_settings['textures'])) {
        foreach ($general_settings['textures'] as $texture) {
            $texture = (array) $texture;

            if (empty($texture['id'])) {
                continue;
            }

            $texture_id = (int) $texture['id'];
            $typeName = '';

            if (!empty($texture['type'])) {
                $term = get_furniture_type_by_slug($texture['type']);

                if ($term && !is_wp_error($term)) {
                    $typeName = $term->name;
                }
            } else {
                $types = get_the_terms($texture_id, 'furniture-texture-type');

                if (!empty($types[0])) {
                    $typeName = $types[0]->name;
                }
            }

            $item_data[] = [
                'name'    => esc_html($typeName ?: __('Texture', 'furniture-config')),
                'display' => sprintf(
                    '<span class="fc-cart-texture">
                        %s
                        <span class="fc-cart-texture-title">%s</span>
                    </span>',
                    get_the_post_thumbnail($texture_id, 'thumbnail'),
                    esc_html(get_the_title($texture_id))
                ),
            ];
        }
    }

    /**
     * General components
     */
    if (!empty($general_settings['components'])) {
        foreach ($general_settings['components'] as $component) {
            $component = (array) $component;
            $children = $component['children'] ?? [];

            if (empty($children)) {
                continue;
            }

            $first_child = (array) $children[0];
            $parent_id = $first_child['parent_id'] ?? null;

            if (!$parent_id) {
                continue;
            }

            $component_term = get_term($parent_id, 'furniture-component-category');

            if (is_wp_error($component_term) || empty($component_term)) {
                continue;
            }

            $children_names = [];

            foreach ($children as $child) {
                $child = (array) $child;

                if (!empty($child['id'])) {
                    $children_names[] = get_the_title((int) $child['id']);
                }
            }

            if (!empty($children_names)) {
                $item_data[] = [
                    'name'    => esc_html($component_term->name),
                    'display' => esc_html(implode(', ', $children_names)),
                ];
            }
        }
    }

    /**
     * Product-specific components
     */
    if (!empty($general_settings['product_components'])) {
        foreach ($general_settings['product_components'] as $component) {
            $component = (array) $component;

            if (!empty($component['id'])) {
                $item_data[] = [
                    'name'    => __('Product Component', 'furniture-config'),
                    'display' => esc_html(get_the_title((int) $component['id'])),
                ];

                continue;
            }

            $parent_id = $component['parent_id'] ?? null;
            $children = $component['children'] ?? [];

            if (!$parent_id) {
                continue;
            }

            $children_names = [];

            foreach ($children as $child) {
                $child = (array) $child;

                if (!empty($child['id'])) {
                    $children_names[] = get_the_title((int) $child['id']);
                }
            }

            $item_data[] = [
                'name'    => esc_html(get_the_title((int) $parent_id)),
                'display' => esc_html(implode(', ', $children_names)),
            ];
        }
    }

    return $item_data;

}, 10, 2);

add_filter('woocommerce_cart_item_name', 'furniture_data_above_title', 10, 3);
function furniture_data_above_title($product_name, $cart_item, $cart_item_key) {

    if (!isset($cart_item['config_id']) || empty($cart_item['config_id'])) {
        return $product_name;
    }

    $configId = $cart_item['config_id'];
    $homeUrl = home_url() . '/configurator?id='. $configId;
    $custom_html = "<p class='config-id'><a href='$homeUrl' target='_blank'><strong>Config ID:</strong> $configId</a></p>";

    return $custom_html . $product_name;
}


add_filter('woocommerce_order_item_display_meta_value', function ($display_value, $meta, $item) {
    if ($meta->key === '_base_color_id' || $meta->key === '_frame_color_id') {
        $texture_id = intval($meta->value);
        $label      = $meta->key === '_base_color_id' ? 'Base' : 'Frame';

        $display_value = '<div class="texture-container">'
                       . '<p><strong>' . esc_html($label) . ':</strong></p>'
                       . '<p class="heading">' . esc_html(get_the_title($texture_id)) . '</p>'
                       . get_the_post_thumbnail($texture_id, 'thumbnail')
                       . '</div>';
    }
    return $display_value;
}, 10, 3);

/******** change price for specific users ********/

add_filter('woocommerce_cart_item_price', 'config_3d_display_custom_cart_item_price', 9999, 3);
add_filter('woocommerce_cart_item_subtotal', 'config_3d_display_custom_cart_item_subtotal', 9999, 3);

function config_3d_display_custom_cart_item_price($price_html, $cart_item, $cart_item_key) {
    if (
        isset($cart_item['cart_prices']['active']) &&
        is_numeric($cart_item['cart_prices']['active'])
    ) {
        return wc_price((float) $cart_item['cart_prices']['active']);
    }

    return $price_html;
}

function config_3d_display_custom_cart_item_subtotal($subtotal_html, $cart_item, $cart_item_key) {
    if (
        isset($cart_item['cart_prices']['active']) &&
        is_numeric($cart_item['cart_prices']['active'])
    ) {
        $price = (float) $cart_item['cart_prices']['active'];
        $qty   = isset($cart_item['quantity']) ? (int) $cart_item['quantity'] : 1;

        return wc_price($price * $qty);
    }

    return $subtotal_html;
}

add_action('woocommerce_before_calculate_totals', 'apply_custom_cart_item_price', 9999);

function apply_custom_cart_item_price($cart) {

    if (is_admin() && !defined('DOING_AJAX')) {
        return;
    }

    if (!$cart || $cart->is_empty()) {
        return;
    }

    foreach ($cart->get_cart() as $cart_item_key => $cart_item) {

        if (
            empty($cart_item['cart_prices']['active']) ||
            !isset($cart_item['data'])
        ) {
            continue;
        }

        $active_price = (float) $cart_item['cart_prices']['active'];

        $cart_item['data']->set_price($active_price);
    }
}

add_filter('woocommerce_order_item_get_formatted_meta_data', 'hide_custom_furniture_parts_order_item_meta', 10, 2);

function hide_custom_furniture_parts_order_item_meta($formatted_meta, $item) {
    foreach ($formatted_meta as $key => $meta) {
        if (in_array($meta->key, array(
            '_config_settings',
        ))) {
            unset($formatted_meta[$key]);
        }
    }

    return $formatted_meta;
}

add_action('woocommerce_checkout_create_order_line_item', 'save_custom_furniture_parts_cart_data_to_order_item', 20, 4);

function save_custom_furniture_parts_cart_data_to_order_item($item, $cart_item_key, $values, $order) {
    $config_settings = isset($values['config_settings']) ? $values['config_settings'] : null;

    if(!$config_settings) return;

    $item->add_meta_data('_config_settings', $config_settings);
}


add_filter('acf/update_value/name=option_slug', function($value, $post_id, $field) {

    if (!empty($value)) return $value;

    $uniqueId = uniqid();

    return $uniqueId;

}, 10, 3);

/******** thumbnail ************/

add_filter('woocommerce_cart_item_thumbnail', function ($thumbnail, $cart_item, $cart_item_key) {
    $db_data = $cart_item['config_settings']['db_data'] ?? null;

    $attachment_id = is_object($db_data)
        ? ($db_data->attachment_id ?? null)
        : ($db_data['attachment_id'] ?? null);

    if (empty($attachment_id)) {
        return $thumbnail;
    }

    $image_url = wp_get_attachment_image_url((int) $attachment_id, 'medium');

    if (!$image_url) {
        $image_url = wp_get_attachment_url((int) $attachment_id);
    }

    if (!$image_url) {
        return $thumbnail;
    }

    return '<img 
        src="' . esc_url($image_url) . '" 
        width="80" 
        height="80" 
        class="custom-cart-thumbnail" 
        style="width:80px;height:80px;object-fit:cover;" 
        alt=""
    >';
}, 10, 3);


// add_filter('woocommerce_cart_item_name', function ($name, $cart_item, $cart_item_key) {
//     $postcard_thumbnail_id = $cart_item['config_settings']['postcard_thumbnail_id'] ?? null;

//     if (! is_checkout() || empty($postcard_thumbnail_id)) {
//         return $name;
//     }

//     $thumb = wp_get_attachment_image(
//         (int) $postcard_thumbnail_id,
//         [60, 60],
//         false,
//         ['class' => 'custom-checkout-thumbnail']
//     );

//     return $thumb . ' ' . $name;
// }, 10, 3);


add_action('woocommerce_checkout_create_order_line_item', function ($item, $cart_item_key, $values, $order) {
    $attachment_id = $values['config_settings']['db_data']['attachment_id'] ?? null;

    if (! empty($attachment_id)) {
        $item->add_meta_data('_custom_attachment_id', absint($attachment_id), true);
    }
}, 10, 4);


add_filter('woocommerce_order_item_name', function ($name, $item, $is_visible) {
    $attachment_id = (int) $item->get_meta('_custom_attachment_id');

    if (!$attachment_id) {
        return $name;
    }

    $image_url = wp_get_attachment_image_url($attachment_id, 'medium');

    if (!$image_url) {
        $image_url = wp_get_attachment_url($attachment_id);
    }

    if (!$image_url) {
        return $name;
    }

    $thumb = '<img 
        src="' . esc_url($image_url) . '" 
        width="60" 
        height="60" 
        class="custom-order-thumbnail" 
        style="width:60px;height:60px;object-fit:cover;margin-right:8px;vertical-align:middle;" 
        alt=""
    >';

    return $thumb . ' ' . $name;
}, 10, 3);