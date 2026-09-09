<?php 

// function get_user_configs($user_id) {
//     if(!$config_id) {
//         global $wpdb, $CONFIG_TABLE_NAME;
//         $config_table_name = $wpdb->prefix . "config_client_settings";

//         $sql = $wpdb->prepare(
//             "SELECT id FROM $config_table_name 
//             WHERE user_id = %d",
//             $user_id
//         );

//         $config_id = $wpdb->get_var($sql);
//     }

//     $config_table_result = get_settings_by_config_id($config_id);

//     if(!$config_table_result) return null;

//     $config_furniture_results = get_current_settings_furniture_list($config_id);

//     return [
//         $config_table_result,
//         $config_furniture_results,
//         $config_id,
//     ];
// }

function getUserConfigs($userId) {

    if(!$userId) {
        return null;
    }

    global $wpdb;
    $config_table_name = $wpdb->prefix . CONFIG_USER_TABLE_NAME;

    $sql = $wpdb->prepare(
        "SELECT id FROM $config_table_name 
        WHERE user_id = %d",
        $userId
    );

    $configs = $wpdb->get_results($sql);

    return $configs;
}

function getCurrentSettingsFurnitureList($config_id)
{
    global $wpdb;
    $config_child_table_name = $wpdb->prefix . CONFIG_USER_PRODUCTS_TABLE_NAME;

    $sql = $wpdb->prepare(
        "SELECT * FROM $config_child_table_name 
        WHERE config_id = %d",
        $config_id
    );

    $config_furniture_results = $wpdb->get_results($sql);

    return $config_furniture_results;
}

function getSettingsByConfigId($config_id, $user_id)
{
    if(!$config_id) return null;

    global $wpdb;
    $config_table_name = $wpdb->prefix . CONFIG_USER_TABLE_NAME;

    $sql = $wpdb->prepare(
        "SELECT * FROM {$config_table_name}
        WHERE id = %d AND user_id = %d",
        $config_id,
        $user_id,
    );

    $config_table_result = $wpdb->get_row($sql);

    return $config_table_result;
}

function getSettingsProductsByConfigId($config_id)
{
    if(!$config_id) return [];
    global $wpdb;
    $config_child_table_name = $wpdb->prefix . CONFIG_USER_PRODUCTS_TABLE_NAME;

    $sql = $wpdb->prepare(
        "SELECT * FROM $config_child_table_name 
        WHERE config_id = %d",
        $config_id
    );

    $config_products_results = $wpdb->get_results($sql);

    return $config_products_results;
}

function getAiSettingsProducts($products, $furnitureDimensions)
{
    if (empty($products)) {
        return [];
    }

    global 
        $FURNITURE_TYPE_BASE, 
        $FURNITURE_TYPE_FULL,
        $FURNITURE_TYPE_TOP;

    $productFullId = (int) get_theme_mod('furniture_full_default_id', 0);
    $productBottomId = (int) get_theme_mod('furniture_bottom_default_id', 0);
    $productTopId = (int) get_theme_mod('furniture_top_default_id', 0);

    $bottomQuery = get_products_query(null, 1, 1, $productBottomId);
    $bottomFurniture = $bottomQuery->posts[0] ?? null;

    $topQuery = get_products_query(null, 1, 1, $productTopId);
    $topFurniture = $topQuery->posts[0] ?? null;

    $fullQuery = get_products_query(null, 1, 1, $productFullId);
    $fullFurniture = $fullQuery->posts[0] ?? null;

    $furnitureMap = [
        $FURNITURE_TYPE_BASE => $bottomFurniture,
        $FURNITURE_TYPE_TOP => $topFurniture,
        $FURNITURE_TYPE_FULL => $fullFurniture,
    ];

    $bottomHeight = $furnitureDimensions['bottom_height'];
    $topHeight = $furnitureDimensions['top_height'];
    $fullHeight = $furnitureDimensions['full_height'];
    $bottomDepth = $furnitureDimensions['bottom_depth'];
    $topDepth = $furnitureDimensions['top_depth'];
    $fullDepth = $furnitureDimensions['full_depth'];
    $spaceBottom = $furnitureDimensions['space_bottom'];


    $productsLeftData = getFurnitureLeftTotal2(
        $fullFurniture, 
        $bottomFurniture, 
        $topFurniture, 
        $products->$FURNITURE_TYPE_FULL->items ?? [], 
        $products->$FURNITURE_TYPE_BASE->items ?? [], 
        $products->$FURNITURE_TYPE_TOP->items ?? [], 
    );

    $leftsArray = $productsLeftData['lefts_array'];

    $topFurnitureSpace = getTopFurnitureYPosition($bottomHeight, $spaceBottom);

    foreach($leftsArray as $furnitureType => $aiProductData) {
        $productItem = $furnitureMap[$furnitureType] ?? null;

        if(!$productItem) {
            continue;
        }

        $productId = $aiProductData['product_id'];
        $itemWidth = $aiProductData['width'];
        $itemList = $aiProductData['list'];
        // $itemLeftMm = $aiProductData['left'];

        $isFitting = 1;
        $itemHeight = 0;
        $itemDepth = 0;
        $itemSpaceBottom = 0;

        switch($furnitureType) {
            case $FURNITURE_TYPE_TOP: {
                $itemHeight = $topHeight;
                $itemDepth = $topDepth;
                $itemSpaceBottom = $topFurnitureSpace / 10;
                break;
            }
            case $FURNITURE_TYPE_BASE: {
                $itemHeight = $bottomHeight;
                $itemDepth = $bottomDepth;
                break;
            }
            default: {
                $itemHeight = $fullHeight;
                $itemDepth = $fullDepth;
                break;
            }
        }

        $furniturePosition = [
            'back' => 0,
            'bottom' => $itemSpaceBottom,
        ];

        foreach($itemList as $listItem) {
            $itemLeftMm = $listItem['left'];
        // for($i = 0; $i < $count; $i++) {
            $customId = uniqid();

            $furniturePosition['left'] = $itemLeftMm;

            $furniturePositionStr = json_encode($furniturePosition);

            $newList[] = (object) [
                'furniture_type' => $furnitureType,
                'custom_id' => $customId,
                'product_id' => $productId,
                'width' => $itemWidth,
                'height' => $itemHeight,
                'depth' => $itemDepth,
                'space_bottom' => $itemSpaceBottom,
                'furniture_position_mm' => $furniturePositionStr,
                'rotation' => null,
                'is_fitting' => $isFitting,
            ];
        }
    }

    return [
        'new_list' => $newList,
        'total_width' => $productsLeftData['total_width'],
    ];
}


function getTemplateByPostId($post_id)
{
    if(!$post_id) return;

    global $wpdb;
    $config_table_name = $wpdb->prefix . ADMIN_CONFIG_TEMPLATE_TABLE_NAME;

    $sql = $wpdb->prepare(
        "SELECT * FROM {$config_table_name}
        WHERE post_id = %d",
        $post_id,
    );

    $config_table_result = $wpdb->get_row($sql);

    return $config_table_result;
}

function getTemplateProductsByPostId($post_id, $room_type)
{
    if(!$post_id) return;

    global $wpdb;
    $config_child_table_name = $wpdb->prefix . ADMIN_CONFIG_TEMPLATE_PRODUCTS_TABLE_NAME;

    $sql = $wpdb->prepare(
        "SELECT * FROM $config_child_table_name 
        WHERE post_id = %d AND room_type = %s",
        $post_id,
        $room_type
    );

    $config_products_results = $wpdb->get_results($sql);

    return $config_products_results ? $config_products_results : [];
}

function createNewSettings($user_id, $main_settings, $aiTextures, $tempAttachment = true)
{
    global $wpdb, $FURNITURE_TYPE_FULL, $FURNITURE_TYPE_TOP, $FURNITURE_TYPE_BASE;

    $config_table_name = $wpdb->prefix . CONFIG_USER_TABLE_NAME;

    $room_settings = (array) $main_settings['room_settings'];
    $furniture_dimensions = (array) $main_settings['furniture_dimensions'];
    $furniture_dimensions_full = (array) $furniture_dimensions[$FURNITURE_TYPE_FULL];
    $furniture_dimensions_top = (array) $furniture_dimensions[$FURNITURE_TYPE_TOP];
    $furniture_dimensions_bottom = (array) $furniture_dimensions[$FURNITURE_TYPE_BASE];
    $defaultAiTextures = $tempAttachment ? null : json_encode($aiTextures);
    $tempAiTextures = $tempAttachment ? json_encode($aiTextures) : null;

    $sql = $wpdb->insert(
        $config_table_name,
        [
            'user_id'        => intval($user_id),
            'textures'     => json_encode($main_settings['textures']),
            'ai_textures'     => $defaultAiTextures,
            'temp_ai_textures'     => $tempAiTextures,
            'components'     => json_encode($main_settings['components']),
            'room_type'         => $room_settings['type'],
            'room_height'       => intval($room_settings['height']),
            'room_width'        => intval($room_settings['width']),
            'room_depth'        => intval($room_settings['depth']),
            // // 'bottom_height'       => intval($furniture_dimensions['bottom_height']),
            // // 'bottom_depth'       => intval($furniture_dimensions['bottom_depth']),
            // // 'top_height'       => intval($furniture_dimensions['top_height']),
            // // 'top_depth'       => intval($furniture_dimensions['top_depth']),
            // // 'full_height'       => intval($furniture_dimensions['full_height']),
            // // 'full_depth'       => intval($furniture_dimensions['full_depth']),
            'bottom_height'       => intval($furniture_dimensions_bottom['height']),
            'bottom_depth'       => intval($furniture_dimensions_bottom['depth']),
            'top_height'       => intval($furniture_dimensions_top['height']),
            'top_depth'       => intval($furniture_dimensions_top['depth']),
            'full_height'       => intval($furniture_dimensions_full['height']),
            'full_depth'       => intval($furniture_dimensions_full['depth']),
            'space_bottom'    => intval($furniture_dimensions_top['space_bottom']),
        ],
        [ '%d','%s','%s','%s','%s','%s','%d','%d','%d','%d','%d','%d','%d','%d','%d','%d' ]
    );
  
    $config_id = $wpdb->insert_id;

    return $config_id;
}

function updateExistingSettings($config_id, $user_id, $main_settings, $aiTextures, $tempAttachment = true)
{
    global $wpdb, $FURNITURE_TYPE_FULL, $FURNITURE_TYPE_TOP, $FURNITURE_TYPE_BASE;

    $config_table_name = $wpdb->prefix . CONFIG_USER_TABLE_NAME;

    $room_settings = (array) $main_settings['room_settings'];

    $furniture_dimensions = (array) $main_settings['furniture_dimensions'];
    $furniture_dimensions_full = (array) $furniture_dimensions[$FURNITURE_TYPE_FULL];
    $furniture_dimensions_top = (array) $furniture_dimensions[$FURNITURE_TYPE_TOP];
    $furniture_dimensions_bottom = (array) $furniture_dimensions[$FURNITURE_TYPE_BASE];
    $defaultAiTextures = $tempAttachment ? null : json_encode($aiTextures);
    $tempAiTextures = $tempAttachment ? json_encode($aiTextures) : null;

    $updated = $wpdb->update(
        $config_table_name,
        [
            'textures'     => json_encode($main_settings['textures']),
            'ai_textures'     => $defaultAiTextures,
            'temp_ai_textures'     => $tempAiTextures,
            'components'     => json_encode($main_settings['components']),
            'room_type'         => $room_settings['type'],
            'room_height'       => intval($room_settings['height']),
            'room_width'        => intval($room_settings['width']),
            'room_depth'        => intval($room_settings['depth']),
            'bottom_height'       => intval($furniture_dimensions_bottom['height']),
            'bottom_depth'       => intval($furniture_dimensions_bottom['depth']),
            'top_height'       => intval($furniture_dimensions_top['height']),
            'top_depth'       => intval($furniture_dimensions_top['depth']),
            'full_height'       => intval($furniture_dimensions_full['height']),
            'full_depth'       => intval($furniture_dimensions_full['depth']),
            'space_bottom'    => intval($furniture_dimensions_top['space_bottom'])
        ],
        [ 'id' => $config_id ], // WHERE
        [ '%s','%s','%s','%s','%s','%d','%d','%d','%d','%d','%d','%d','%d','%d','%d' ],
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

// function addFurnitureToSettingsConfig($config_id, $products_list)
// {
//     global $wpdb;

//     $config_child_table_name = $wpdb->prefix . CONFIG_USER_PRODUCTS_TABLE_NAME;

//     $create_values = [];
//     $create_placeholders = [];

//     $update_config_ids = [];
//     $update_cases_prices = [];
//     $update_cases_width = [];
//     $update_cases_height = [];
//     $update_cases_depth = [];
//     $update_cases_space_bottom = [];
//     $update_cases_furniture_position = [];
//     $update_cases_rotation = [];
//     $update_cases_is_fitting = [];
//     $update_cases_options = [];
//     $update_ids = [];
//     $custom_ids = [];

//     $existingCustomIds = getExistingCustomIds($config_child_table_name, $config_id);

//     foreach ($products_list as $product) {
//         $product = (array) $product;
//         $db_data = (array) $product['db_data'];
//         $custom_id = intval($db_data['custom_id']);
//         // $init_custom_id = intval($db_data['init_custom_id']);
//         $prices = $db_data['prices'];
//         $prices = is_string($prices) ? $prices : json_encode($prices);

//         $rotation = $db_data['rotation'] !== null 
//                     ? floatval($db_data['rotation']) 
//                     : "NULL";

//         $custom_ids[] = $custom_id;
//     error_log(print_r($db_data['options']));
//         $encoded_options = wp_json_encode($db_data['options']);
//         // $custom_ids[] = $init_custom_id;
//         if(isset($existingCustomIds[$custom_id])) {
//             $update_ids[] = $custom_id;

//             $update_cases_prices[] = "WHEN {$custom_id} THEN '" . $prices . "'";
//             $update_cases_width[] = "WHEN {$custom_id} THEN " . intval($db_data['width']);
//             $update_cases_height[] = "WHEN {$custom_id} THEN " . intval($db_data['height']);
//             $update_cases_depth[] = "WHEN {$custom_id} THEN " . intval($db_data['depth']);
//             $update_cases_space_bottom[] = "WHEN {$custom_id} THEN " . intval($db_data['space_bottom']);
//             $update_cases_furniture_position[] = "WHEN {$custom_id} THEN '" . $db_data['furniture_position_mm'] . "'";
//             $update_cases_rotation[] = is_null($rotation)
//                 ? "WHEN {$custom_id} THEN NULL"
//                 : "WHEN {$custom_id} THEN {$rotation}";
//             $update_cases_is_fitting[] = "WHEN {$custom_id} THEN " . intval($db_data['is_fitting']);
//             $update_cases_options[] = $wpdb->prepare(
//                 "WHEN %d THEN %s",
//                 $custom_id,
//                 $encoded_options
//             );
//         } else {
//             $product_id = $product['product_id'];
//             $create_values[] = $custom_id;
//             $create_values[] = $config_id;
//             $create_values[] = $product_id;
//             $create_values[] = get_the_title($product_id);
//             $create_values[] = $product['furniture_type'];
//             $create_values[] = $db_data['object_src'];
//             $create_values[] = $prices;
//             $create_values[] = intval($db_data['width']);
//             $create_values[] = intval($db_data['height']);
//             $create_values[] = intval($db_data['depth']);
//             $create_values[] = intval($db_data['space_bottom']);
//             $create_values[] = $db_data['furniture_position_mm'];
//             $create_values[] = $rotation;
//             // $create_values[] = $db_data['model_original_size'];
//             // $create_values[] = $db_data['model_scaled_size'];
//             // $create_values[] = $db_data['model_position'];
//             $create_values[] = intval($db_data['is_fitting']);
//             $create_values[] = $encoded_options;
//             $create_placeholders[] = "(%d,%d,%d,%s,%s,%s,%s,%d,%d,%d,%d,%s,%f,%d,%s)";
//             // $create_placeholders[] = "(%d,%d,%d,%s,%s,%s,%s,%d,%s,%d)";
//         }
//     }

//     $sql_insert = true;
//     if (!empty($create_placeholders)) {
//         $sql_insert = "INSERT INTO {$config_child_table_name} 
//             (custom_id,config_id,product_id,product_name,furniture_type,model_src,prices,width,height,depth,space_bottom,furniture_position_mm,rotation,is_fitting,options) 
//             VALUES " . implode(',', $create_placeholders);
//         $wpdb->query($wpdb->prepare($sql_insert, $create_values));
//         if ($wpdb->last_error) {
//             error_log("Insert error: " . $wpdb->last_error);
//         }
//     }

//     $sql_update = true;
//     if (!empty($update_ids)) {
//         $ids_str = implode(',', $update_ids);
//         $sql_update = "UPDATE {$config_child_table_name} SET 
//             prices = CASE custom_id " . implode(' ', $update_cases_prices) . " END,
//             width = CASE custom_id " . implode(' ', $update_cases_width) . " END,
//             height = CASE custom_id " . implode(' ', $update_cases_height) . " END,
//             depth = CASE custom_id " . implode(' ', $update_cases_depth) . " END,
//             space_bottom = CASE custom_id " . implode(' ', $update_cases_space_bottom) . " END,
//             furniture_position_mm = CASE custom_id " . implode(' ', $update_cases_furniture_position) . " END,
//             rotation = CASE custom_id " . implode(' ', $update_cases_rotation) . " END,
//             is_fitting = CASE custom_id " . implode(' ', $update_cases_is_fitting) . " END,
//             options = CASE custom_id " . implode(' ', $update_cases_options) . " END
//             WHERE custom_id IN ({$ids_str})";

//         $wpdb->query($sql_update);
//         if ($wpdb->last_error) {
//             error_log("Update error: " . $wpdb->last_error);
//         }

//         $sql_update = $sql_update || $sql_update == 0;
//     } 

//     $sql_removed = true;
//     if($sql_insert && $sql_update) {
//         $sql_removed = removeSettingsFurnitureListItems($config_id, $custom_ids);
//     }

//     return $sql_insert && $sql_update && $sql_removed;
// }

function addFurnitureToSettingsConfig($config_id, $products_list, $tempAttachment = true)
{
    global $wpdb;

    $table = $wpdb->prefix . CONFIG_USER_PRODUCTS_TABLE_NAME;

    $mod_products_list = [];

    $create_values = [];
    $create_rows = [];

    $update_ids = [];
    $update_cases = [
        // 'thumbnail_id' => [],
        // 'postcard_thumbnail_id' => [],
        'attachment_id' => [],
        'temp_attachment_id' => [],
        'prices' => [],
        'width' => [],
        'height' => [],
        'depth' => [],
        'space_bottom' => [],
        'furniture_position_mm' => [],
        'rotation' => [],
        'is_fitting' => [],
    ];

    $custom_ids = [];
    $existingCustomIds = getExistingCustomIds($table, $config_id);

    foreach ($products_list as $product) {
        $product = (array) $product;
        $db = (array) $product['db_data'];

        $custom_id = intval($db['custom_id']);
        $custom_ids[] = $custom_id;

        // ✅ Normalize prices
        $prices = is_string($db['prices']) 
            ? $db['prices'] 
            : wp_json_encode($db['prices']);

        // ✅ Rotation (proper NULL handling)
        $rotation = isset($db['rotation']) ? floatval($db['rotation']) : null;

        $attachment_id = intval($db['attachment_id']);
        $attachment_url = $product['attachment_url'];

        if(!empty($attachment_id)) {
            $attachment_data = move_temp_attachment_to_permanent_folder_or_replace($attachment_id, $tempAttachment);

            if(!empty($attachment_data) && isset($attachment_data['attachment_id'])) {
                $attachment_id = intval($attachment_data['attachment_id']);
                $attachment_url = $attachment_data['url'];
            } else {
                $attachment_id = null;
            }
        }

        $attachment_id = $attachment_id == 0 || !$attachment_id ? null : intval($attachment_id);

        if (isset($existingCustomIds[$custom_id])) {
            $update_ids[] = $custom_id;

            if(!$tempAttachment) {
                $update_cases['attachment_id'][] = $wpdb->prepare("WHEN %d THEN %s", $custom_id, $attachment_id);
                $update_cases['temp_attachment_id'][] = $wpdb->prepare("WHEN %d THEN %s", $custom_id, null);
                
            } else {
                $update_cases['attachment_id'][] = $wpdb->prepare("WHEN %d THEN %s", $custom_id, null);
                $update_cases['temp_attachment_id'][] = $wpdb->prepare("WHEN %d THEN %s", $custom_id, intval($attachment_id));
            }

            $update_cases['prices'][] = $wpdb->prepare("WHEN %d THEN %s", $custom_id, $prices);
            $update_cases['width'][] = $wpdb->prepare("WHEN %d THEN %d", $custom_id, intval($db['width']));
            $update_cases['height'][] = $wpdb->prepare("WHEN %d THEN %d", $custom_id, intval($db['height']));
            $update_cases['depth'][] = $wpdb->prepare("WHEN %d THEN %d", $custom_id, intval($db['depth']));
            $update_cases['space_bottom'][] = $wpdb->prepare("WHEN %d THEN %d", $custom_id, intval($db['space_bottom']));
            $update_cases['furniture_position_mm'][] = $wpdb->prepare("WHEN %d THEN %s", $custom_id, $db['furniture_position_mm']);
            $update_cases['rotation'][] = is_null($rotation)
                ? "WHEN {$custom_id} THEN NULL"
                : $wpdb->prepare("WHEN %d THEN %f", $custom_id, $rotation);
            $update_cases['is_fitting'][] = $wpdb->prepare("WHEN %d THEN %d", $custom_id, intval($db['is_fitting']));

        } else {
            $create_rows[] = "(%d,%d,%d,%s,%s,%s,%s,%d,%d,%d,%s,%d,%d,%d,%d,%s," . ($rotation === null ? "NULL" : "%f") . ",%d)";

            $create_values[] = $custom_id;
            $create_values[] = $config_id;
            $create_values[] = intval($product['product_id']);
            $create_values[] = get_the_title($product['product_id']);
            $create_values[] = $product['furniture_type'];
            $create_values[] = $db['object_src'];
            $create_values[] = $db['attachment_type'];

            if(!$tempAttachment) {
                $create_values[] = $attachment_id;
                $create_values[] = null;
            } else {
                $create_values[] = null;
                $create_values[] = $attachment_id;
            }

            $create_values[] = intval($db['has_brand_texture']);
            $create_values[] = $prices;
            $create_values[] = intval($db['width']);
            $create_values[] = intval($db['height']);
            $create_values[] = intval($db['depth']);
            $create_values[] = intval($db['space_bottom']);
            $create_values[] = $db['furniture_position_mm'];

            if ($rotation !== null) {
                $create_values[] = $rotation;
            }

            $create_values[] = intval($db['is_fitting']);
        }

        set_db_data_value($product, 'attachment_id', $attachment_id);
        set_product_value($product, 'attachment_url', $attachment_url);


        $mod_products_list[] = $product;
    }

    // ✅ INSERT
    $sql_insert = true;
    if (!empty($create_rows)) {
        $sql = "INSERT INTO {$table}
            (custom_id,config_id,product_id,product_name,furniture_type,model_src,attachment_type,attachment_id,temp_attachment_id,has_brand_texture,prices,width,height,depth,space_bottom,furniture_position_mm,rotation,is_fitting)
            VALUES " . implode(',', $create_rows);

        $wpdb->query($wpdb->prepare($sql, $create_values));

        if ($wpdb->last_error) {
            error_log("Insert error: " . $wpdb->last_error);
            $sql_insert = false;
        }
    }

    // ✅ UPDATE
    $sql_update = true;
    if (!empty($update_ids)) {
        $ids = implode(',', array_map('intval', $update_ids));

        $sql = "UPDATE {$table} SET
            attachment_id = CASE custom_id " . implode(' ', $update_cases['attachment_id']) . " END,
            temp_attachment_id = CASE custom_id " . implode(' ', $update_cases['temp_attachment_id']) . " END,
            prices = CASE custom_id " . implode(' ', $update_cases['prices']) . " END,
            width = CASE custom_id " . implode(' ', $update_cases['width']) . " END,
            height = CASE custom_id " . implode(' ', $update_cases['height']) . " END,
            depth = CASE custom_id " . implode(' ', $update_cases['depth']) . " END,
            space_bottom = CASE custom_id " . implode(' ', $update_cases['space_bottom']) . " END,
            furniture_position_mm = CASE custom_id " . implode(' ', $update_cases['furniture_position_mm']) . " END,
            rotation = CASE custom_id " . implode(' ', $update_cases['rotation']) . " END,
            is_fitting = CASE custom_id " . implode(' ', $update_cases['is_fitting']) . " END
            WHERE custom_id IN ($ids)";

        $wpdb->query($sql);

        if ($wpdb->last_error) {
            error_log("Update error: " . $wpdb->last_error);
            $sql_update = false;
        }
    }

    // ✅ REMOVE old
    $sql_removed = true;
    if ($sql_insert && $sql_update) {
        $sql_removed = removeSettingsFurnitureListItems($config_id, $custom_ids);
    }

    if(!($sql_insert && $sql_update && $sql_removed)) {
        return false;
    }

    return [
        'mod_products' => $mod_products_list,
    ];
}

function addFurnitureToNewSettingsConfig($config_id, $products_list, $tempAttachment = true)
{
    global $wpdb;

    $config_child_table_name = $wpdb->prefix . CONFIG_USER_PRODUCTS_TABLE_NAME;

    $mod_products_list = [];

    $create_values = [];
    $create_placeholders = [];
    $custom_ids = [];
    $newCustomIdsObj = [];

    foreach ($products_list as $product) {
        $product = (array) $product;
        $db_data = (array) $product['db_data'];
        $custom_id = $db_data['custom_id'];
        $prices = $db_data['prices'];
        $prices = is_string($prices) ? $prices : json_encode($prices);
        $custom_ids[] = $custom_id;

        $attachment_id = intval($db_data['attachment_id']);
        $attachment_url = $product['attachment_url'];

        if(!empty($attachment_id)) {
            $attachment_data = move_temp_attachment_to_permanent_folder_or_replace($attachment_id, $tempAttachment);
      
            if(!empty($attachment_data) && isset($attachment_data['attachment_id'])) {
                $attachment_id = $attachment_data['attachment_id'];
                $attachment_url = $attachment_data['url'];
            }
        }
        $attachment_id = $attachment_id == 0 || !$attachment_id ? null : intval($attachment_id);

        $product_id = $product['product_id'];
        $create_values[] = $custom_id;
        $create_values[] = $config_id;
        $create_values[] = $product_id;
        $create_values[] = get_the_title($product_id);
        $create_values[] = $product['furniture_type'];
        $create_values[] = $db_data['object_src'];
        $create_values[] = $db_data['attachment_type'];
        if($tempAttachment) {
            $create_values[] = null;
            $create_values[] = $attachment_id;
        } else {
            $create_values[] = $attachment_id;
            $create_values[] = null;
        }
        
        $create_values[] = $db_data['has_brand_texture'];
        $create_values[] = $prices;
        $create_values[] = intval($db_data['width']);
        $create_values[] = intval($db_data['height']);
        $create_values[] = intval($db_data['depth']);
        $create_values[] = intval($db_data['space_bottom']);
        $create_values[] = $db_data['furniture_position_mm'];
        $create_values[] = $db_data['rotation'] !== null ? floatval($db_data['rotation']) : null;
        $create_values[] = intval($db_data['is_fitting']);
        $create_placeholders[] = "(%d,%d,%d,%s,%s,%s,%s,%d,%d,%d,%s,%d,%d,%d,%d,%s,%f,%d)"; 

        set_db_data_value($product, 'attachment_id', $attachment_id);
        set_product_value($product, 'attachment_url', $attachment_url);


        $mod_products_list[] = $product;
    }

    $sql_insert = true;
    if (!empty($create_placeholders)) {
        $sql_insert = "INSERT INTO {$config_child_table_name} 
            (custom_id,config_id,product_id,product_name,furniture_type,model_src,attachment_type,attachment_id,temp_attachment_id,has_brand_texture,prices,width,height,depth,space_bottom,furniture_position_mm,rotation,is_fitting) 
            VALUES " . implode(',', $create_placeholders);
        $wpdb->query($wpdb->prepare($sql_insert, $create_values));
        if ($wpdb->last_error) {
            error_log("Insert error: " . $wpdb->last_error);
        }
    }

    if(!$sql_insert) {
        return false;
    }

    return [
        'mod_products' => $mod_products_list,
    ];
}

function removeSettingsFurnitureListItems($config_id, $custom_ids)
{
    global $wpdb;

    $config_child_table_name = $wpdb->prefix . CONFIG_USER_PRODUCTS_TABLE_NAME;

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


function getDefaultRoomSettings($savedSettings, $templateRoomType, $aiMinRoomWidth)
{
    global $wall_single;

    $furniture_list = [];
    $default_room_layout = null;

    $wall_height_min = (int) get_theme_mod('room_wall_height_min', 250);
    $wall_height_max = (int) get_theme_mod('room_wall_height_max', 250);
    $wall_height_standard = 0;

    $wall_width_min = (int) get_theme_mod('room_wall_width_min', 250);
    if($aiMinRoomWidth && $wall_width_min < $aiMinRoomWidth) {
        $wall_width_min = $aiMinRoomWidth;
    }
    $wall_width_max = (int) get_theme_mod('room_wall_width_max', 250);
    if($aiMinRoomWidth && $wall_width_max < $aiMinRoomWidth) {
        $wall_width_max = $aiMinRoomWidth;
    }
    $wall_width_standard = 0;

    $wall_depth_min = (int) get_theme_mod('room_wall_depth_min', 250);
    $wall_depth_max = (int) get_theme_mod('room_wall_depth_max', 250);
    $wall_depth_standard = 0;

    if($savedSettings) {        
        $default_room_layout = isset($savedSettings->room_type) ? $savedSettings->room_type : $templateRoomType;

        $wall_height_standard = (int) $savedSettings->room_height;
        $wall_width_standard = (int) $savedSettings->room_width;
        $wall_depth_standard = (int) $savedSettings->room_depth;
    } else {
        $default_room_layout = $wall_single;

        $wall_height_standard = (int) get_theme_mod('room_wall_height_standard', 250);
        $wall_width_standard = (int) get_theme_mod('room_wall_width_standard', 250);
        $wall_depth_standard = (int) get_theme_mod('room_wall_depth_standard', 250);
    }

    $wall_width_standard =
        $wall_width_standard < $wall_width_min || $wall_width_standard > $wall_width_max
            ? $wall_width_min
            : $wall_width_standard;

    $wall_height_standard =
        $wall_height_standard < $wall_height_min || $wall_height_standard > $wall_height_max
            ? $wall_height_min
            : $wall_height_standard;

    $wall_depth_standard =
        $wall_depth_standard < $wall_depth_min || $wall_depth_standard > $wall_depth_max
            ? $wall_depth_min
            : $wall_depth_standard;

    return [
        'default_room_layout' => $default_room_layout,
        'wall_height_min' => $wall_height_min,
        'wall_height_max' => $wall_height_max,
        'wall_height_standard' => $wall_height_standard,
        'wall_width_min' => $wall_width_min,
        'wall_width_max' => $wall_width_max,
        'wall_width_standard' => $wall_width_standard,
        'wall_depth_min' => $wall_depth_min,
        'wall_depth_max' => $wall_depth_max,
        'wall_depth_standard' => $wall_depth_standard,
    ];
}

function getDefaultFurnitureDimensions($savedSettings)
{
    $full_depth_standard = 0;
    $full_depth_min = (int) get_theme_mod('furniture_depth_full_min', 400);
    $full_depth_max = (int) get_theme_mod('furniture_depth_full_max', 700);

    $bottom_depth_standard = 0;
    $bottom_depth_min = (int) get_theme_mod('furniture_depth_bottom_min', 400);
    $bottom_depth_max = (int) get_theme_mod('furniture_depth_bottom_max', 700);

    $top_depth_standard = (int) get_theme_mod('furniture_depth_top_default', 500);
    $top_depth_min = (int) get_theme_mod('furniture_depth_top_min', 400);
    $top_depth_max = (int) get_theme_mod('furniture_depth_top_max', 700);

    $bottom_height_standard = 0;
    $bottom_height_min = (int) get_theme_mod('furniture_height_bottom_min', 1400);
    $bottom_height_max = (int) get_theme_mod('furniture_height_bottom_max', 2000);

    $top_height_standard = (int) get_theme_mod('furniture_height_top_default', 1500);
    $top_height_min = (int) get_theme_mod('furniture_height_top_min', 1400);
    $top_height_max = (int) get_theme_mod('furniture_height_top_max', 2000);

    $full_height_standard = 0;
    $full_height_min = (int) get_theme_mod('furniture_height_full_min', 1400);
    $full_height_max = (int) get_theme_mod('furniture_height_full_max', 2000);

    $space_bottom_standard = 0;
    $space_bottom_min = (int) get_theme_mod('furniture_space_bottom_min', 200);
    $space_bottom_max = (int) get_theme_mod('furniture_space_bottom_max', 700);

    if($savedSettings) {        
        $bottom_depth_standard = (int) $savedSettings->bottom_depth;
        $full_depth_standard = (int) $savedSettings->full_depth;
        $top_depth_standard = (int) $savedSettings->top_depth;

        $bottom_height_standard = (int) $savedSettings->bottom_height;
        $top_height_standard = (int) $savedSettings->top_height;
        $full_height_standard = (int) $savedSettings->full_height;

        $space_bottom_standard = (int) $savedSettings->space_bottom;
    } else {
        $bottom_depth_standard = (int) get_theme_mod('furniture_depth_bottom_default', 500);
        $full_depth_standard = (int) get_theme_mod('furniture_depth_full_default', 500);
        $top_depth_standard = (int) get_theme_mod('furniture_depth_top_default', 500);
        $bottom_height_standard = (int) get_theme_mod('furniture_height_bottom_default', 1500);
        $top_height_standard = (int) get_theme_mod('furniture_height_top_default', 1500);
        $full_height_standard = (int) get_theme_mod('furniture_height_full_default', 1500);
        $space_bottom_standard = (int) get_theme_mod('furniture_space_bottom_default', 500);
    }

    $largest_height_val = $full_height_max;
    $top_bottom_height_with_gap = $bottom_height_max + $top_height_max + $space_bottom_max;

     if($largest_height_val < $top_bottom_height_with_gap){
        $largest_height_val = $top_bottom_height_with_gap;
    } 

    return [
        'bottom_depth' => $bottom_depth_standard,
        'bottom_depth_min' => $bottom_depth_min,
        'bottom_depth_max' => $bottom_depth_max,
        'full_depth' => $full_depth_standard,
        'full_depth_min' => $full_depth_min,
        'full_depth_max' => $full_depth_max,
        'top_depth' => $top_depth_standard,
        'top_depth_min' => $top_depth_min,
        'top_depth_max' => $top_depth_max,
        'bottom_height' => $bottom_height_standard,
        'bottom_height_min' => $bottom_height_min,
        'bottom_height_max' => $bottom_height_max,
        'top_height' => $top_height_standard,
        'top_height_min' => $top_height_min,
        'top_height_max' => $top_height_max,
        'full_height' => $full_height_standard,
        'full_height_min' => $full_height_min,
        'full_height_max' => $full_height_max,
        'space_bottom' => $space_bottom_standard,
        'space_bottom_min' => $space_bottom_min,
        'space_bottom_max' => $space_bottom_max,
        'largest_height_val' => $largest_height_val,
    ];
}

// function getRoomSelectedTotals($products, $textures, $furnitureDimensionsByType, $components) {
//     $regular = 0;
//     $discount = 0;
//     $display = 0;

//     foreach($products as $product) {
//         $product_id = $product->product_id; 
//         $furnitureType = $product->furniture_type; 
//         $current_width = $product->width; 
//         $current_height = $product->height;
//         $current_depth = $product->depth; 

//         $dimensions = $furnitureDimensionsByType[$furnitureType];
//         $current_height = $current_height ?? $dimensions['height'];
//         $current_depth = $current_depth ?? $dimensions['depth'];

//         $prices = getProductTotals(
//             $product_id, 
//             $furnitureType,
//             $textures,
//             $current_width,
//             $current_height,
//             $current_depth,
//             $components,
//         );

//         $regular += floatval($prices['regular_total']);
//         $discount += floatval($prices['discount_total']);
//         $display += floatval($prices['display_total']);
//     }

//     return [
//         'regular' => $regular,
//         'discount' => $discount,
//         'display' => $display,
//     ];
// }

function getCornerFurnitureData() {
    global $BOTTOM_CORNER_SLUG, $TOP_CORNER_SLUG, $FULL_CORNER_SLUG;

    $bottomCornerLoop = get_products_query($BOTTOM_CORNER_SLUG, 1, 1);
    $bottomCornerPosts = $bottomCornerLoop->get_posts();
    $bottomCornerPost = $bottomCornerPosts[0] ?? null;
    $bottomCornerId = $bottomCornerPost->term_id ?? null;

    $topCornerLoop = get_products_query($TOP_CORNER_SLUG, 1, 1);
    $topCornerPosts = $topCornerLoop->get_posts();
    $topCornerPost = $topCornerPosts[0] ?? null;
    $topCornerId = $topCornerPost->term_id ?? null;

    $fullCornerLoop = get_products_query($FULL_CORNER_SLUG, 1, 1);
    $fullCornerPosts = $fullCornerLoop->get_posts();
    $fullCornerPost = $fullCornerPosts[0] ?? null;
    $fullCornerId = $fullCornerPost->term_id ?? null;

    return [
        $bottomCornerPost,
        $bottomCornerId,
        $topCornerPost,
        $topCornerId,
        $fullCornerPost,
        $fullCornerId
    ];
}

function getBottomCornerFurnitureDimensions(
    $bottomCornerItem, 
    $bottomCornerItemId, 
    $topCornerItem, 
    $topCornerItemId, 
    $fullCornerItem, 
    $fullCornerItemId
) {
    $bottom_width_standard = 0;
    $bottom_depth_standard = 0;
    $top_width_standard = 0;
    $top_depth_standard = 0;
    $full_width_standard = 0;
    $full_depth_standard = 0;

    if($bottomCornerItem) {
        $width = get_field('width', $bottomCornerItemId);
        $bottom_width_standard = $width['default'] ?? 0;
        $depth = get_field('depth', $bottomCornerItemId);
        $bottom_depth_standard = $depth['default'] ?? 0;
    } 

    if($topCornerItem) {
        $width = get_field('width', $topCornerItemId);
        $top_width_standard = $width['default'] ?? 0;
        $depth = get_field('depth', $topCornerItemId);
        $top_depth_standard = $depth['default'] ?? 0;
    } 

    if($fullCornerItem) {
        $width = get_field('width', $fullCornerItemId);
        $full_width_standard = $width['default'] ?? 0;
        $depth = get_field('depth', $fullCornerItemId);
        $full_depth_standard = $depth['default'] ?? 0;
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

function getFurnitureDimensionsByType(
    $typeSlug,
    $furnitureDimensions
) {
    global $FURNITURE_TYPE_FULL, $FURNITURE_TYPE_TOP, $FURNITURE_TYPE_BASE;

    $height = 0;
    $heightMin = 0;
    $heightMax = 0;
    $depth = 0;
    $depthMin = 0;
    $depthMax = 0;
    $spaceBottom = 0;
    $spaceBottomMin = 0;
    $spaceBottomMax = 0;

    if(strpos($typeSlug, $FURNITURE_TYPE_FULL) !== false) {
        $height = $furnitureDimensions['full_height'];
        $heightMin = $furnitureDimensions['full_height_min'];
        $heightMax = $furnitureDimensions['full_height_max'];
        $depth = $furnitureDimensions['full_depth'];
        $depthMin = $furnitureDimensions['full_depth_min'];
        $depthMax = $furnitureDimensions['full_depth_max'];
    } else if(strpos($typeSlug, $FURNITURE_TYPE_WALL) !== false) {
        $height = $furnitureDimensions['top_height'];
        $heightMin = $furnitureDimensions['top_height_min'];
        $heightMax = $furnitureDimensions['top_height_max'];
        $depth = $furnitureDimensions['top_depth'];
        $depthMin = $furnitureDimensions['top_depth_min'];
        $depthMax = $furnitureDimensions['top_depth_max'];
        $spaceBottom = $furnitureDimensions['space_bottom'];
        $spaceBottomMin = $furnitureDimensions['space_bottom_min'];
        $spaceBottomMax = $furnitureDimensions['space_bottom_max'];
    } else {
        $height = $furnitureDimensions['bottom_height'];
        $heightMin = $furnitureDimensions['bottom_height_min'];
        $heightMax = $furnitureDimensions['bottom_height_max'];
        $depth = $furnitureDimensions['bottom_depth'];
        $depthMin = $furnitureDimensions['bottom_depth_min'];
        $depthMax = $furnitureDimensions['bottom_depth_max'];
    }


    return [
        $height,
        $heightMin,
        $heightMax,
        $depth,
        $depthMin,
        $depthMax,
        $spaceBottom,
        $spaceBottomMin,
        $spaceBottomMax
    ];

}

function getFurnitureDimensionsArraySortedByType(
    $furnitureDimensions
) {
    global $FURNITURE_TYPE_FULL, $FURNITURE_TYPE_TOP, $FURNITURE_TYPE_WALL, $FURNITURE_TYPE_WALL_TOP, $FURNITURE_TYPE_BASE;
    $defaultSpaceBottom = 0;
    $array = [
        $FURNITURE_TYPE_FULL => [
            'height' => $furnitureDimensions['full_height'],
            'min_height' => $furnitureDimensions['full_height_min'],
            'max_height' => $furnitureDimensions['full_height_max'],
            'depth' => $furnitureDimensions['full_depth'],
            'min_depth' => $furnitureDimensions['full_depth_min'],
            'max_depth' => $furnitureDimensions['full_depth_max'],
            'space_bottom' => $defaultSpaceBottom,
            'min_space_bottom' => $defaultSpaceBottom,
            'max_space_bottom' => $defaultSpaceBottom,
        ],
        $FURNITURE_TYPE_TOP => [
            'height' => $furnitureDimensions['top_height'],
            'min_height' => $furnitureDimensions['top_height_min'],
            'max_height' => $furnitureDimensions['top_height_max'],
            'depth' => $furnitureDimensions['top_depth'],
            'min_depth' => $furnitureDimensions['top_depth_min'],
            'max_depth' => $furnitureDimensions['top_depth_max'],
            'space_bottom' => $furnitureDimensions['space_bottom'],
            'min_space_bottom' => $furnitureDimensions['space_bottom_min'],
            'max_space_bottom' => $furnitureDimensions['space_bottom_max'],
        ],
        $FURNITURE_TYPE_WALL => [
            'height' => $furnitureDimensions['full_height'],
            'min_height' => $furnitureDimensions['full_height_min'],
            'max_height' => $furnitureDimensions['full_height_max'],
            'depth' => $furnitureDimensions['full_depth'],
            'min_depth' => $furnitureDimensions['full_depth_min'],
            'max_depth' => $furnitureDimensions['full_depth_max'],
            'space_bottom' => $defaultSpaceBottom,
            'min_space_bottom' => $defaultSpaceBottom,
            'max_space_bottom' => $defaultSpaceBottom,
        ],
        $FURNITURE_TYPE_WALL_TOP => [
            'height' => $furnitureDimensions['top_height'],
            'min_height' => $furnitureDimensions['top_height_min'],
            'max_height' => $furnitureDimensions['top_height_max'],
            'depth' => $furnitureDimensions['top_depth'],
            'min_depth' => $furnitureDimensions['top_depth_min'],
            'max_depth' => $furnitureDimensions['top_depth_max'],
            'space_bottom' => $furnitureDimensions['space_bottom'],
            'min_space_bottom' => $furnitureDimensions['space_bottom_min'],
            'max_space_bottom' => $furnitureDimensions['space_bottom_max'],
        ],
        $FURNITURE_TYPE_BASE => [
            'height' => $furnitureDimensions['bottom_height'],
            'min_height' => $furnitureDimensions['bottom_height_min'],
            'max_height' => $furnitureDimensions['bottom_height_max'],
            'depth' => $furnitureDimensions['bottom_depth'],
            'min_depth' => $furnitureDimensions['bottom_depth_min'],
            'max_depth' => $furnitureDimensions['bottom_depth_max'],
            'space_bottom' => $defaultSpaceBottom,
            'min_space_bottom' => $defaultSpaceBottom,
            'max_space_bottom' => $defaultSpaceBottom,
        ],
        'largest_height' => $furnitureDimensions['largest_height_val'],
        // 'space_bottom' => [
        //     'current' => $furnitureDimensions['space_bottom'],
        //     'min' => $furnitureDimensions['space_bottom_min'],
        //     'max' => $furnitureDimensions['space_bottom_max'],
        // ],
    ];


    return $array;
}

// function calculateItemPrice(
//     $furniture_id, 
//     $item_width_min, 
//     $height_min, 
//     $depth_min,
//     $item_width,
//     $height,
//     $depth,
//     $default_base_texture_price, 
//     $default_frame_texture_price
// ) {
//     global $PRICE_CM_CHUNK;
//     /****** totals *******/
//     list(
//         $display_price,
//         $regular_price,
//         $discount_price,
//         $display_price_cm3,
//         $regular_price_cm3,
//         $discount_price_cm3,
//     ) = get_item_prices($furniture_id);

//     $cm3_mm = (($item_width - $item_width_min) * ($height - $height_min) * ($depth - $depth_min)) / 1000;
//     $cm3_cm = $cm3_mm / $PRICE_CM_CHUNK;  
//     $cm3_total = $cm3_cm * $display_price_cm3;

//     $item_total = floatval($cm3_total + $display_price + $default_base_texture_price + $default_frame_texture_price);

//     $item_total = number_format($item_total, 2, '.', '');

//     return [
//         $item_total,
//         $display_price,
//         $regular_price,
//         $discount_price,
//         $display_price_cm3,
//         $regular_price_cm3,
//         $discount_price_cm3,
//     ];
// }

function saveUpdateConfig($main_settings, $config_id, $user_id, $tempAttachment = true) {
    $newConfigOptionHtml = '';
    $main_settings = (array) $main_settings;
    $aiTextures = $main_settings['ai_textures'] ?? [];

    if(!$tempAttachment) {
        $aiTextures = save_ai_textures_attachments($aiTextures, $tempAttachment);
    }

    if($main_settings) {
        if($config_id > 0) {
            $updated = updateExistingSettings($config_id, $user_id, $main_settings, $aiTextures, $tempAttachment);

            if(!$updated) {
                wp_send_json_error(['message' => 'Failed updating the settings']);
            }
        } else {
            $config_id = createNewSettings($user_id, $main_settings, $aiTextures, $tempAttachment);

            if(!$config_id) {
                wp_send_json_error(['message' => 'Missing configurator item']);
            }
            $newConfigOptionHtml = "<option value='$config_id' selected='selected'>$config_id</option>";
        }
    }

    return [
        'config_id' => $config_id,
        'new_config_option_html' => $newConfigOptionHtml,
        'ai_textures' => $aiTextures,
    ];
}

function get_room_templates_categories($parentId = null) 
{
    $args = [
        'taxonomy'   => 'config-template-categories',
        'parent' => $parentId ?? 0,
        'hide_empty' => true,
        'orderby'    => 'name',
        'order'      => 'ASC',
    ];

    $terms = get_terms($args);

    return $terms;
}

function get_templates_query($categorySlug = null) {
    global $wpdb;

    $parent_table_name = $wpdb->prefix . ADMIN_CONFIG_TEMPLATE_TABLE_NAME;

    $taxonomies = [];  

    $args = array(  
        'post_type' => 'config-templates',
        'posts_per_page' => -1,
        'post_status'    => array('publish', 'pending'),
    );

    if($categorySlug) {
        $taxonomies[] = array(
            'taxonomy' => 'config-template-categories',
            'field' => 'slug', 
            'terms' => $categorySlug,
            'include_children' => false
        );
    }

    if(!empty($taxonomies)) {
        $args['tax_query'] = $taxonomies;
    }

    $loop = new WP_Query($args);

    /******* must have config data******/

    // Add JOIN
    add_filter('posts_join', function($join) use ($parent_table_name, $wpdb) {
        return $join . " INNER JOIN $parent_table_name parent_table 
                         ON parent_table.post_id = {$wpdb->posts}.ID ";
    });

    // Optional: prevent duplicates
    add_filter('posts_groupby', function($groupby) use ($wpdb) {
        return "{$wpdb->posts}.ID";
    });

    $loop = new WP_Query($args);

    // Remove filters after query
    remove_all_filters('posts_join');
    remove_all_filters('posts_groupby');


    return $loop;
}

function getExistingCustomIds($config_child_table_name, $config_id, $post_id = null) {
    global $wpdb;

    // Decide the WHERE clause and value
    $where_column = $post_id ? 'post_id' : 'config_id';
    $value        = $post_id ? intval($post_id) : intval($config_id);

    // Always select 'custom_id'
    $existing_ids = $wpdb->get_col(
        $wpdb->prepare(
            "SELECT custom_id FROM {$config_child_table_name} WHERE $where_column = %d",
            $value
        )
    );

    // Convert to integers and flip
    $existing_ids = array_map('intval', $existing_ids);
    $existing_ids = array_flip($existing_ids);

    return $existing_ids;
}

function normalize_dimension($value, $min, $max) {
    if ($value < $min) return $min;
    if ($value > $max) return $max;
    return $value;
}

function renderSelectedProducts($products, $defaultTextures, $furnitureDimensionsSortedByType, $standImageData) {
    global 
        $furniture_config_v2_template_parts_url, 
        $furniture_type_bottom_corner_slug, 
        $furniture_type_top_corner_slug, 
        $furniture_type_full_corner_slug,
        $FURNITURE_TYPE_BASE, 
        $FURNITURE_TYPE_FULL,
        $FURNITURE_TYPE_TOP;

    $myItemsHtml = '';
    $summaryItemsHtml = '';

    $furniture_list_objects = [];
    $bottomCornerItemId = null;
    $topCornerItemId = null;
    $fullCornerItemId = null;
    $regularTotals = 0;
    $discountTotals = 0;

    foreach($products as $productItem) {
        $productId = $productItem->product_id;
        $configId = $productItem->config_id ?? null;
        $postId = $productItem->post_id ?? null;
        $customId = $productItem->custom_id;
        $productTitle = get_the_title($productId);
        $model_file_url = get_field('3d_image', $productId);
        $productFurnitureTypes = get_the_terms($productId, 'config-furniture-type');
        $itemWidth = $productItem->width;
        $itemHeight = $productItem->height;
        $itemDepth = $productItem->depth;
        $itemSpaceBottom = $productItem->space_bottom;
        $is_fitting = $productItem->is_fitting;
        $furniturePositionMm = $productItem->furniture_position_mm ?? '{}';
		$hasBrandTexture = get_field('has_brand_texture', $productId);
        $rotation = $productItem->rotation;

        $furnitureType = null;
        $furnitureTypeSlug = '';
        if(!empty($productFurnitureTypes)) {
            $furnitureType = $productFurnitureTypes[0];
            $furnitureTypeSlug = $furnitureType->slug;
        }

        switch($furnitureTypeSlug) {
            case $furniture_type_bottom_corner_slug: {
                $bottomCornerItemId = $productId;
                break;
            }
            case $furniture_type_top_corner_slug: {
                $topCornerItemId = $productId;
                break;
            }
            case $furniture_type_full_corner_slug: {
                $fullCornerItemId = $productId;
                break;
            }
            default: {
                break;
            }
        }

        $width_obj = get_field('width', $productId);
        $itemWidthMin = $width_obj['min'];
        $itemWidthMax = $width_obj['max'];

        // if($itemWidth < $itemWidthMin || $itemWidth > $itemWidthMax) {
        //     $itemWidth = $itemWidthMin;
        // }

        $currentDimensions = $furnitureDimensionsSortedByType[$furnitureTypeSlug];

        $height_obj = get_field('height', $productId);
        $itemHeightData = intval($height_obj['default']);
        $itemHeightMin = 0;
        $itemHeightMax = 0;
        if(!$currentDimensions || $itemHeightData && $itemHeightData > 0) {
            $itemHeightMin = $height_obj['min'];
            $itemHeightMax = $height_obj['max'];
        } else {
            $itemHeightMin = $currentDimensions['min_height'];
            $itemHeightMax = $currentDimensions['max_height'];
        }

        // if($itemHeight < $itemHeightMin || $itemHeight > $itemHeightMax) {
        //     $itemHeight = $itemHeightMin;
        // }

        $depth_obj = get_field('depth', $productId);
        $itemDepthData = intval($depth_obj['default']);
        $itemDepthMin = 0;
        $itemDepthMax = 0;
        if($itemDepthData && $itemDepthData > 0) {
            $itemDepthMin = $depth_obj['min'];
            $itemDepthMax = $depth_obj['max'];
        } else {
            $itemDepthMin = $currentDimensions['min_depth'];
            $itemDepthMax = $currentDimensions['max_depth'];
        }

        // if($itemDepth < $itemDepthMin || $itemDepth > $itemDepthMax) {
        //     $itemDepth = $itemDepthMin;
        // }

        $space_bottom_obj = get_field('space_bottom', $productId);
        $itemSpaceBottomData = isset($space_bottom_obj['default']) ? intval($space_bottom_obj['default']) : null;
        $itemSpaceBottomMin = 0;
        $itemSpaceBottomMax = 0;
        if($itemSpaceBottomData && $itemSpaceBottomData > 0) {
            $itemSpaceBottomMin = $space_bottom_obj['min'];
            $itemSpaceBottomMax = $space_bottom_obj['max'];
        } else {
            $itemSpaceBottomMin = $currentDimensions['min_space_bottom'];
            $itemSpaceBottomMax = $currentDimensions['max_space_bottom'];
        }

        // if($itemSpaceBottom < $itemSpaceBottomMin || $itemSpaceBottom > $itemSpaceBottomMax) {
        //     $itemSpaceBottom = $itemSpaceBottomMin;
        // }

        /****** totals *******/

        $priceData = getProductTotals(
           $productId, 
           $furnitureTypeSlug,
           $hasBrandTexture,
           $defaultTextures,
           $itemWidth,
           $itemHeight,
           $itemDepth,
           null,
           false,
           false,
        );

        $total = (float) $priceData['regular_total'];
        $discount_total = (float) $priceData['discount_total'];
        $display_total = (float) $priceData['display_total'];

        $regularTotals += $total;
        $discountTotals += $discount_total;
        

        /****** end totals *******/

        $thumbnailData = getProductThumbnailData($standImageData, $productId);
        $attachmentUrl = $thumbnailData['url'] ?? null;
        $attachmentId = $thumbnailData['id'] ?? null;
        $attachmentType = $thumbnailData['attachmentType'] ?? null;


        $furniture_list_objects[] = array(
            'product_id' => $productId,
            'config_id' => $configId, 
            'post_id' => $postId, 
            'furniture_type' => $furnitureTypeSlug,
            'min_width' => $itemWidthMin,
            'max_width' => $itemWidthMax,
            'min_height' => $itemHeightMin,
            'max_height' => $itemHeightMax,
            'min_depth' => $itemDepthMin,
            'max_depth' => $itemDepthMax,
            'min_space_bottom' => $itemSpaceBottomMin,
            'max_space_bottom' => $itemSpaceBottomMax,
            'attachment_url' => $attachmentUrl,
            'db_data' => [
                'custom_id' => $customId,
                'width' => $itemWidth,
                'height' => $itemHeight,
                'depth' => $itemDepth,
                'space_bottom' => $itemSpaceBottom,
                'furniture_position_mm' => $furniturePositionMm,
                'is_fitting' => $productItem->is_fitting,
                'rotation' => $rotation,
                'prices' => $priceData,
                'object_src' => $model_file_url,
                'attachment_type' => $attachmentType,
                'attachment_id' => $attachmentId,
                'has_brand_texture' => $hasBrandTexture,
            ],
        );

        ob_start();
        include $furniture_config_v2_template_parts_url . "/room/steps/play-edit/cabinets/my-cabinet-item.php";

        $myItemsHtml .= ob_get_clean();

        ob_start();
        include $furniture_config_v2_template_parts_url . "/room/steps/summary/summary-cabinet-item.php";
        $summaryItemsHtml .= ob_get_clean();
    }

    $display_items_total = (float) $discountTotals > 0 ? discountTotals : $regularTotals; 

    return [
        'my_items_html' => $myItemsHtml,
        'summary_items_html' => $summaryItemsHtml,
        'furniture_list_objects' => $furniture_list_objects,
        'bottom_corner_item_id' => $bottomCornerItemId,
        'top_corner_item_id' => $topCornerItemId,
        'full_corner_item_id' => $fullCornerItemId,
        'regular_total' => number_format($regularTotals, 2, '.', ''),
        'discount_total' => number_format($discountTotals, 2, '.', ''),
        'all_totals' => [
            'regular' => $regularTotals,
            'discount' => $discountTotals,
            'display' => $display_items_total,
        ],
    ];
}

// function getAiFurnitureList($aiList, $roomType, $defaultTextures, $furnitureDimensionsSortedByType) 
// {
//     global 
//         $furniture_config_v2_template_parts_url, 
//         $furniture_type_bottom_corner_slug, 
//         $furniture_type_top_corner_slug, 
//         $furniture_type_full_corner_slug,
//         $FURNITURE_TYPE_BASE, 
//         $FURNITURE_TYPE_FULL,
//         $FURNITURE_TYPE_TOP;

//     $myItemsHtml = [];
//     $summaryItemsHtml = [];

//     $furniture_list_objects = [];
//     $bottomCornerItemId = null;
//     $topCornerItemId = null;
//     $fullCornerItemId = null;
//     $regularTotals = 0;
//     $discountTotals = 0;

//     $bottomFurniture = get_products_query([$FURNITURE_TYPE_BASE], 1, 1);
//     $bottomFurniture = $bottomFurniture[0] ?? null;
//     $topFurniture = get_products_query([$FURNITURE_TYPE_TOP], 1, 1);
//     $topFurniture = $topFurniture[0] ?? null;
//     $fullFurniture = get_products_query([$FURNITURE_TYPE_FULL], 1, 1);
//     $fullFurniture = $fullFurniture[0] ?? null;

//     $furnitureMap = [
//         $FURNITURE_TYPE_BASE => $bottomFurniture,
//         $FURNITURE_TYPE_TOP => $topFurniture,
//         $FURNITURE_TYPE_FULL => $fullFurniture,
//     ];

//     foreach($aiList as $furnitureType => $aiProduct) {
//         $count = (int) $aiProduct->count;
//         $productItem = $furnitureMap[furnitureType] ?? null;

//         if(!$productItem) {
//             continue;
//         }

//         $productId = $productItem->product_id;
//         $productTitle = get_the_title($productId);
//         $model_file_url = get_field('3d_image', $productId);
//         $itemWidth = 0;
//         $itemHeight = 0;
//         $itemDepth = 0;
//         $itemDepth = 0;
//         $itemSpaceBottom = 0;
//         $furniturePositionMm = '{}';
// 		$hasBrandTexture = get_field('has_brand_texture', $productId);
//         $rotation = null;
//         $is_fitting = true;

//         switch($furnitureType) {
//             case $furniture_type_bottom_corner_slug: {
//                 $bottomCornerItemId = $productId;
//                 break;
//             }
//             case $furniture_type_top_corner_slug: {
//                 $topCornerItemId = $productId;
//                 break;
//             }
//             case $furniture_type_full_corner_slug: {
//                 $fullCornerItemId = $productId;
//                 break;
//             }
//             default: {
//                 break;
//             }
//         }

//         $width_obj = get_field('width', $productId);
//         $itemWidthMin = $width_obj['min'];
//         $itemWidthMax = $width_obj['max'];

//         if($itemWidth < $itemWidthMin || $itemWidth > $itemWidthMax) {
//             $itemWidth = $itemWidthMin;
//         }


//         $currentDimensions = $furnitureDimensionsSortedByType[$furnitureType];

//         $height_obj = get_field('height', $productId);
//         $itemHeightData = intval($height_obj['default']);
//         $itemHeightMin = 0;
//         $itemHeightMax = 0;
//         if(!$currentDimensions || $itemHeightData && $itemHeightData > 0) {
//             $itemHeightMin = $height_obj['min'];
//             $itemHeightMax = $height_obj['max'];
//         } else {
//             $itemHeightMin = $currentDimensions['min_height'];
//             $itemHeightMax = $currentDimensions['max_height'];
//         }

//         if($itemHeight < $itemHeightMin || $itemHeight > $itemHeightMax) {
//             $itemHeight = $itemHeightMin;
//         }

//         $depth_obj = get_field('depth', $productId);
//         $itemDepthData = intval($depth_obj['default']);
//         $itemDepthMin = 0;
//         $itemDepthMax = 0;
//         if($itemDepthData && $itemDepthData > 0) {
//             $itemDepthMin = $depth_obj['min'];
//             $itemDepthMax = $depth_obj['max'];
//         } else {
//             $itemDepthMin = $currentDimensions['min_depth'];
//             $itemDepthMax = $currentDimensions['max_depth'];
//         }

//         if($itemDepth < $itemDepthMin || $itemDepth > $itemDepthMax) {
//             $itemDepth = $itemDepthMin;
//         }

//         $space_bottom_obj = get_field('space_bottom', $productId);
//         $itemSpaceBottomData = isset($space_bottom_obj['default']) ? intval($space_bottom_obj['default']) : null;
//         $itemSpaceBottomMin = 0;
//         $itemSpaceBottomMax = 0;
//         if($itemSpaceBottomData && $itemSpaceBottomData > 0) {
//             $itemSpaceBottomMin = $space_bottom_obj['min'];
//             $itemSpaceBottomMax = $space_bottom_obj['max'];
//         } else {
//             $itemSpaceBottomMin = $currentDimensions['min_space_bottom'];
//             $itemSpaceBottomMax = $currentDimensions['max_space_bottom'];
//         }

//         if($itemSpaceBottom < $itemSpaceBottomMin || $itemSpaceBottom > $itemSpaceBottomMax) {
//             $itemSpaceBottom = $itemSpaceBottomMin;
//         }

//         /****** totals *******/

//         $priceData = getProductTotals(
//            $productId, 
//            $furnitureType,
//            $hasBrandTexture,
//            $defaultTextures,
//            $itemWidth,
//            $itemHeight,
//            $itemDepth,
//            null,
//            false,
//            false,
//         );

//         $total = (float) $priceData['regular_total'];
//         $discount_total = (float) $priceData['discount_total'];
//         $display_total = (float) $priceData['display_total'];

//         $totals += $total;
//         $discountTotals += $discount_total;
        

//         /****** end totals *******/

//         $thumbnailData = getProductThumbnailData($standImageData, $productId);
//         $attachmentUrl = $thumbnailData['url'] ?? null;
//         $attachmentId = $thumbnailData['id'] ?? null;
//         $attachmentType = $thumbnailData['attachmentType'] ?? null;

//         for($i = 0; $i < $count; $i++) {
//             $customId = round(microtime(true) * 1000);

//             $furniture_list_objects[] = array(
//                 'product_id' => $productId,
//                 'config_id' => null, 
//                 'post_id' => null, 
//                 'furniture_type' => $furnitureType,
//                 'min_width' => $itemWidthMin,
//                 'max_width' => $itemWidthMax,
//                 'min_height' => $itemHeightMin,
//                 'max_height' => $itemHeightMax,
//                 'min_depth' => $itemDepthMin,
//                 'max_depth' => $itemDepthMax,
//                 'min_space_bottom' => $itemSpaceBottomMin,
//                 'max_space_bottom' => $itemSpaceBottomMax,
//                 'attachment_url' => $attachmentUrl,
//                 'db_data' => [
//                     'custom_id' => $customId,
//                     'width' => $itemWidth,
//                     'height' => $itemHeight,
//                     'depth' => $itemDepth,
//                     'space_bottom' => $itemSpaceBottom,
//                     'furniture_position_mm' => $furniturePositionMm,
//                     'is_fitting' => $is_fitting,
//                     'rotation' => $rotation,
//                     'prices' => $priceData,
//                     'object_src' => $model_file_url,
//                     'attachment_type' => $attachmentType,
//                     'attachment_id' => $attachmentId,
//                     'has_brand_texture' => $hasBrandTexture,
//                 ],
//             );

//             ob_start();
//             include $furniture_config_v2_template_parts_url . "/room/steps/products-content/play-edit/my-cabinet-item.php";

//             $myItemsHtml[] .= ob_get_clean();

//             ob_start();
//             include $furniture_config_v2_template_parts_url . "/room/steps/summary/summary-cabinet-item.php";
//             $summaryItemsHtml[] .= ob_get_clean();
//         }
  
//     }

//     $display_items_total = (float) $discountTotals > 0 ? discountTotals : $regularTotals; 

//     return [
//         'my_items_html' => $myItemsHtml,
//         'summary_items_html' => $summaryItemsHtml,
//         'furniture_list_objects' => $furniture_list_objects,
//         'bottom_corner_item_id' => $bottomCornerItemId,
//         'top_corner_item_id' => $topCornerItemId,
//         'full_corner_item_id' => $fullCornerItemId,
//         'regular_total' => number_format($regularTotals, 2, '.', ''),
//         'discount_total' => number_format($discountTotals, 2, '.', ''),
//         'all_totals' => [
//             'regular' => $regularTotals,
//             'discount' => $discountTotals,
//             'display' => $display_items_total,
//         ],
//     ];
// }

function getTopFurnitureYPosition($bottomHeight, $defaultBottomSpace) {
    $bottom = $bottomHeight + $defaultBottomSpace;

    return $bottom;
}

function getFurnitureLeftTotal($modifiedArray, $aiProduct, $productItem, $currentType, $fullList, $fullListCount, $itemFullWidth) 
{

    if(!$productItem) return;

    $productId = $productItem->ID;
    $width_obj = get_field('width', $productId);
    $itemWidth = (int) $width_obj['default'];

    $list = $aiProduct->items;
    $listCount = count($list);
    $totalLeft = $listCount * $itemWidth + $fullListCount * $itemFullWidth;

    // foreach($list as $index => $listObj) {
    for($i = $listCount - 1; $i >= 0; $i--) {
        $listObj = $list[$i];
        $left = $listObj->bottom_left[1] ?? 0;
        $iIndex = "$currentType-$i";

        $fullListMod = $fullList;
        $fullListModCount = count($fullListMod);

        if($fullListModCount === 0) {
            if(!in_array($iIndex, $modifiedArray[$currentType]['list'])) {
                $leftMm = $totalLeft - $itemWidth;
                $modifiedArray[$currentType]['list'][] = [
                    'id' => $iIndex,
                    'type' => $currentType,
                    'left' => $fullLeftMm,
                ];
            }

            continue;
        }
        for($j = $fullListModCount - 1; $j >= 0; $j--) {
            $fullListObj = $fullListMod[$j];
            $fullLeft = $fullListObj->bottom_left[1] ?? 0;

            if($left < $fullLeft) {
                $jIndex = "$FURNITURE_TYPE_FULL-$j";
                if(!in_array($jIndex, $modifiedArray[$FURNITURE_TYPE_FULL])) {
                    $fullLeftMm = $totalLeft - $itemFullWidth;

                    $modifiedArray[$FURNITURE_TYPE_FULL]['list'][] = [
                        'id' => $jIndex,
                        'type' => $FURNITURE_TYPE_FULL,
                        'left' => $fullLeftMm,
                    ];
                    array_splice($fullList, $j, 1);
                }

            } else {
                if(!in_array($iIndex, $modifiedArray[$currentType]['list'])) {
                    $leftMm = $totalLeft - $itemWidth;
                    $modifiedArray[$currentType]['list'][] = [
                        'id' => $iIndex,
                        'type' => $currentType,
                        'left' => $fullLeftMm,
                    ];
                }
                continue;
            }
        }
    }

    return $modifiedArray;
}

function getFurnitureLeftTotal2($fProductItem, $bProductItem, $tProductItem, $fList, $bList, $tList) 
{
    if(!$fProductItem && !$bProductItem && !$tProductItem) return;

    global 
        $FURNITURE_TYPE_BASE, 
        $FURNITURE_TYPE_FULL,
        $FURNITURE_TYPE_TOP;

    $fProductId = $fProductItem->ID ?? null;
    $width_obj = get_field('width', $fProductId);
    $fItemWidth = (int) $width_obj['default'];

    $bProductId = $bProductItem->ID ?? null;
    $width_obj = get_field('width', $bProductId);
    $bItemWidth = (int) $width_obj['default'];

    $tProductId = $tProductItem->ID ?? null;
    $width_obj = get_field('width', $tProductId);
    $tItemWidth = (int) $width_obj['default'];

    
    $xPositionArr = [
        $FURNITURE_TYPE_FULL => [
            'product_id' => $fProductId,
            'width' => $fItemWidth,
            'list' => []
        ],
        $FURNITURE_TYPE_BASE => [
            'product_id' => $bProductId,
            'width' => $bItemWidth,
            'list' => []
        ],
        $FURNITURE_TYPE_TOP => [
            'product_id' => $tProductId,
            'width' => $tItemWidth,
            'list' => []
        ],
    ];

    $fListCount = count($fList);
    $bListCount = count($bList);
    $tListCount = count($tList);

    $totalWidthBottom = $fListCount * $fItemWidth + $bListCount * $bItemWidth;
    $totalBottomTop = $tListCount * $tItemWidth + $bListCount * $bItemWidth;
    $totalWidth = 0;
    if($totalWidthBottom > $totalBottomTop) {
        $totalWidth = (int)$totalWidthBottom / 10;
    } else {
        $totalWidth = (int) $totalBottomTop / 10;
    }

    if($fListCount > 0) {
        $leftCurrent = 0;
        $bListOriginal = $bList;
        $tListOriginal = $tList;
        for($i = 0; $i < $fListCount; $i++) {
            $fListObj = $fList[$i];
            $left = $fListObj->bottom_left[0] ?? 0;
            $fIndex = "$FURNITURE_TYPE_FULL-$i";
            $fLeftMm = $leftCurrent;

            $bListMod = $bList;
            $bListModCount = count($bList);
            $bLeftMm = null;
            $tListMod = $tList;
            $tListModCount = count($tList);
            $tLeftMm = null;

            $bData = topBottomXData($xPositionArr, $bItemWidth, $bListMod, $bListModCount, $FURNITURE_TYPE_BASE, $fLeftMm, $left, $bList);
            $bLeftMm = $bData['total_left'];
            // $fLeftMm = $bData['total_left'];
            $bList = $bData['list'];
            $xPositionArr = $bData['mod_array'];

            $tData = topBottomXData($xPositionArr, $tItemWidth, $tListMod, $tListModCount, $FURNITURE_TYPE_TOP, $fLeftMm, $left,  $tList);
            $tLeftMm = $tData['total_left'];
            // $fLeftMm = $bData['total_left'];
            $tList = $tData['list'];
            $xPositionArr = $tData['mod_array'];

            if($bLeftMm && $tLeftMm) {
                if($bLeftMm > $tLeftMm) {
                    $fLeftMm = $bLeftMm;
                } else {
                    $fLeftMm = $tLeftMm;
                }
            } else if($bLeftMm) {
                $fLeftMm = $bLeftMm;
            } else if($tLeftMm) {
                $fLeftMm = $tLeftMm;
            } 

            $xPositionArr[$FURNITURE_TYPE_FULL]['list'][$fIndex] = [
                'left' => $fLeftMm / 10,
            ];
            $leftCurrent = $fLeftMm + $fItemWidth;
        }

        $bListMod = $bListOriginal;
        $bListModCount = count($bListOriginal);
        $bData = topBottomXData($xPositionArr, $bItemWidth, $bListMod, $bListModCount, $FURNITURE_TYPE_BASE, $leftCurrent);
        $xPositionArr = $bData['mod_array'];

        $tListMod = $tListOriginal;
        $tListModCount = count($tListOriginal);
        $tData = topBottomXData($xPositionArr, $tItemWidth, $tListMod, $tListModCount, $FURNITURE_TYPE_TOP, $leftCurrent);
        $xPositionArr = $tData['mod_array'];

    } else {
        $bListCount = count($bList);
        $bData = topBottomXData($xPositionArr, $bItemWidth, $bList, $bListCount, $FURNITURE_TYPE_BASE);
        $xPositionArr = $bData['mod_array'];

        $tListCount = count($tList);
        $tData = topBottomXData($xPositionArr, $tItemWidth, $tList, $tListCount, $FURNITURE_TYPE_TOP);
        $xPositionArr = $tData['mod_array'];
    }

    return [
        'lefts_array' => $xPositionArr,
        'total_width' => $totalWidth,
    ];
}

function topBottomXData($modifiedArray, $itemWidth, $listMod, $listModCount, $furnitureType, $totalLeft = 0, $leftAi = null, $list = null) 
{  
    $leftMm = null;

    for($j = 0; $j < $listModCount; $j++) {
        $listObj = $listMod[$j];
        $currentLeft = $listObj->bottom_left[0] ?? 0;

        if($leftAi !== null && $leftAi < $currentLeft) {
            error_log("break --------- ");
            break;
        }

        $index = "$furnitureType-$j";
        if(!isset($modifiedArray[$furnitureType]['list'][$index])) {
            $leftMm = $totalLeft;

            $modifiedArray[$furnitureType]['list'][$index] = [
                'left' => $leftMm / 10,
            ];

            $totalLeft += $itemWidth;

            if (is_array($list)) {
                array_splice($list, $j, 1);
            }

        }
    }

    return [
        // 'left_mm' => $leftMm,
        'total_left' => $totalLeft,
        'mod_array' => $modifiedArray,
        'list' => $list,
    ];
}