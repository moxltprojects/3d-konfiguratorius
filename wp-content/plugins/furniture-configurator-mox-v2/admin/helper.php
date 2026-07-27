<?php 

function getAdminSettingsByPostId($post_id)
{
    if(!$post_id) return null;

    global $wpdb;
    $config_table_name = $wpdb->prefix . ADMIN_CONFIG_TEMPLATE_TABLE_NAME;

    $sql = $wpdb->prepare(
        "SELECT * FROM {$config_table_name}
        WHERE post_id = %d",
        $post_id
    );

    $config_table_result = $wpdb->get_row($sql);

    return $config_table_result;
}

function getAdminSettingsProductsByPostId($post_id, $room_type)
{
    if(!$post_id) return [];
    global $wpdb;
    $config_child_table_name = $wpdb->prefix . ADMIN_CONFIG_TEMPLATE_PRODUCTS_TABLE_NAME;

    $sql = $wpdb->prepare(
        "SELECT * FROM $config_child_table_name 
        WHERE post_id = %d AND room_type = %s",
        $post_id,
        $room_type
    );

    $config_products_results = $wpdb->get_results($sql);

    return $config_products_results;
}

function render_existing_products($products, $roomType, $defaultTextures, $furnitureDimensionsSortedByType) 
{
    global 
    $admin_furniture_config_v2_template_parts_url, 
    $furniture_type_bottom_corner_slug, 
    $furniture_type_top_corner_slug, 
    $furniture_type_full_corner_slug,
    $FURNITURE_TYPE_WALL, 
    $FURNITURE_TYPE_WALL_TOP;
    
    $myItemsHtml = [];
    $summaryItemsHtml = [];

    $furniture_list_objects = [];
    $bottomCornerItemId = null;
    $topCornerItemId = null;
    $fullCornerItemId = null;
    $regularTotals = 0;
    $discountTotals = 0;

    foreach($products as $productItem): 
        $productId = $productItem->product_id;
        $customId = $productItem->custom_id;
        $productTitle = get_the_title($productId);
        $model_file_url = get_field('3d_image', $productId);
        // $thumbnail = get_the_post_thumbnail( $productId, 'thumbnail' );
        $productFurnitureTypes = get_the_terms($productId, 'config-furniture-type');
        $itemWidth = $productItem->width;
        $itemHeight = $productItem->height;
        $itemDepth = $productItem->depth;
        $itemSpaceBottom = $productItem->space_bottom;
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
        if($itemHeightData && $itemHeightData > 0) {
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

        $options = null;
        /****** totals *******/
        $priceData = getProductTotals(
           $productId, 
           $furnitureTypeSlug,
           $defaultTextures,
           $options,
           $itemWidth,
           $itemHeight,
           $itemDepth,
        );
        $total = $priceData['regular_total'];
        $discount_total = $priceData['discount_total'];
        $display_total = $priceData['display_total'];

        $regularTotals += $total;
        $discountTotals += $discount_total;

        /****** end totals *******/

        // $thumbnailId = get_post_thumbnail_id( $productId );
        // $thumbnail = get_the_post_thumbnail( $productId, 'thumbnail' );

        // $thumbTypeSlug = null;
        // $thumbnailTypes = get_the_terms($productId, 'config-furniture-type');
        // if(!empty($thumbnailTypes)) {
        //     $thumbnailType = $thumbnailTypes[0];
        //     $thumbTypeSlug = $thumbnailType->slug;
        // }
        $thumbnailData = getProductThumbnailDataAdmin($productId);
        $attachmentUrl = $thumbnailData['url'];
        $attachmentId = $thumbnailData['id'];
        $attachmentType = $thumbnailData['thumbType'];

        $furniture_list_objects[] = array(
            'product_id' => $productId,
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
        include $admin_furniture_config_v2_template_parts_url . "/steps/products-content/play-edit/my-cabinet-item.php";

        if(!isset($myItemsHtml[$roomType])) {
            $myItemsHtml[$roomType] = '';
            $summaryItemsHtml[$roomType] = '';
        }
        $myItemsHtml[$roomType] .= ob_get_clean();

        ob_start();
        include $admin_furniture_config_v2_template_parts_url . "/steps/products-content/summary/summary-cabinet-item.php";
        $summaryItemsHtml[$roomType] .= ob_get_clean();
  
    endforeach;

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

function getAdminFurnitureDimensionsByType(
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

    if(strpos($typeSlug, $FURNITURE_TYPE_FULL) !== false) {
        $height = $furnitureDimensions['full_height'];
        $heightMin = $furnitureDimensions['full_height_min'];
        $heightMax = $furnitureDimensions['full_height_max'];
        $depth = $furnitureDimensions['full_depth'];
        $depthMin = $furnitureDimensions['full_depth_min'];
        $depthMax = $furnitureDimensions['full_depth_max'];
    } else if(strpos($typeSlug, $FURNITURE_TYPE_TOP) !== false) {
        $height = $furnitureDimensions['top_height'];
        $heightMin = $furnitureDimensions['top_height_min'];
        $heightMax = $furnitureDimensions['top_height_max'];
        $depth = $furnitureDimensions['top_depth'];
        $depthMin = $furnitureDimensions['top_depth_min'];
        $depthMax = $furnitureDimensions['top_depth_max'];
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
        $depthMax
    ];

}

function getAdminDefaultFurnitureDimensions($savedSettings)
{
    $full_depth_standard = 0;
    $full_depth_min = (int) get_theme_mod('furniture_depth_full_min');
    $full_depth_max = (int) get_theme_mod('furniture_depth_full_max');

    $bottom_depth_standard = 0;
    $bottom_depth_min = (int) get_theme_mod('furniture_depth_bottom_min');
    $bottom_depth_max = (int) get_theme_mod('furniture_depth_bottom_max');

    $top_depth_standard = 0;
    $top_depth_min = (int) get_theme_mod('furniture_depth_top_min');
    $top_depth_max = (int) get_theme_mod('furniture_depth_top_max');

    $bottom_height_standard = 0;
    $bottom_height_min = (int) get_theme_mod('furniture_height_bottom_min');
    $bottom_height_max = (int) get_theme_mod('furniture_height_bottom_max');

    $top_height_standard = 0;
    $top_height_min = (int) get_theme_mod('furniture_height_top_min');
    $top_height_max = (int) get_theme_mod('furniture_height_top_max');

    $full_height_standard = 0;
    $full_height_min = (int) get_theme_mod('furniture_height_full_min');
    $full_height_max = (int) get_theme_mod('furniture_height_full_max');

    $space_bottom_standard = 0;
    $space_bottom_min = (int) get_theme_mod('furniture_space_bottom_min');
    $space_bottom_max = (int) get_theme_mod('furniture_space_bottom_max');

    if($savedSettings) {        
        $bottom_depth_standard = (int) $savedSettings->bottom_depth;
        $full_depth_standard = (int) $savedSettings->full_depth;
        $top_depth_standard = (int) $savedSettings->top_depth;

        $bottom_height_standard = (int) $savedSettings->bottom_height;
        $top_height_standard = (int) $savedSettings->top_height;
        $full_height_standard = (int) $savedSettings->full_height;

        $space_bottom_standard = (int) $savedSettings->space_bottom;
    } else {
        $bottom_depth_standard = (int) get_theme_mod('furniture_depth_bottom_default');
        $full_depth_standard = (int) get_theme_mod('furniture_depth_full_default');
        $top_depth_standard = (int) get_theme_mod('furniture_depth_top_default');
        $bottom_height_standard = (int) get_theme_mod('furniture_height_bottom_default');
        $top_height_standard = (int) get_theme_mod('furniture_height_top_default');
        $full_height_standard = (int) get_theme_mod('furniture_height_full_default');
        $space_bottom_standard = (int) get_theme_mod('furniture_space_bottom_default');
    }

    $full_depth_standard = normalize_dimension($full_depth_standard, $full_depth_min, $full_depth_max);
    $bottom_depth_standard = normalize_dimension($bottom_depth_standard, $bottom_depth_min, $bottom_depth_max);
    $top_depth_standard = normalize_dimension($top_depth_standard, $top_depth_min, $top_depth_max);
    $bottom_height_standard = normalize_dimension($bottom_height_standard, $bottom_height_min, $bottom_height_max);
    $top_height_standard = normalize_dimension($top_height_standard, $top_height_min, $top_height_max);
    $full_height_standard = normalize_dimension($full_height_standard, $full_height_min, $full_height_max);

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

function getAdminDefaultRoomSettings($savedSettings)
{
    $wall_height_min = (int) get_theme_mod('room_wall_height_min', 250);
    $wall_height_max = (int) get_theme_mod('room_wall_height_max', 250);
    $wall_height_standard = 0;

    $wall_width_min = (int) get_theme_mod('room_wall_width_min', 250);
    $wall_width_max = (int) get_theme_mod('room_wall_width_max', 250);
    $wall_width_standard = 0;

    $wall_depth_min = (int) get_theme_mod('room_wall_depth_min', 250);
    $wall_depth_max = (int) get_theme_mod('room_wall_depth_max', 250);
    $wall_depth_standard = 0;

    if($savedSettings) {        
        $wall_height_standard = (int) $savedSettings->room_height;
        $wall_width_standard = (int) $savedSettings->room_width;
        $wall_depth_standard = (int) $savedSettings->room_depth;
    } else {
        $wall_height_standard = (int) get_theme_mod('room_wall_height_standard', 250);
        $wall_width_standard = (int) get_theme_mod('room_wall_width_standard', 250);
        $wall_depth_standard = (int) get_theme_mod('room_wall_depth_standard', 250);
    }

    $wall_height_standard = $wall_height_standard < $wall_height_min || $wall_height_standard > $wall_height_max ? $wall_height_min : $wall_height_standard;
    $wall_width_standard = $wall_width_standard < $wall_width_min || $wall_width_standard > $wall_width_max ? $wall_width_min : $wall_width_standard;
    $wall_depth_standard = $wall_depth_standard < $wall_depth_min || $wall_depth_standard > $wall_depth_max ? $wall_depth_min : $wall_depth_standard;

    return [
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

function updateExistingAdminSettings($post_id, $main_settings)
{
    global $wpdb, $FURNITURE_TYPE_FULL, $FURNITURE_TYPE_TOP, $FURNITURE_TYPE_BASE;

    $config_table_name = $wpdb->prefix . ADMIN_CONFIG_TEMPLATE_TABLE_NAME;

    $room_dimensions = (array) $main_settings['room_dimensions'];
    $furniture_dimensions = (array) $main_settings['furniture_dimensions'];
    $furniture_dimensions_full = $furniture_dimensions[$FURNITURE_TYPE_FULL];
    $furniture_dimensions_top = $furniture_dimensions[$FURNITURE_TYPE_TOP];
    $furniture_dimensions_bottom = $furniture_dimensions[$FURNITURE_TYPE_BASE];

    error_log(print_r($furniture_dimensions, true ));

    $updated = $wpdb->update(
        $config_table_name,
        [
            'textures'     => json_encode($main_settings['textures']),
            'components'     => json_encode($main_settings['components']),
            'room_height'       => intval($room_dimensions['height']),
            'room_width'        => intval($room_dimensions['width']),
            'room_depth'        => intval($room_dimensions['depth']),
            'bottom_height'       => intval($furniture_dimensions_bottom['height']),
            'bottom_depth'       => intval($furniture_dimensions_bottom['depth']),
            'top_height'       => intval($furniture_dimensions_top['height']),
            'top_depth'       => intval($furniture_dimensions_top['depth']),
            'full_height'       => intval($furniture_dimensions_full['height']),
            'full_depth'       => intval($furniture_dimensions_full['depth']),
            'space_bottom'    => intval($furniture_dimensions_top['space_bottom'])
        ],
        [ 'post_id' => $post_id ], // WHERE
        [ '%s','%s','%s','%d','%d' ],
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

function createNewAdminSettings($post_id, $main_settings)
{
    global $wpdb, $FURNITURE_TYPE_FULL, $FURNITURE_TYPE_TOP, $FURNITURE_TYPE_BASE;

    $config_table_name = $wpdb->prefix . ADMIN_CONFIG_TEMPLATE_TABLE_NAME;

    $room_dimensions = (array) $main_settings['room_dimensions'];
    $furniture_dimensions = (array) $main_settings['furniture_dimensions'];
    $furniture_dimensions_full = $furniture_dimensions[$FURNITURE_TYPE_FULL];
    $furniture_dimensions_top = $furniture_dimensions[$FURNITURE_TYPE_TOP];
    $furniture_dimensions_bottom = $furniture_dimensions[$FURNITURE_TYPE_BASE];

    $sql = $wpdb->insert(
        $config_table_name,
        [
            'post_id' => $post_id,
            'textures'     => json_encode($main_settings['textures']),
            'components'     => json_encode($main_settings['components']),
            'room_height'       => intval($room_dimensions['height']),
            'room_width'        => intval($room_dimensions['width']),
            'room_depth'        => intval($room_dimensions['depth']),
            'bottom_height'       => intval($furniture_dimensions_bottom['height']),
            'bottom_depth'       => intval($furniture_dimensions_bottom['depth']),
            'top_height'       => intval($furniture_dimensions_top['height']),
            'top_depth'       => intval($furniture_dimensions_top['depth']),
            'full_height'       => intval($furniture_dimensions_full['height']),
            'full_depth'       => intval($furniture_dimensions_full['depth']),
            'space_bottom'    => intval($furniture_dimensions_top['space_bottom'])
        ],
        [ '%d','%s','%s','%d','%d','%d' ]
    );
  
    $config_id = $wpdb->insert_id;

    return $config_id;
}


function saveUpdateAdminConfig($main_settings, $post_id) {
    $newConfigOptionHtml = '';

    $config_id = null;

    if($main_settings) {
        $config = getAdminSettingsByPostId($post_id);

        if(!$config) {
            $config_id = createNewAdminSettings($post_id, $main_settings);
        } else {
            $config_id = $config->id;
            $updated = updateExistingAdminSettings($post_id, $main_settings);

        if(!$updated) {
                wp_send_json_error(['message' => 'Failed updating the settings']);
            }
        }
    }

    return [
        'config_id' => $config_id,
    ];
}

function addProductsToAdminSettingsConfig($post_id, $room_type, $products_list)
{
    global $wpdb;

    $config_child_table_name = $wpdb->prefix . ADMIN_CONFIG_TEMPLATE_PRODUCTS_TABLE_NAME;

    $create_values = [];
    $create_placeholders = [];

    $update_cases_prices = [];
    $update_cases_width = [];
    $update_cases_height = [];
    $update_cases_depth = [];
    $update_cases_space_bottom = [];
    $update_cases_furniture_position = [];
    $update_cases_rotation = [];
    $update_cases_is_fitting = [];
    $update_ids = [];
    $custom_ids = [];

    $existingCustomIds = getExistingCustomIds($config_child_table_name, null, $post_id);

    foreach ($products_list as $product) {
        $product = (array) $product;
        $db_data = (array) $product['db_data'];
        $custom_id = intval($db_data['custom_id']);
        $prices = $db_data['prices'];
        $prices = is_string($prices) ? $prices : json_encode($prices);

        $custom_ids[] = $custom_id;
        $rotation = $db_data['rotation'] !== null 
                    ? floatval($db_data['rotation']) 
                    : "NULL";

        if(isset($existingCustomIds[$custom_id])) {
            $update_ids[] = $custom_id;

            $update_cases_prices[] = "WHEN {$custom_id} THEN '" . $prices . "'";
            $update_cases_width[] = "WHEN {$custom_id} THEN " . intval($db_data['width']);
            $update_cases_height[] = "WHEN {$custom_id} THEN " . intval($db_data['height']);
            $update_cases_depth[] = "WHEN {$custom_id} THEN " . intval($db_data['depth']);
            $update_cases_space_bottom[] = "WHEN {$custom_id} THEN " . intval($db_data['space_bottom']);
            $update_cases_furniture_position[] = "WHEN {$custom_id} THEN '" . $db_data['furniture_position_mm'] . "'";
            $update_cases_rotation[] = "WHEN {$custom_id} THEN " . ($rotation);
            $update_cases_is_fitting[] = "WHEN {$custom_id} THEN " . intval($db_data['is_fitting']);
        } else {
            $product_id = $product['product_id'];
            $create_values[] = $custom_id;
            $create_values[] = $post_id;
            $create_values[] = $product_id;
            $create_values[] = get_the_title($product_id);
            $create_values[] = $room_type;
            $create_values[] = $product['furniture_type'];
            $create_values[] = $db_data['object_src'];
            $create_values[] = $db_data['thumbnail_type'];
            $create_values[] = $db_data['thumbnail_id'];
            $create_values[] = $db_data['postcard_thumbnail_id'];
            $create_values[] = $prices;
            $create_values[] = intval($db_data['width']);
            $create_values[] = intval($db_data['height']);
            $create_values[] = intval($db_data['depth']);
            $create_values[] = intval($db_data['space_bottom']);
            $create_values[] = $db_data['furniture_position_mm'];
            $create_values[] = $rotation;
            $create_values[] = intval($db_data['is_fitting']);
            $create_placeholders[] = "(%d,%d,%d,%s,%s,%s,%s,%s,%d,%d,%s,%d,%d,%d,%d,%s,%f,%d)";
        }
    }

    $sql_insert = true;
    if (!empty($create_placeholders)) {
        $sql_insert = "INSERT INTO {$config_child_table_name} 
            (custom_id,post_id,product_id,product_name,room_type,furniture_type,model_src,thumbnail_type,thumbnail_id,postcard_thumbnail_id,prices,width,height,depth,space_bottom,furniture_position_mm,rotation,is_fitting) 
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
            prices = CASE custom_id " . implode(' ', $update_cases_prices) . " END,
            width = CASE custom_id " . implode(' ', $update_cases_width) . " END,
            height = CASE custom_id " . implode(' ', $update_cases_height) . " END,
            depth = CASE custom_id " . implode(' ', $update_cases_depth) . " END,
            space_bottom = CASE custom_id " . implode(' ', $update_cases_space_bottom) . " END,
            furniture_position_mm = CASE custom_id " . implode(' ', $update_cases_furniture_position) . " END,
            rotation = CASE custom_id " . implode(' ', $update_cases_rotation) . " END,
            is_fitting = CASE custom_id " . implode(' ', $update_cases_is_fitting) . " END
            WHERE custom_id IN ({$ids_str})";
        
        $wpdb->query($sql_update);
        if ($wpdb->last_error) {
            error_log("Update error: " . $wpdb->last_error);
        }

        $sql_update = $sql_update || $sql_update == 0;
    } 

    $sql_removed = true;
    if($sql_insert && $sql_update) {
        $sql_removed = removeAdminSettingsPoductListItems($post_id, $custom_ids, $room_type);
    }

    return $sql_insert && $sql_update && $sql_removed;
}

function removeAdminSettingsPoductListItems($post_id, $custom_ids, $room_type)
{
    global $wpdb;

    $config_child_table_name = $wpdb->prefix . ADMIN_CONFIG_TEMPLATE_PRODUCTS_TABLE_NAME;

    $sql_delete = '';
    if(!empty($custom_ids)) {
        $custom_ids = array_map('intval', $custom_ids);
        $placeholders = implode(',', array_fill(0, count($custom_ids), '%d'));

        $params = array_merge(
            [$post_id],
            $custom_ids,
            [$room_type]
        );

       $sql_delete = $wpdb->prepare(
            "DELETE FROM $config_child_table_name 
            WHERE post_id = %d 
            AND custom_id NOT IN ($placeholders)
            AND room_type = %s",
            $params
        );
    } else {
        $sql_delete = $wpdb->prepare(
            "DELETE FROM $config_child_table_name 
            WHERE post_id = %d
            AND room_type = %s",
            array_merge(
                [$post_id],
                [$room_type]
            )
        );
    }

    $deleted_count = $wpdb->query($sql_delete);

    return $deleted_count !== false;
}


function getProductThumbnailDataAdmin($productId) {
    $thumbnailUrl = null;
    $thumbnailId = null;

    $thumbnailTypes = get_the_terms($productId, 'config-thumbnail-type');
    $typeSlug = null;

    if(!empty($thumbnailTypes)) {
        $thumbnailType = $thumbnailTypes[0];
        $typeSlug = $thumbnailType->slug;
    }

    // if(!$typeSlug) {

    //     return [
    //         'url' => null,
    //         'id' => null,
    //         'postcardId' => get_post_thumbnail_id($productId),
    //         'thumbType' => null,
    //     ];
    // }

    // $customThumb = get_field('glb_thumbnail', $productId);

    // if($customThumb) {
    //     $thumbnailId = $customThumb['ID'];
    //     $thumbnailUrl = $customThumb['url'];
    // } else {
    $thumbnailId = get_post_thumbnail_id($productId);

    if(!$typeSlug) {
        $thumbnailUrl = wp_get_attachment_image_url( $thumbnailId, 'full' );
    }
    // }

    return [
        'url' => $thumbnailUrl,
        'id' => $thumbnailId,
        'thumbType' => $typeSlug,
    ];
}