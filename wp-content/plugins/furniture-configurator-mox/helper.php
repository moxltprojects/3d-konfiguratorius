<?php

function get_furniture_list_by_product_id($product_id)
{
    $configIds = get_field('furniture', $product_id);

    if(empty($configIds)) {
        return false;
    }

    $furnitureArgs = array(
        'post_type' => 'config-furniture',
        'post__in' => $configIds,
        'posts_per_page' => 1,
    );

    $furnitures = get_posts($furnitureArgs);

    if(count($furnitures) == 0) {
        return false;
    }

    $furniture = $furnitures[0];
    $furniture_id = $furniture->ID;

    return $furniture_id;
}

function get_furniture_filtered_by_type($config_ids) 
{
    global $furniture_type_bottom_slug, 
        $furniture_type_bottom_corner_slug, 
        $furniture_type_top_slug, 
        $furniture_type_top_corner_slug, 
        $furniture_type_full_slug, 
        $furniture_type_full_corner_slug;

    $bottomArgs = array(
        'post_type' => 'config-furniture',
        'post__in' => $config_ids,
        'tax_query' => array(
            array(
                'taxonomy' => 'config-furniture-type',
                'field' => 'slug', 
                'terms' => $furniture_type_bottom_slug,
                'include_children' => false
            )
        )
    );

    $bottomItems = get_posts($bottomArgs);

    $bottomCornerArgs = array(
        'post_type' => 'config-furniture',
        'post__in' => $config_ids,
        'tax_query' => array(
            array(
                'taxonomy' => 'config-furniture-type',
                'field' => 'slug', 
                'terms' => $furniture_type_bottom_corner_slug,
                'include_children' => false
            )
        )
    );

    $bottomCornerItems = get_posts($bottomCornerArgs);

    $topArgs = array(
        'post_type' => 'config-furniture',
        'post__in' => $config_ids,
        'tax_query' => array(
            array(
                'taxonomy' => 'config-furniture-type',
                'field' => 'slug', 
                'terms' => $furniture_type_top_slug,
                'include_children' => false
            )
        )
    );
    $topItems = get_posts($topArgs);

    $topCornerArgs = array(
        'post_type' => 'config-furniture',
        'post__in' => $config_ids,
        'tax_query' => array(
            array(
                'taxonomy' => 'config-furniture-type',
                'field' => 'slug', 
                'terms' => $furniture_type_top_corner_slug,
                'include_children' => false
            )
        )
    );
    $topCornerItems = get_posts($topCornerArgs);

    $fullArgs = array(
        'post_type' => 'config-furniture',
        'post__in' => $config_ids,
        'tax_query' => array(
            array(
                'taxonomy' => 'config-furniture-type',
                'field' => 'slug', 
                'terms' => $furniture_type_full_slug,
                'include_children' => false
            )
        )
    );
    $fullItems = get_posts($fullArgs);

    $fullCornerArgs = array(
        'post_type' => 'config-furniture',
        'post__in' => $config_ids,
        'tax_query' => array(
            array(
                'taxonomy' => 'config-furniture-type',
                'field' => 'slug', 
                'terms' => $furniture_type_full_corner_slug,
                'include_children' => false
            )
        )
    );
    $fullCornerItems = get_posts($fullCornerArgs);

    return [
        $bottomItems,
        $bottomCornerItems,
        $topItems,
        $topCornerItems,
        $fullItems,
        $fullCornerItems
    ];  
}

function fetch_texture_list($taxonomy_slug = null, $limit = 1000) 
{
    $textureArgs = array(
        'post_type' => 'furniture-texture',
        'post_status' => array('publish'), 
        'orderby'      => 'menu_order',
        'order'        => 'ASC',
        'parent'       => 0,
    );

    $textureArgs['posts_per_page'] = $limit;

    if($taxonomy_slug) {
        $textureArgs['tax_query'] = array(
            array(
                'taxonomy' => 'furniture-texture-type',
                'field' => 'slug', 
                'terms' => $taxonomy_slug,
                'include_children' => false
            )
        );
    }

    return new WP_Query($textureArgs);
}

function get_current_settings($product_id, $config_id = null, $user_id = null)
{
    if(!$config_id) {
        global $wpdb;
        $config_table_name = $wpdb->prefix . "config_client_settings";

        $sql = $wpdb->prepare(
            "SELECT id FROM $config_table_name 
            WHERE user_id = %d",
            $user_id
        );

        $config_id = $wpdb->get_var($sql);
    }

    $config_table_result = get_settings_by_config_id($config_id);

    if(!$config_table_result) return null;

    $config_furniture_results = get_current_settings_furniture_list($config_id);

    return [
        $config_table_result,
        $config_furniture_results,
        $config_id,
    ];
}


function get_settings_by_config_id($config_id)
{
    global $wpdb;
    $config_table_name = $wpdb->prefix . "config_client_settings";

    $sql = $wpdb->prepare(
        "SELECT * FROM $config_table_name 
        WHERE id = %d",
        $config_id
    );

    $config_table_result = $wpdb->get_row($sql);

    return $config_table_result;
}

function get_current_settings_furniture_list($config_id)
{
    global $wpdb;
    $config_child_table_name = $wpdb->prefix . "config_client_setting_furnitures";

    $sql = $wpdb->prepare(
        "SELECT * FROM $config_child_table_name 
        WHERE config_id = %d",
        $config_id
    );

    $config_furniture_results = $wpdb->get_results($sql);

    return $config_furniture_results;
}

function remove_settings_furniture_list_items($config_id, $custom_ids)
{
    global $wpdb;
    $config_child_table_name = $wpdb->prefix . "config_client_setting_furnitures";

    $sql_delete = '';
    if(!empty($custom_ids)) {
        $custom_ids = array_map('intval', $custom_ids);
        $placeholders = implode(',', array_fill(0, count($custom_ids), '%d'));

        $sql_delete = $wpdb->prepare(
            "DELETE FROM $config_child_table_name 
            WHERE config_id = %d 
            AND custom_id NOT IN ($placeholders)",
            array_merge([$config_id], $custom_ids)
        );
    } else {
        $sql_delete = $wpdb->prepare(
            "DELETE FROM $config_child_table_name WHERE config_id = %d",
            $config_id
        );
    }

    $deleted_count = $wpdb->query($sql_delete);

    return $deleted_count !== false;
}


function create_new_settings($user_id, $main_settings)
{
    global $wpdb, $client_cookie_name;

    $config_table_name = $wpdb->prefix . "config_client_settings";

    $sql = $wpdb->insert(
        $config_table_name,
        [
            'user_id'        => intval($user_id),
            'product_id'        => intval($main_settings['product_id']),
            'base_color_id'     => intval($main_settings['base_color_id']),
            'frame_color_id'    => intval($main_settings['frame_color_id']),
            'room_type'         => $main_settings['room_type'],
            'room_height'       => intval($main_settings['room_height']),
            'room_width'        => intval($main_settings['room_width']),
            'room_depth'        => intval($main_settings['room_depth']),
            'bottom_height'     => intval($main_settings['bottom_height']),
            'bottom_full_depth' => intval($main_settings['bottom_full_depth']),
            'top_height'        => intval($main_settings['top_height']),
            'top_depth'         => intval($main_settings['top_depth']),
            'full_height'       => intval($main_settings['full_height']),
            'vertical_space'    => intval($main_settings['vertical_space']),
        ],
        [ '%d','%d','%d','%d','%s','%d','%d','%d','%d','%d','%d','%d','%d' ]
    );
  
    $config_id = $wpdb->insert_id;

    return $config_id;
}

function update_existing_settings($config_id, $user_id, $main_settings)
{
    global $wpdb;

    $config_table_name = $wpdb->prefix . "config_client_settings";

    $updated = $wpdb->update(
        $config_table_name,
        [
            // 'user_id'        => $user_id,
            // 'product_id'        => $main_settings['product_id'],
            'base_color_id'     => intval($main_settings['base_color_id']),
            'frame_color_id'    => intval($main_settings['frame_color_id']),
            'room_type'         => $main_settings['room_type'],
            'room_height'       => intval($main_settings['room_height']),
            'room_width'        => intval($main_settings['room_width']),
            'room_depth'        => intval($main_settings['room_depth']),
            'bottom_height'     => intval($main_settings['bottom_height']),
            'bottom_full_depth' => intval($main_settings['bottom_full_depth']),
            'top_height'        => intval($main_settings['top_height']),
            'top_depth'         => intval($main_settings['top_depth']),
            'full_height'       => intval($main_settings['full_height']),
            'vertical_space'    => intval($main_settings['vertical_space']),
        ],
        [ 'id' => $config_id ], // WHERE
        [ '%d','%d','%s','%d','%d','%d','%d','%d','%d','%d','%d','%d' ],
        [ '%d' ]
    );

    if ($updated === false) {
        error_log("DB Error: " . $wpdb->last_error);
    } elseif ($updated === 0) {
        error_log("No rows updated (maybe same values or no match).");
    } else {
        error_log("Successfully updated {$updated} row(s).");
    }

    return $updated || $updated === 0;
}

function add_furniture_to_settings_config($config_id, $furniture_list)
{
    global $wpdb;

    $config_child_table_name = $wpdb->prefix . "config_client_setting_furnitures";

    $create_values = [];
    $create_placeholders = [];

    $update_cases_width = [];
    $update_cases_furniture_position = [];
    $update_cases_model_original_size = [];
    $update_cases_model_scaled_size = [];
    $update_cases_model_position = [];
    $update_cases_is_fitting = [];
    $update_ids = [];
    $custom_ids = [];

    foreach ($furniture_list as $furniture_item) {
        $db_data = $furniture_item['db_data'];
        $custom_id = intval($db_data['custom_id']);

        $custom_ids[] = $custom_id;

        if(isset($furniture_item['old_item'])) {
            $update_ids[] = $custom_id;

            $update_cases_width[] = "WHEN {$custom_id} THEN " . intval($db_data['width']);
            // $update_cases_model_original_size[] = "WHEN {$custom_id} THEN '" . wp_json_encode($db_data['model_original_size']) . "'";
            // $update_cases_model_scaled_size[] = "WHEN {$custom_id} THEN '" . wp_json_encode($db_data['model_scaled_size']) . "'";
            // $update_cases_model_position[] = "WHEN {$custom_id} THEN '" . wp_json_encode($db_data['model_position']) . "'";
            $update_cases_furniture_position[] = "WHEN {$custom_id} THEN '" . $db_data['furniture_position_mm'] . "'";
            $update_cases_model_original_size[] = "WHEN {$custom_id} THEN '" . $db_data['model_original_size'] . "'";
            $update_cases_model_scaled_size[] = "WHEN {$custom_id} THEN '" . $db_data['model_scaled_size'] . "'";
            $update_cases_model_position[] = "WHEN {$custom_id} THEN '" . $db_data['model_position'] . "'";
            $update_cases_is_fitting[] = "WHEN {$custom_id} THEN " . intval($db_data['is_fitting']);
        } else {
            $create_values[] = $custom_id;
            $create_values[] = $config_id;
            $create_values[] = $furniture_item['furniture_id'];
            $create_values[] = intval($db_data['width']);
            $create_values[] = $db_data['furniture_position_mm'];
            $create_values[] = $db_data['model_original_size'];
            $create_values[] = $db_data['model_scaled_size'];
            $create_values[] = $db_data['model_position'];
            $create_values[] = intval($db_data['is_fitting']);
            $create_placeholders[] = "(%d,%d,%d,%d,%s,%s,%s,%s,%d)";
        }

    }

    $sql_insert = true;
    if (!empty($create_placeholders)) {
        $sql_insert = "INSERT INTO {$config_child_table_name} 
            (custom_id,config_id,furniture_id,width,furniture_position_mm,model_original_size,model_scaled_size,model_position,is_fitting) 
            VALUES " . implode(',', $create_placeholders);
        $wpdb->query($wpdb->prepare($sql_insert, $create_values));
        if ($wpdb->last_error) {
            error_log("Insert error: " . $wpdb->last_error);
        }
    }

    $sql_update = true;
    if (!empty($update_ids)) {
        $ids_str = implode(',', $update_ids);
        $sql_update = "UPDATE {$config_child_table_name} SET 
            width = CASE custom_id " . implode(' ', $update_cases_width) . " END,
            furniture_position_mm = CASE custom_id " . implode(' ', $update_cases_furniture_position) . " END,
            model_original_size = CASE custom_id " . implode(' ', $update_cases_model_original_size) . " END,
            model_scaled_size = CASE custom_id " . implode(' ', $update_cases_model_scaled_size) . " END,
            model_position = CASE custom_id " . implode(' ', $update_cases_model_position) . " END,
            is_fitting = CASE custom_id " . implode(' ', $update_cases_is_fitting) . " END
            WHERE custom_id IN ({$ids_str})";
        $wpdb->query($sql_update);
        
        $wpdb->query($sql_update);
        if ($wpdb->last_error) {
            error_log("Update error: " . $wpdb->last_error);
        }

        $sql_update = $sql_update || $sql_update == 0;
    } 

    $sql_removed = true;
    if($sql_insert && $sql_update) {
        $sql_removed = remove_settings_furniture_list_items($config_id, $custom_ids);
    }

    return $sql_insert && $sql_update && $sql_removed;
}


function get_default_dimensions($saved_settings, $product_id)
{
    global $wall_single;

    $furniture_list = [];
    $default_room_layout = null;

    $wall_height_min = (int) get_theme_mod('wall_height_min', 2500);
    $wall_height_max = (int) get_theme_mod('wall_height_max', 2500);
    $wall_height_standard = 0;

    $wall_width_min = (int) get_theme_mod('wall_width_min', 2500);
    $wall_width_max = (int) get_theme_mod('wall_width_max', 2500);
    $wall_width_standard = 0;

    $wall_depth_min = (int) get_theme_mod('wall_depth_min', 2500);
    $wall_depth_max = (int) get_theme_mod('wall_depth_max', 2500);
    $wall_depth_standard = 0;

    $full_bottom_depth = get_field('full_bottom_depth', $product_id);
    $bottom_full_depth_standard = 0;
    $bottom_full_depth_min = (int) $full_bottom_depth['min'];
    $bottom_full_depth_max = (int) $full_bottom_depth['max'];
    $top_depth = get_field('top_depth', $product_id);
    $top_depth_standard = 0;
    $top_depth_min = (int) $top_depth['min'];
    $top_depth_max = (int) $top_depth['max'];

    $bottom_height = get_field('bottom_height', $product_id);
    $bottom_height_standard = 0;
    $bottom_height_min = (int) $bottom_height['min'];
    $bottom_height_max = (int) $bottom_height['max'];
    $bottom_height_image = $bottom_height['image_glb'];

    $top_height = get_field('top_height', $product_id);
    $top_height_standard = 0;
    $top_height_min = (int) $top_height['min'];
    $top_height_max = (int) $top_height['max'];
    $top_height_image = $top_height['image_glb'];

    $full_height = get_field('full_height', $product_id);
    $full_height_standard = 0;
    $full_height_min = (int) $full_height['min'];
    $full_height_max = (int) $full_height['max'];
    $full_height_image = $full_height['image_glb'];

    $vertical_space = get_field('vertical_space', $product_id);
    $vertical_space_standard = 0;
    $vertical_space_min = (int) $vertical_space['min'];
    $vertical_space_max = (int) $vertical_space['max'];

    if($saved_settings) {
        list($config_setting, $furniture_list) = $saved_settings;
        
        $default_room_layout = $config_setting->room_type;

        $wall_height_standard = (int) $config_setting->room_height;
        $wall_width_standard = (int) $config_setting->room_width;
        $wall_depth_standard = (int) $config_setting->room_depth;
        
        $bottom_full_depth_standard = (int) $config_setting->bottom_full_depth;
        $top_depth_standard = (int) $config_setting->top_depth;

        $bottom_height_standard = (int) $config_setting->bottom_height;
        $top_height_standard = (int) $config_setting->top_height;
        $full_height_standard = (int) $config_setting->full_height;

        $vertical_space_standard = (int) $config_setting->vertical_space;
    } else {
        $default_room_layout = $wall_single;

        $wall_height_standard = (int) get_theme_mod('wall_height_standard', 250);
        $wall_width_standard = (int) get_theme_mod('wall_width_standard', 250);
        $wall_depth_standard = (int) get_theme_mod('wall_depth_standard', 250);

        $bottom_full_depth_standard = (int) $full_bottom_depth['standard'];
        $top_depth_standard = (int) $top_depth['standard'];

        $bottom_height_standard = (int) $bottom_height['standard'];
        $top_height_standard = (int) $top_height['standard'];
        $full_height_standard = (int) $full_height['standard'];
        $vertical_space_standard = (int) $vertical_space['standard'];
    }

    // $largest_height_val = $full_height_standard;
    // $top_bottom_height_with_gap = $bottom_height_standard + $top_height_standard + $vertical_space_standard;

    // if($largest_height_val < $top_bottom_height_with_gap){
    //     $largest_height_val = $top_bottom_height_with_gap;
    // } 
    $largest_height_val = $full_height_max;
    $top_bottom_height_with_gap = $bottom_height_max + $top_height_max + $vertical_space_max;

    if($largest_height_val < $top_bottom_height_with_gap){
        $largest_height_val = $top_bottom_height_with_gap;
    } 

    return [
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
    ];
}

function get_item_prices($furniture_id) 
{
    $item_woocommerce = get_field('woocommerce', $furniture_id);
    $price = floatval($item_woocommerce['regular_price']);
    $price = round(floatval($price > 0 ? $price : 0), 2);
    $price_cm3 = floatval($item_woocommerce['price_for_cm3']);
    $price_cm3 = round(floatval($price_cm3 > 0 ? $price_cm3 : 0), 2);

    $discount_price = floatval($item_woocommerce['discount_price']);
    $discount_price = round(floatval($discount_price > 0 ? $discount_price: 0), 2);
    $discount_price_cm3 = 0;
    $item_price = $discount_price > 0 ? $discount_price : $price;
    $item_price_cm3 = $discount_price_cm3 > 0 ? $discount_price_cm3 : $price_cm3;

    return [
        $item_price,
        $price,
        $discount_price,
        $item_price_cm3,
        $price_cm3,
        $discount_price_cm3,
    ];
}

function calculateItemPrice(
    $furniture_id, 
    $item_width_min, 
    $height_min, 
    $depth_min,
    $item_width,
    $height,
    $depth,
    $default_base_texture_price, 
    $default_frame_texture_price
) {
    global $PRICE_CM_CHUNK;
    /****** totals *******/
    list(
        $display_price,
        $regular_price,
        $discount_price,
        $display_price_cm3,
        $regular_price_cm3,
        $discount_price_cm3,
    ) = get_item_prices($furniture_id);

    $cm3_mm = (($item_width - $item_width_min) * ($height - $height_min) * ($depth - $depth_min)) / 1000;
    $cm3_cm = $cm3_mm / $PRICE_CM_CHUNK;  
    $cm3_total = $cm3_cm * $display_price_cm3;

    $item_total = floatval($cm3_total + $display_price + $default_base_texture_price + $default_frame_texture_price);

    $item_total = number_format($item_total, 2, '.', '');

    return [
        $item_total,
        $display_price,
        $regular_price,
        $discount_price,
        $display_price_cm3,
        $regular_price_cm3,
        $discount_price_cm3,
    ];
}

function get_bottom_corner_furniture_dimensions($bottom_corner_items, $bottom_corner_item_id, $topCornerItems, $top_corner_item_id, $fullCornerItems, $full_corner_item_id) {

    $bottom_width_standard = 0;
    $bottom_depth_standard = 0;
    $top_width_standard = 0;
    $top_depth_standard = 0;
    $full_width_standard = 0;
    $full_depth_standard = 0;

    if($bottom_corner_items && count($bottom_corner_items) > 0) {
        if(!$bottom_corner_item_id) {
            $corner_item = $bottom_corner_items[0];
            $bottom_corner_item_id = $corner_item->ID;
        }
        $width = get_field('width', $bottom_corner_item_id);
        $bottom_width_standard = $width['default'];
        $depth = get_field('depth', $bottom_corner_item_id);
        $bottom_depth_standard = $depth['default'];
    } 

    if($topCornerItems && count($topCornerItems) > 0) {
        if(!$top_corner_item_id) {
            $corner_item = $topCornerItems[0];
            $top_corner_item_id = $corner_item->ID;
        }
        $width = get_field('width', $top_corner_item_id);
        $top_width_standard = $width['default'];
        $depth = get_field('depth', $top_corner_item_id);
        $top_depth_standard = $depth['default'];
    } 

    if($fullCornerItems && count($fullCornerItems) > 0) {
        if(!$full_corner_item_id) {
            $corner_item = $fullCornerItems[0];
            $full_corner_item_id = $corner_item->ID;
        }
        $width = get_field('width', $full_corner_item_id);
        $full_width_standard = $width['default'];
        $depth = get_field('depth', $full_corner_item_id);
        $full_depth_standard = $depth['default'];
    } 

    return [
        $bottom_width_standard,
        $bottom_depth_standard,
        $top_width_standard,
        $top_depth_standard,
        $full_width_standard,
        $full_depth_standard,
    ];
}

function get_default_textures($saved_settings, $product_id)
{
    global $texture_base_slug, $texture_frame_slug;

    $default_base_texture = null;
    $default_base_texture_id = null;
    $default_base_brim_texture = null;
    $default_base_texture_id = null;
    $default_frame_texture = null;
    $default_frame_texture_id = null;
    $default_frame_brim_texture = null;
    $default_frame_texture_id = null;

    if($saved_settings) {
        global $texture_base_slug, $texture_frame_slug;

        list($config_setting) = $saved_settings;
        
        $default_base_texture_id = $config_setting->base_color_id;
        $default_base_brim_texture_id = $config_setting->base_brim_color_id;
        $default_frame_texture_id = $config_setting->frame_color_id;
        $default_frame_brim_texture_id = $config_setting->frame_brim_color_id;

        $default_base_texture_args = array(
            'p' => $default_base_texture_id,
            'post_type' => 'furniture-texture',
            'posts_per_page' => 1,
            'post_status' => 'publish',
            'tax_query' => array(
                array(
                    'taxonomy' => 'furniture-texture-type',
                    'field' => 'slug', 
                    'terms' => $texture_base_slug,
                    'include_children' => false
                )
            )
        );

        $default_base_textures = get_posts( $default_base_texture_args );

        if ( ! empty( $default_base_textures ) ) {
            $default_base_texture = $default_base_textures[0];
        }

        $default_frame_texture_args = array(
            'p' => $default_frame_texture_id,
            'posts_per_page' => 1,
            'post_type' => 'furniture-texture',
            'status' => 'publish',
            'tax_query' => array(
                array(
                    'taxonomy' => 'furniture-texture-type',
                    'field' => 'slug', 
                    'terms' => $texture_frame_slug,
                    'include_children' => false
                )
            )
        );

        $default_frame_textures = get_posts( $default_frame_texture_args );

        if ( ! empty( $default_frame_textures ) ) {
            $default_frame_texture = $default_frame_textures[0];
        }

    } else {
        $texture = get_field('default_texture', $product_id);
        $default_base_texture = isset($texture['base']) && $texture['base'] ? $texture['base'] : null;
        $default_base_brim_texture = isset($texture['frame_brim']) && $texture['frame_brim'] ? $texture['frame_brim'] : null;
        $default_frame_texture = isset($texture['frame']) && $texture['frame'] ? $texture['frame'] : null;
        $default_frame_brim_texture = isset($texture['front_brim']) && $texture['front_brim'] ? $texture['front_brim'] : null;

        if(!$default_base_texture) {
            global $texture_base_slug;
            $textures_loop = fetch_texture_list($texture_base_slug, 1);

            if($textures_loop->have_posts()) {
                $default_base_texture = $textures_loop->get_posts()[0];
            }
        }

        if(!$default_base_brim_texture) {
            global $texture_base_brim_slug;
            $textures_loop = fetch_texture_list($texture_base_brim_slug, 1);

            if($textures_loop->have_posts()) {
                $default_base_brim_texture = $textures_loop->get_posts()[0];
            }
        }

        if(!$default_frame_texture) {
            global $texture_frame_slug;
            $textures_loop = fetch_texture_list($texture_frame_slug, 1);

            if($textures_loop->have_posts()) {
                $default_frame_texture = $textures_loop->get_posts()[0];
            }
        }

        if(!$default_frame_brim_texture) {
            global $texture_frame_brim_slug;
            $textures_loop = fetch_texture_list($texture_frame_brim_slug, 1);

            if($textures_loop->have_posts()) {
                $default_frame_brim_texture = $textures_loop->get_posts()[0];
            }
        }

        $default_base_texture_id = $default_base_texture->ID;
        $default_base_brim_texture_id = $default_base_brim_texture->ID;
        $default_frame_texture_id = $default_frame_texture->ID;
        $default_frame_brim_texture_id = $default_frame_brim_texture->ID;
    }

    return [
        $default_base_texture,
        $default_base_texture_id,
        $default_base_brim_texture,
        $default_base_brim_texture_id,
        $default_frame_texture,
        $default_frame_texture_id,
        $default_frame_brim_texture,
        $default_frame_brim_texture_id,
    ];
}

function get_current_texture_ids($config_id)
{
    global $texture_base_slug, $texture_frame_slug;
    $config_setting = get_settings_by_config_id($config_id);
        
    $base_texture_id = $config_setting->base_color_id;
    $frame_texture_id = $config_setting->frame_color_id;

    return [
        'base_texture_id' => $base_texture_id,
        'frame_texture_id' => $frame_texture_id,
    ];
}

function save_canvas_image($canvas_content, $file_name) {
	$image_data = str_replace('data:image/png;base64,', '', $canvas_content);
    $image_data = base64_decode($image_data); 
	if ($image_data === false) {
        return null;
    }

	$upload_dir = wp_upload_dir();
	$file_path = $upload_dir['path'] . '/' . $file_name;

	if (file_put_contents($file_path, $image_data)) {
        $file_url = $upload_dir['url'] . '/' . $file_name;

        $attachment = array(
            'guid' => $file_url,
            'post_mime_type' => 'image/png',
            'post_title' => sanitize_file_name($file_name),
            'post_content' => '',
            'post_status' => 'inherit',
        );

        // // Insert the attachment into the media library
        // $attach_id = wp_insert_attachment($attachment, $file_path);
        // require_once(ABSPATH . 'wp-admin/includes/image.php');
        // $attach_data = wp_generate_attachment_metadata($attach_id, $file_path);
        // wp_update_attachment_metadata($attach_id, $attach_data);

        return $file_url;
    } else {
        return null;
    }
}

function get_furniture_texture_prices($base_texture_id, $frame_texture_id)
{
    // global $furniture_type_bottom_corner_slug, $furniture_type_top_corner_slug, $furniture_type_full_corner_slug;

    $base_woocommerce = get_field('woocommerce', $base_texture_id);
    $base_texture_price = $base_woocommerce['discount_price'] && floatval($base_woocommerce['discount_price']) > 0 ? 
        $base_woocommerce['discount_price'] : 
        $base_woocommerce['regular_price'];

    $frame_woocommerce = get_field('woocommerce', $frame_texture_id);
    $frame_texture_price = $frame_woocommerce['discount_price'] && floatval($frame_woocommerce['discount_price']) > 0 ? 
        $frame_woocommerce['discount_price'] : 
        $frame_woocommerce['regular_price'];

    // $totals = 0;

    // $furniture_list_objects = [];
    // $bottom_corner_item_id = null;
    // $top_corner_item_id = null;
    // $full_corner_item_id = null;

    // foreach($furniture_list as $item) {
    //     $id = $item->id;
    //     $furniture_id = $item->furniture_id;
    //     $furniture_post = get_post( $furniture_id );

    //     if(!$furniture_post || $furniture_post->post_status !== 'publish') {
    //         continue;
    //     }
    //     $model_src = get_field('3d_model', $furniture_id);
    //     $object_type = get_furniture_type($furniture_id);

    //     switch($object_type) {
    //         case $furniture_type_bottom_corner_slug: {
    //             $bottom_corner_item_id = $furniture_id;
    //             break;
    //         }
    //         case $furniture_type_top_corner_slug: {
    //             $top_corner_item_id = $furniture_id;
    //             break;
    //         }
    //         case $furniture_type_full_corner_slug: {
    //             $bottom_full_item_id = $furniture_id;
    //             break;
    //         }
    //         default: {
    //             break;
    //         }
    //     }

    //     list(
    //         $display_price,
    //         $regular_price,
    //         $discount_price,
    //         $display_price_cm3,
    //         $regular_price_cm3,
    //         $discount_price_cm3,
    //     )= get_item_prices($furniture_id);

    //     $furniture_list_objects[] = array(
    //         'old_item' => true, 
    //         'config_id' => $id, 
    //         'furniture_id' => $furniture_id,
    //         'object_src' => $model_src ? $model_src['url'] : null,
    //         'object_type' => $object_type ? $object_type->slug : null,
    //         'db_data' => $item,
    //         'furniture_post' => $furniture_post,
    //         'display_price' => $item_price,
    //         'display_price_cm3' => $item_price_cm3,
    //         'regular_price' => $price,
    //         'discount_price' => $discount_price,
    //     );

    //     $min_cm3 = $min_width * $min_height * $min_depth;
    //     $current_cm3 = $width * $height * $depth;
    //     $cm3 = ($current_cm3 - $min_cm3) / 1000;   
    //     $cm3_total = $cm3 * $display_price_cm3;

    //     $totals += floatval($cm3_total + $item_price + $base_texture_price + $frame_texture_price);
    // }

    // $total = number_format($totals, 2, '.', '');

    return [
        $base_texture_price,
        $frame_texture_price,
        // $bottom_corner_item_id,
        // $top_corner_item_id,
        // $full_corner_item_id,
    ];
}

function calculate_and_save_furniture_price($settings, $furniture_list)
{
    global $furniture_type_bottom_slug, $furniture_type_top_slug, $furniture_type_full_slug, $furniture_type_bottom_corner_slug, $furniture_type_top_corner_slug, $furniture_type_full_corner_slug, $PRICE_CM_CHUNK;
    
    $product_id = $settings->product_id;
    $bottom_height = $settings->bottom_height;
    $top_height = $settings->top_height;
    $full_height = $settings->full_height;
    $bottom_depth = $settings->bottom_full_depth;
    $top_depth = $settings->top_depth;
    $full_depth = $settings->bottom_full_depth;

    $product_top_height = get_field('top_height', $product_id);
    $top_min_height = $product_top_height['min'];
    $product_bottom_height = get_field('bottom_height', $product_id);
    $bottom_min_height = $product_bottom_height['min'];
    $product_full_height = get_field('full_height', $product_id);
    $full_min_height = $product_full_height['min'];
    $bottom_full_depth = get_field('full_bottom_depth', $product_id);
    $bottom_full_min_depth = $bottom_full_depth['min'];
    $product_top_depth = get_field('top_depth', $product_id);
    $top_min_depth = $product_top_depth['min'];

    $base_texture_id = $settings->base_color_id;
    $frame_texture_id = $settings->frame_color_id;

    $base_woocommerce = get_field('woocommerce', $base_texture_id);
    $base_texture_regular_price = floatval($base_woocommerce['regular_price']);
    $base_texture_discount_price = floatval($base_woocommerce['discount_price']);
    $base_texture_price = $base_texture_discount_price > 0 ? 
        $base_texture_discount_price : 
        $base_texture_regular_price;

    $base_texture_data = [
        'id' => $base_texture_id,
        'name' =>get_the_title($base_texture_id),
        'thumbnail' => get_the_post_thumbnail_url($base_texture_id),
        'display_price' => $base_texture_price,
        'regular_price' => $base_texture_regular_price,
        'discount_price' => $base_texture_discount_price,
        'code' => get_field('code', $base_texture_id),
    ];

    $frame_woocommerce = get_field('woocommerce', $frame_texture_id);
    $frame_texture_regular_price = floatval($frame_woocommerce['regular_price']);
    $frame_texture_discount_price = floatval($frame_woocommerce['discount_price']);
    $frame_texture_price = $frame_texture_discount_price > 0 ? 
        $frame_texture_discount_price : 
        $frame_texture_regular_price;

    $frame_texture_data = [
        'id' => $frame_texture_id,
        'name' => get_the_title($frame_texture_id),
        'thumbnail' => get_the_post_thumbnail_url($frame_texture_id),
        'display_price' => $frame_texture_price,
        'regular_price' => $frame_texture_regular_price,
        'discount_price' => $frame_texture_discount_price,
        'code' => get_field('code', $frame_texture_id),
    ];

    $settings->base_texture_data = $base_texture_data;
    $settings->frame_texture_data = $frame_texture_data;

    $totals = 0;
    $furniture_list_mapped = [];

    foreach($furniture_list as $item) {
        $furniture_id = $item->furniture_id;
       
        $post_status = get_post_status( $furniture_id );
        if(!$post_status || $post_status !== 'publish') {
            continue;
        }

        $db_data = $item->db_data;
        $type = $item->object_type;
        $width = $db_data->width;
        $width_obj = get_field('width', $furniture_id);
        $min_width = $width_obj['min'];
        $width_max = $width_obj['max'];

        if($width < $min_width || $width > $width_max) {
            $width = $min_width;
        }

        list(
            $height, 
            $depth,
            $min_height,
            $height_max,
            $min_depth,
        ) = get_furniture_dimensions_by_type( 
            $type,
            $bottom_height,
            $top_height,
            $full_height,
            $bottom_depth,
            $top_depth,
            $bottom_min_height,
            null,
            $top_min_height,
            null,
            $full_min_height,
            null,
            $bottom_full_min_depth,
            null,
            $top_min_depth,
        );

        // error_log(print_r($bottom_full_depth, true));

       

        // $height = $bottom_height;
        // $depth = $bottom_depth;
        // $min_width = $item->min_width;
        // $min_height = $item->min_height;
        // $min_depth = $item->min_depth;

        // switch($type) {
        //     case $furniture_type_bottom_slug: {
        //         $height = $bottom_height;
        //         $depth = $bottom_depth;
        //         break;
        //     }
        //     case $furniture_type_bottom_corner_slug: {
        //         $height = $bottom_height;
        //         $depth = $bottom_depth;
        //         break;
        //     }
        //     case $furniture_type_top_slug: {
        //         $height = $top_height;
        //         $depth = $top_depth;
        //         break;
        //     }
        //     case $furniture_type_top_corner_slug: {
        //         $height = $top_height;
        //         $depth = $top_depth;
        //         break;
        //     }
        //     case $furniture_type_full_slug: {
        //         $height = $full_height;
        //         $depth = $full_depth;
        //         break;
        //     }
        //     case $furniture_type_full_corner_slug: {
        //         $height = $full_height;
        //         $depth = $full_depth;
        //         break;
        //     }
        //     default: {
        //         $height = $bottom_height;
        //         $depth = $bottom_depth; 
        //     }
        // }

        // $item_woocommerce = get_field('woocommerce', $furniture_id);
        // $regular_price = floatval($item_woocommerce['regular_price']);
        // $discount_price = floatval($item_woocommerce['discount_price']);
            
        // $item_price = $discount_price > 0 ? 
        //     $discount_price : 
        //     $regular_price;
        list(
            $display_price,
            $regular_price,
            $discount_price,
            $display_price_cm3,
            $regular_price_cm3,
            $discount_price_cm3,
        )= get_item_prices($furniture_id);

        $cm3_mm = (($width - $min_width) * ($height - $min_height) * ($depth - $min_depth)) / 1000;

        $cm3_cm = $cm3_mm / $PRICE_CM_CHUNK;  

        $cm3_total = $cm3_cm * $display_price_cm3;

        $totals += floatval($cm3_total + $display_price + $base_texture_price + $frame_texture_price);

        $item->display_price = $display_price;
        $item->regular_price = $regular_price;
        $item->discount_price = $discount_price;

        $item->display_price_cm3 = $display_price_cm3;
        $item->regular_price_cm3 = $regular_price_cm3;
        $item->discount_price_cm3 = $discount_price_cm3;

        $furniture_list_mapped[] = $item;
    }

    $total = number_format($totals, 2, '.', '');

    /******* end imos xml *******/

    return [
        $settings,
        $furniture_list_mapped,
        $total,
    ];
}

function generate_xml_file($main_settings, $furniture_list)
{
    global $furniture_type_bottom_slug, $furniture_type_top_slug, $furniture_type_full_slug;
    
    $product_id = $main_settings->product_id;
    $bottom_height = $main_settings->bottom_height;
    $top_height = $main_settings->top_height;
    $full_height = $main_settings->full_height;
    $bottom_depth = $main_settings->bottom_full_depth;
    $top_depth = $main_settings->top_depth;
    $full_depth = $main_settings->bottom_full_depth;
    $base_texture_id = $main_settings->base_color_id;
    $frame_texture_id = $main_settings->frame_color_id;

    $base_texture_data = $main_settings->base_texture_data;
    $base_texture_price = $base_texture_data['display_price'];
    $base_color_name = $base_texture_data['name'];

    $frame_texture_data = $main_settings->frame_texture_data;
    $frame_texture_price = $frame_texture_data['display_price'];
    $frame_color_name = $frame_texture_data['name'];


    /******* imos xml *******/
	$xml_table_id = '173';
	list($doc, $xml) = init_products_xml($xml_table_id);

	/******* end imos xml *******/

    foreach($furniture_list as $item) {
        $furniture_id = $item->furniture_id;
        $db_data = $item->db_data;

        $type = $item->object_type;
        $width = $db_data->width;
        $height = $bottom_height;
        $depth = $bottom_depth;

        switch($type) {
            case $furniture_type_top_slug: {
                $height = $top_height;
                $depth = $top_depth;
                break;
            }
            case $furniture_type_full_slug: {
                $height = $full_height;
                $depth = $full_depth;
                break;
            }
            default: {
                $height = $bottom_height;
                $depth = $bottom_depth; 
            }
        }

        $xml = fill_products_xml($furniture_id, $doc, $xml, $xml_table_id, $height, $depth, $width, $base_color_name, $frame_color_name);

    }

    $xml = end_products_xml($doc, $xml);

	$upload_dir = wp_upload_dir(); 
	$products_dir = trailingslashit($upload_dir['basedir']) . 'imos-products/';

	if (!file_exists($products_dir)) {
		wp_mkdir_p($products_dir); // Create the folder recursively
	}

	$xml_filename = 'product-'. $product_id .'__'. time() .'.xml';
    $xml_filepath = $products_dir . $xml_filename;

 	$doc->save($xml_filepath);

    $xml_file_url = trailingslashit($upload_dir['baseurl']) . 'imos-products/' . $xml_filename;
    /******* end imos xml *******/

    return $xml_file_url;
}

function calculate_furniture_price($main_settings, $furniture_list, $base_texture_id, $frame_texture_id)
{
    global $PRICE_CM_CHUNK;
    $base_woocommerce = get_field('woocommerce', $base_texture_id);
    $base_texture_price =  floatval($base_woocommerce['discount_price'] && floatval($base_woocommerce['discount_price']) > 0 ? 
        $base_woocommerce['discount_price'] : 
        $base_woocommerce['regular_price']);

    $frame_woocommerce = get_field('woocommerce', $frame_texture_id);
    $frame_texture_price =  floatval($frame_woocommerce['discount_price'] && floatval($frame_woocommerce['discount_price']) > 0 ? 
        $frame_woocommerce['discount_price'] : 
        $frame_woocommerce['regular_price']);

    $totals = 0;

    $product_id = $main_settings->product_id;

    $product_top_height = get_field('top_height', $product_id);
    $top_min_height = $product_top_height['min'];

    $product_bottom_height = get_field('bottom_height', $product_id);
    $bottom_min_height = $product_bottom_height['min'];

    $product_full_height = get_field('full_height', $product_id);
    $full_min_height = $product_full_height['min'];

    $product_bottom_full_depth = get_field('full_bottom_depth', $product_id);
    $bottom_full_min_depth = $product_bottom_full_depth['min'];

    $product_top_depth = get_field('top_depth', $product_id);
    $top_min_depth = $product_top_depth['min'];

    $top_height = $main_settings->top_depth;
    $top_depth = $main_settings->top_depth;
    $bottom_height = $main_settings->bottom_height;
    $bottom_full_depth = $main_settings->bottom_full_depth;
    $full_height = $main_settings->full_height;


    foreach($furniture_list as $item) {
        $furniture_id = $item->furniture_id;
        $post_status = get_post_status( $furniture_id );
        if(!$post_status || $post_status !== 'publish') {
            continue;
        }

        // $item_woocommerce = get_field('woocommerce', $furniture_id);
        // $regular_price = floatval($item_woocommerce['regular_price']);
        // $discount_price = floatval($item_woocommerce['discount_price']);
        
        // $item_price = $discount_price > 0 ? 
        //     $discount_price : 
        //     $regular_price;

        // $object_type = get_furniture_type($furniture_id);
        // $item_type_slug = $object_type ? $object_type->slug : null;
        // $item_width = $furniture_item->width;

        // list(
        //     $height, 
        //     $depth,
        //     $height_min,
        //     $height_max,
        //     $depth_min,
        // ) = get_furniture_dimensions_by_type( 
        //     $item_type_slug,
        //     $bottom_height_standard,
        //     $top_height_standard,
        //     $full_height_standard,
        //     $bottom_full_depth_standard,
        //     $top_depth_standard,
        //     $bottom_height_min,
        //     null,
        //     $top_height_min,
        //     null,
        //     $full_height_min,
        //     null,
        //     $bottom_full_depth_min,
        //     null,
        //     $top_depth_min,
        // );

        // /****** totals *******/
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
        //     $depth,
        //     $default_base_texture_price, 
        //     $default_frame_texture_price
        // );

        // $totals += $item_total;

        $db_data = $item->db_data;
        $type = $item->object_type;

        $width = $db_data->width;
        $width_obj = get_field('width', $furniture_id);
        $min_width = $width_obj['min'];
        $width_max = $width_obj['max'];

        if($width < $min_width || $width > $width_max) {
            $width = $min_width;
        }

        list(
            $height, 
            $depth,
            $min_height,
            $height_max,
            $min_depth,
        ) = get_furniture_dimensions_by_type( 
            $type,
            $bottom_height,
            $top_height,
            $full_height,
            $bottom_full_depth,
            $top_depth,
            $bottom_min_height,
            null,
            $top_min_height,
            null,
            $full_min_height,
            null,
            $bottom_full_min_depth,
            null,
            $top_min_depth,
        );
        // $min_width = $item->min_width;
        // $min_height = $item->min_height;
        // $min_depth = $item->min_depth;

        // switch($type) {
        //     case $furniture_type_bottom_slug: {
        //         $height = $bottom_height;
        //         $depth = $bottom_depth;
        //         break;
        //     }
        //     case $furniture_type_bottom_corner_slug: {
        //         $height = $bottom_height;
        //         $depth = $bottom_depth;
        //         break;
        //     }
        //     case $furniture_type_top_slug: {
        //         $height = $top_height;
        //         $depth = $top_depth;
        //         break;
        //     }
        //     case $furniture_type_top_corner_slug: {
        //         $height = $top_height;
        //         $depth = $top_depth;
        //         break;
        //     }
        //     case $furniture_type_full_slug: {
        //         $height = $full_height;
        //         $depth = $full_depth;
        //         break;
        //     }
        //     case $furniture_type_full_corner_slug: {
        //         $height = $full_height;
        //         $depth = $full_depth;
        //         break;
        //     }
        //     default: {
        //         $height = $bottom_height;
        //         $depth = $bottom_depth; 
        //     }
        // }

        // $item_woocommerce = get_field('woocommerce', $furniture_id);
        // $regular_price = floatval($item_woocommerce['regular_price']);
        // $discount_price = floatval($item_woocommerce['discount_price']);
            
        // $item_price = $discount_price > 0 ? 
        //     $discount_price : 
        //     $regular_price;
        list(
            $display_price,
            $regular_price,
            $discount_price,
            $display_price_cm3,
            $regular_price_cm3,
            $discount_price_cm3,
        )= get_item_prices($furniture_id);

        // $min_cm3 = $min_width * $min_height * $min_depth;
        // $current_cm3 = $width * $height * $depth;
        $cm3_mm = (($width - $min_width) * ($height - $min_height) * ($depth - $min_depth)) / 1000;  
        $cm3_cm = $cm3_mm / $PRICE_CM_CHUNK;  
        $cm3_total = $cm3_cm * $display_price_cm3;

        $totals += floatval($cm3_total + $display_price + $base_texture_price + $frame_texture_price);
    }

    $total = number_format($totals, 2, '.', '');

    return [
        $total,
        $base_texture_price,
        $frame_texture_price,
    ];
}


function get_furniture_type($furniture_id) {
    $terms = get_the_terms( $furniture_id, 'config-furniture-type' );

    if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
        $term = $terms[0];

        return $term;
    }

    return null;
}

function get_furniture_dimensions_by_type(
    $type_slug,
    $bottom_height_standard,
    $top_height_standard,
    $full_height_standard,
    $bottom_full_depth_standard,
    $top_depth_standard,
    $bottom_height_min = null,
    $bottom_height_max = null,
    $top_height_min = null,
    $top_height_max = null,
    $full_height_min = null,
    $full_height_max = null,
    $bottom_full_depth_min = null,
    $bottom_full_depth_max = null,
    $top_depth_min = null,
    $top_depth_max = null
) {
    global $furniture_type_bottom_slug, $furniture_type_bottom_corner_slug, $furniture_type_top_slug, $furniture_type_top_corner_slug, $furniture_type_full_slug, $furniture_type_full_corner_slug;

    $height = 0;
    $height_min = 0;
    $height_max = 0;
    $depth = 0;
    $depth_min = 0;
    $depth_max = 0;

    switch($type_slug) {
        case $type_slug == $furniture_type_bottom_slug || 
        $type_slug == $furniture_type_bottom_corner_slug : {
            $height = $bottom_height_standard;
            $depth = $bottom_full_depth_standard;

            $height_min = $bottom_height_min;
            $height_max = $bottom_height_max;
            $depth_min = $bottom_full_depth_min;
            $depth_max = $bottom_full_depth_max;

            break;
        }
           
        case $type_slug == $furniture_type_top_slug || 
        $type_slug == $furniture_type_top_corner_slug: {
            $height = $top_height_standard;
            $depth = $top_depth_standard;

            $height_min = $top_height_min;
            $height_max = $top_height_max;
            $depth_min = $top_depth_min;
            $depth_max = $top_depth_max;

            break;
        }

        default: {
            $height = $full_height_standard;
            $depth = $bottom_full_depth_standard;

            $height_min = $full_height_min;
            $height_max = $full_height_max;
            $depth_min = $bottom_full_depth_min;
            $depth_max = $bottom_full_depth_max;
        }
            
    }

    return [
        $height,
        $depth,
        $height_min,
        $height_max,
        $depth_min,
        $depth_max
    ];

}

function save_image($file_name) {
	if(!isset($_POST['image_data']) || !$_POST['image_data']) {
		return null;
	}
	$image_data = sanitize_text_field($_POST['image_data']);
	$image_data = str_replace('data:image/png;base64,', '', $image_data);
    $image_data = base64_decode($image_data); 
	if ($image_data === false) {
        return null;
    }

	$upload_dir = wp_upload_dir();
	$file_path = $upload_dir['path'] . '/' . $file_name;

	if (file_put_contents($file_path, $image_data)) {
        $file_url = $upload_dir['url'] . '/' . $file_name;

        $attachment = array(
            'guid' => $file_url,
            'post_mime_type' => 'image/png',
            'post_title' => sanitize_file_name($file_name),
            'post_content' => '',
            'post_status' => 'inherit',
        );

        // Insert the attachment into the media library
        $attach_id = wp_insert_attachment($attachment, $file_path);
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        $attach_data = wp_generate_attachment_metadata($attach_id, $file_path);
        wp_update_attachment_metadata($attach_id, $attach_data);

        return $file_url;
    } else {
        return null;
    }
}

