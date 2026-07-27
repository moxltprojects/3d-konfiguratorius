<?php

add_action('wp_ajax_render_config_room_admin', 'render_config_room_admin');
add_action('wp_ajax_nopriv_render_config_room_admin', 'render_config_room_admin');

function render_config_room_admin() 
{
    global $WALL_SINGLE, $WALL_DOUBLE;
    $postId = isset($_POST['post_id']) ? $_POST['post_id'] : null;
    $currency_symbol = get_woocommerce_currency_symbol();
    $textureTypes = get_furniture_texture_types();
	$furnitureTypes = get_furniture_types();
    $defaultFurnitureTypes = get_default_furniture_types_array($furnitureTypes);
    $defaultTexturesCategories = get_default_config_settings_textures($textureTypes, $furnitureTypes);
    $defaultTextures = get_default_config_settings_texture_object($textureTypes, $furnitureTypes, true);

    $all_furniture_list_objects = [];

    $model_default_zoom = null;
    $model_zoom_min = null;

    $savedSettings = getAdminSettingsByPostId($postId);

    $furnitureDimensions = getAdminDefaultFurnitureDimensions($savedSettings);
    $furnitureDimensionsSortedByType = getFurnitureDimensionsArraySortedByType($furnitureDimensions);

    $productsListSingleWall = getAdminSettingsProductsByPostId($postId, $WALL_SINGLE);
    $singleWallProductsData = render_existing_products($productsListSingleWall, $WALL_SINGLE, $defaultTextures, $furnitureDimensionsSortedByType);
    $productsListDoubleWall = getAdminSettingsProductsByPostId($postId, $WALL_DOUBLE);
    $doubleWallProductsData = render_existing_products($productsListDoubleWall, $WALL_DOUBLE, $defaultTextures, $furnitureDimensionsSortedByType);
    $productsListPerPage = 24;

    $regular = $prices['regular'] ?? 0.00;
    $discount = $prices['discount'] ?? 0.00;
    $displayPrice = $prices['display'] ?? 0.00;

    $roomData = getAdminDefaultRoomSettings($savedSettings);
    $wallHeightMin = $roomData['wall_height_min'];
    $wallHeightMax = $roomData['wall_height_max'];
    $wallHeightStandard = $roomData['wall_height_standard'];
    $wallWidthMin = $roomData['wall_width_min'];
    $wallWidthMax = $roomData['wall_width_max'];
    $wallWidthStandard = $roomData['wall_width_standard'];
    $wallDepthMin = $roomData['wall_depth_min'];
    $wallDepthMax = $roomData['wall_depth_max'];
    $wallDepthStandard = $roomData['wall_depth_standard'];

    list(
        $bottomCornerItem, 
        $bottomCornerItemId, 
        $topCornerItem, 
        $topCornerItemId, 
        $fullCornerItem, 
        $fullCornerItemId
    ) = getCornerFurnitureData();
    ?>
    
    <?php
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
    ) = getBottomCornerFurnitureDimensions(
        $bottomCornerItem, 
        $bottomCornerItemId, 
        $topCornerItem, 
        $topCornerItemId, 
        $fullCornerItem, 
        $fullCornerItemId
    );

    wp_send_json_success([
        'content' => $content,
        'products_list' => [
            $WALL_SINGLE => $singleWallProductsData['furniture_list_objects'],
            $WALL_DOUBLE => $doubleWallProductsData['furniture_list_objects'],
        ],
        'totals' => [
            $WALL_SINGLE => $singleWallProductsData['all_totals'],
            $WALL_DOUBLE => $doubleWallProductsData['all_totals'],
        ],
        'all_products' => $all_furniture_list_objects,
        'products_list_per_page' => $productsListPerPage,
        'room_dimensions' => [
            'width' => $wallWidthStandard,
            'height' => $wallHeightStandard ,
            'depth' => $wallDepthStandard,
            'width_max' => $wallWidthMax,
            'height_max' => $wallHeightMax,
            'depth_max' => $wallDepthMax,
        ],
        'furniture_dimensions' => $furnitureDimensionsSortedByType,
        'default_textures' => $defaultTextures,
        'corner_furniture_data' => [
            'furniture_id' => $bottomCornerItemId,
            'default_width' => $bottom_width_standard,
            'default_depth' => $bottom_depth_standard,
            'bottom' => [
                'id' => $bottomCornerItemId,
                'width' => $bottom_width_standard,
                'depth' => $bottom_depth_standard,
            ],
            'top' => [
                'id' => $topCornerItemId,
                'width' => $top_width_standard,
                'depth' => $top_depth_standard,
            ],
            'full' => [
                'id' => $fullCornerItemId,
                'width' => $full_width_standard,
                'depth' => $full_depth_standard,
            ],
        ],
        'total' => [
            'regular' => floatval($regular),
            'discount' => floatval($discount),
            'display' => floatval($displayPrice),
        ],
        'currency_symbol' => $currency_symbol,
    ]);
}

add_action('wp_ajax_add_furniture_item_to_admin_config', 'add_furniture_item_to_admin_config');
add_action('wp_ajax_nopriv_add_furniture_item_to_admin_config', 'add_furniture_item_to_admin_config');

function add_furniture_item_to_admin_config() 
{
    if (!isset($_POST['custom_id'])) {
        wp_send_json_error(['message' => 'Missing custom id']);
    }

    if (!isset($_POST['product_object'])) {
        wp_send_json_error(['message' => 'Missing product data']);
    }

    if (!isset($_POST['textures'])) {
        wp_send_json_error(['message' => 'Missing textures data']);
    }

    global $FURNITURE_TYPE_WALL, $FURNITURE_TYPE_WALL_TOP;

    $productObj = json_decode(stripslashes($_POST['product_object']));

    $productId = $productObj->product_id;

    $product = wc_get_product($productId);
    if (!$product) {
        wp_send_json_error(['message' => 'Furniture post does not exist']);
    }
    $productTitle = get_the_title($productId);
    $customId = intval($_POST['custom_id']);
    
    $productObjDbData = $productObj->db_data;

    $itemWidth = $productObjDbData->width;
    $itemHeight = $productObjDbData->height;
    $itemHeightMin = $productObj->min_height;
    $itemHeightMax = $productObj->max_height;
    $itemDepth = $productObjDbData->depth;
    $itemDepthMin = $productObj->min_depth;
    $itemDepthMax = $productObj->max_depth;
    $itemSpaceBottom = $productObjDbData->space_bottom;
    $itemSpaceBottomMin = $productObj->min_space_bottom;
    $itemSpaceBottomMax = $productObj->max_space_bottom;
    $furniturePositionMm = $productObjDbData->furniture_position_mm ?? null;
    $priceData = $productObjDbData->prices;
    $textures = json_decode(stripslashes($_POST['textures']), true);
    $model_src = !empty($productObjDbData->object_src) ? $productObjDbData->object_src : get_field('3d_image', $productId);

    $currency_symbol = get_woocommerce_currency_symbol();
    
    $total = $priceData->regular_total;
    $discount_total = $priceData->discount_total;
    $currency_symbol = get_woocommerce_currency_symbol();

    $furnitureTypes = get_the_terms($productId, 'config-furniture-type');
    $furnitureTypeSlug = '';
    if(!empty($furnitureTypes)) {
        $furnitureTypeSlug = $furnitureTypes[0]->slug;
    }

    $width_obj = get_field('width', $productId);
    $itemWidthMin = $width_obj['min'];
    $itemWidthMax = $width_obj['max'];

    if($itemWidth < $itemWidthMin || $itemWidth > $itemWidthMax) {
        $itemWidth = $itemWidthMin;
    }

	$hasBrandTexture = get_field('has_brand_texture', $productId);

    ob_start();
    include __DIR__ .'/template-parts/steps/products-content/play-edit/my-cabinet-item.php'; 
    $my_content = ob_get_clean();

    ob_start();
    include __DIR__ .'/template-parts/steps/products-content/summary/summary-cabinet-item.php'; 
    $summary_content = ob_get_clean();

    $productObj->db_data->custom_id = $customId;
    $productObj->db_data->object_src = $model_src;
    $productObj->db_data->furniture_position_mm = $furniturePositionMm;
    $productObj->db_data->rotation = $productObjDbData->rotation ?? null;
    $productObj->db_data->is_fitting = $productObjDbData->is_fitting ?? null;

    wp_send_json_success([
        'my_item_html' => $my_content,
        'summary_item_html' => $summary_content,
        'new_object' => $productObj,
    ]);
}


add_action('wp_ajax_ajax_save_admin_config_settings', 'ajax_save_admin_config_settings');
add_action('wp_ajax_nopriv_ajax_save_admin_config_settings', 'ajax_save_admin_config_settings');

function ajax_save_admin_config_settings() 
{
    $user_id = get_current_user_id();

    if(!$user_id) {
        wp_send_json_error(['message' => 'User not logged in']);
    }

    if (!current_user_can('administrator')) {
        wp_send_json_error(['message' => 'Access denied']);
    }

    $config_settings = isset($_POST['config_settings']) ? json_decode(stripslashes($_POST['config_settings']), true) : null;
    $products_list = isset($_POST['products_list']) ? json_decode(stripslashes($_POST['products_list']), true) : null;
    $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : null;
    $savedUpdatedData = saveUpdateAdminConfig($config_settings, $post_id);
    $config_id = $savedUpdatedData['config_id'];

    if(!is_null($products_list)) {
        foreach($products_list as $products_list_single) {
            $successfully_added = addProductsToAdminSettingsConfig($post_id, $products_list_single['type'], $products_list_single['products']);

            if(!$successfully_added) {
                wp_send_json_error(['message' => 'Failed saving furniture items.']);
            }
        }
        
    }

    wp_send_json_success([
        'message' => 'Saved!',
        'config_id' => $config_id,
    ]);
}