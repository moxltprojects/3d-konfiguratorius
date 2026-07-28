<?php 

add_action('wp_ajax_render_config_room', 'render_config_room');
add_action('wp_ajax_nopriv_render_config_room', 'render_config_room');

function render_config_room() 
{
    $userId = get_current_user_id();
    $standImageData = isset($_POST['stand_image_data']) ? json_decode(stripslashes($_POST['stand_image_data'])) : null;
    $currentConfigId =
        isset($_POST['user_config_id']) &&
        $_POST['user_config_id'] !== 'null'
            ? $_POST['user_config_id']
            : null;
    $currentTemplateData =
        isset($_POST['template_data']) &&
        $_POST['template_data'] !== 'null'
            ? json_decode(stripslashes($_POST['template_data']))
            : null;
    $aiFurnitureData = !$currentConfigId && !$currentTemplateData && isset($_POST['ai_furniture_data']) ? json_decode(stripslashes($_POST['ai_furniture_data'])) : null;
    $currentTemplatePostId = $currentTemplateData ? $currentTemplateData->post_id : null;
    // $currentTemplateRoomType = $currentTemplateData ? $currentTemplateData->room_type : null;
    $all_furniture_list_objects = [];

    $currency_symbol = get_woocommerce_currency_symbol();
    $textureTypes = get_furniture_texture_types();
	$furnitureTypes = get_furniture_types();

    $defaultFurnitureTypes = get_default_furniture_types_array($furnitureTypes);
    $defaultTexturesCategories = get_default_config_settings_textures($textureTypes, $furnitureTypes);
    $defaultTextures = get_default_config_settings_texture_object($textureTypes, $furnitureTypes, true);
    $aiTextures = get_ai_textures($standImageData);

    $model_default_zoom = null;
    $model_zoom_min = null;

    $savedConfigs = getUserConfigs($userId);
    $savedSettings = $currentTemplatePostId ? 
        getTemplateByPostId($currentTemplatePostId) :
        getSettingsByConfigId($currentConfigId, $userId);

    $currentRoomType = $currentTemplateData ? 
        $currentTemplateData->room_type : (
            $savedSettings ? 
                $savedSettings->room_type : 
                null
        );

    $furnitureDimensions = getAdminDefaultFurnitureDimensions($savedSettings);
    $furnitureDimensionsSortedByType = getFurnitureDimensionsArraySortedByType($furnitureDimensions);

    $productsList = [];
    $minRoomWidth = null;
    if(!$aiFurnitureData) {
        $productsList = $currentTemplatePostId ? 
            getTemplateProductsByPostId($currentTemplatePostId, $currentRoomType) :
            getSettingsProductsByConfigId($currentConfigId);
    } else {
        $productsListData = getAiSettingsProducts($aiFurnitureData, $furnitureDimensions);
        $productsList = $productsListData['new_list'];
        $minRoomWidth = $productsListData['total_width'];
    }

    $roomData = getDefaultRoomSettings($savedSettings, $currentRoomType, $minRoomWidth);
    $defaultRoomLayout = $currentRoomType ? $currentRoomType : $roomData['default_room_layout'];
    $wallHeightMin = $roomData['wall_height_min'];
    $wallHeightMax = $roomData['wall_height_max'];
    $wallHeightStandard = $roomData['wall_height_standard'];
    $wallWidthMin = $roomData['wall_width_min'];
    $wallWidthMax = $roomData['wall_width_max'];
    $wallWidthStandard = $roomData['wall_width_standard'];
    $wallDepthMin = $roomData['wall_depth_min'];
    $wallDepthMax = $roomData['wall_depth_max'];
    $wallDepthStandard = $roomData['wall_depth_standard'];

//     $furnitureDimensions = getDefaultFurnitureDimensions($savedSettings);

    list(
        $bottomCornerItem, 
        $bottomCornerItemId, 
        $topCornerItem, 
        $topCornerItemId, 
        $fullCornerItem, 
        $fullCornerItemId
    ) = getCornerFurnitureData();
	
	$selected_components = get_default_config_settings_components();

    ?>

    <?php
        $productsListData = renderSelectedProducts($productsList, $defaultTextures, $furnitureDimensionsSortedByType, $standImageData);

        $total = $productsListData['regular_total'] ?? 0;
        $prices = $productsListData['all_totals'] ?? 0;
        $furniture_list_objects = $productsListData['furniture_list_objects'] ?? [];
        $productsListPerPage = 24;

        $regular = $prices['regular'] ?? 0.00;
        $discount = $prices['discount'] ?? 0.00;
        $displayPrice = $prices['display'] ?? 0.00;
    ?>

    <?php
    ob_start();
    ?>

    <?php include __DIR__ .'/template-parts/room/index-loaded.php'; ?>

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
        'user_id' => $userId,
        'content' => $content,
        'components' => $selected_components,
        'all_products' => $all_furniture_list_objects,
        'products_list' => $furniture_list_objects,
        'products_list_per_page' => $productsListPerPage,
        'room_type' => $defaultRoomLayout,
        'room_dimensions' => [
            'width' => $wallWidthStandard,
            'height' => $wallHeightStandard,
            'depth' => $wallDepthStandard,
            'width_max' => $wallWidthMax,
            'height_max' => $wallHeightMax,
            'depth_max' => $wallDepthMax,
        ],
        'furniture_dimensions' => $furnitureDimensionsSortedByType,
        'default_textures' => $defaultTextures,
        'ai_textures' => $aiTextures,
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

add_action('wp_ajax_load_more_products', 'load_more_products');
add_action('wp_ajax_nopriv_load_more_products', 'load_more_products');

function load_more_products() 
{
    /******* Textures *********/
    $page = $_POST['page'] ?? 1;
    $perPage = $_POST['per_page'] ?? null;
    $furnitureTypes = isset($_POST['furniture_type']) ? $_POST['furniture_type'] : null;
    $textureTypes = get_furniture_texture_types();   
    $all_furniture_list_objects = []; 
    
    $productsLoop = get_products_query($furnitureTypes, $page, $perPage);

    ob_start();

    if($productsLoop->have_posts()): 
        while ( $productsLoop->have_posts() ) : $productsLoop->the_post(); 
            wc_setup_product_data( get_the_ID() ); 
            include __DIR__ .'/template-parts/room/steps/play-edit/cabinets/add-cabinet-item-child.php'; 

        endwhile; wp_reset_query(); 

        elseif($page == 1): ?>

        <p><?php echo __('No products found', 'furniture-config'); ?></p> 
        
    <?php endif; 
    $content = ob_get_clean();

    if($page == 1) {
        ob_start();
        if($page == 1 && $page < $productsLoop->max_num_pages) :
            include __DIR__ .'/template-parts/elements/load-more-button.php'; 
        endif; 
        $loadMoreContent = ob_get_clean();

        wp_send_json_success([
            'content' => $content,
            'load_more_content' => $loadMoreContent, 
            'new_products' => $all_furniture_list_objects,
        ]);
    } 

    wp_send_json_success([
        'content' => $content,
        'is_last_page' => $page == $productsLoop->max_num_pages, 
    ]);
  
}

add_action('wp_ajax_add_furniture_item_to_config_v2_settings', 'add_furniture_item_to_config_v2_settings');
add_action('wp_ajax_nopriv_add_furniture_item_to_config_v2_settings', 'add_furniture_item_to_config_v2_settings');

function add_furniture_item_to_config_v2_settings() 
{
     if (!isset($_POST['config_id'])) {
        wp_send_json_error(['message' => 'Missing config id']);
    }

    if (!isset($_POST['custom_id'])) {
        wp_send_json_error(['message' => 'Missing custom id']);
    }

    if (!isset($_POST['product_object'])) {
        wp_send_json_error(['message' => 'Missing product data']);
    }

    if (!isset($_POST['count_index'])) {
        wp_send_json_error(['message' => 'Missing items count']);
    }

    if (!isset($_POST['textures'])) {
        wp_send_json_error(['message' => 'Missing textures data']);
    }

    global $template_parts_url, $FURNITURE_TYPE_WALL, $FURNITURE_TYPE_WALL_TOP;

    $productObj = json_decode(stripslashes($_POST['product_object']));

    $productId = $productObj->product_id;

    $product = wc_get_product($productId);
    if (!$product) {
        wp_send_json_error(['message' => 'Furniture post does not exist']);
    }
    $productTitle = get_the_title($productId);
    $count_index = intval($_POST['count_index']);
    $configId = intval($_POST['config_id']);
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

    // $selectedOptions = [];
    // $existing_options = isset($productObj->all_options) ? 
    //     $productObj->all_options : 
    //     get_field('options', $productId);

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
    include __DIR__ .'/template-parts/room/steps/play-edit/cabinets/my-cabinet-item.php'; 
    $my_content = ob_get_clean();

    ob_start();
    include __DIR__ .'/template-parts/room/steps/summary/summary-cabinet-item.php'; 
    $summary_content = ob_get_clean();


    $productObj->config_id = $configId;
    // $productObj->all_options = $existing_options;
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

add_action('wp_ajax_config_3d_products_addtocart', 'config_3d_products_addtocart');
add_action('wp_ajax_nopriv_config_3d_products_addtocart', 'config_3d_products_addtocart'); 

function config_3d_products_addtocart() {
    $user_id = get_current_user_id();

    if (!isset($_POST['products']) || !isset($_POST['products'])) {
        wp_send_json_error(['message' => 'Missing products data']);
    }

    if (!isset($_POST['config_settings']) || !isset($_POST['config_settings'])) {
        wp_send_json_error(['message' => 'Missing settings data']);
    }

    if (!isset($_POST['config_id']) || !isset($_POST['config_id'])) {
        wp_send_json_error(['message' => 'Missing config ID']);
    }

    $products = json_decode(stripslashes($_POST['products']));
    $config_settings = (array)json_decode(stripslashes($_POST['config_settings']));
    $textures = $config_settings['textures'];
    $aiTextures = $config_settings['ai_textures'];
    $components = $config_settings['components'];

    $newConfigOptionHtml = null;
    $configId = null;
    $mod_products = [];

    if($user_id) {
        $configId = intval($_POST['config_id']);
        $savedUpdatedData = saveUpdateConfig($config_settings, $configId, $user_id, false);
        $configId = $savedUpdatedData['config_id'];
        $newConfigOptionHtml = $savedUpdatedData['new_config_option_html'];

        $aiTextures = $savedUpdatedData['ai_textures'];

        if(!empty($products)) {
            $added_products = addFurnitureToSettingsConfig($configId, $products, false);

            if(!$added_products) {
                wp_send_json_error(['message' => 'Failed saving furniture items.']);
            }

            $mod_products = $added_products['mod_products'];
        }
    }

    if ( ! WC()->cart ) {
		wc_load_cart();
	}

    $quantity = 1;
    $completedAddToCart = true;

    $productsToAdd = !empty($mod_products) ? $mod_products : (array) $products;

    $aiTextures = (array) $aiTextures;
    $brand_texture = $aiTextures['brand'] ?? null;

    foreach($productsToAdd as $product) {
        $product = (object) $product;

        $productId = $product->product_id;

        $productObj = wc_get_product($productId);

        if (!$productObj) {
            $completedAddToCart = false;
            break;
        }

        $furnitureType = $product->furniture_type;

        $dbData = $product->db_data;

        $customId = $dbData->custom_id;
        $hasBrandTexture = $dbData->has_brand_texture;
        $width = $dbData->width;
        $height = $dbData->height;
        $depth = $dbData->depth;
        $attachment_id = $dbData->attachment_id;

        $productTextures = getProductTextures($furnitureType, $textures);

        $price_data = getProductTotals(
            $productId,
            $furnitureType,
            $hasBrandTexture,
            $productTextures,
            $width,
            $height,
            $depth,
            $components,
            true,
            false 
        );

        $regularPrice  = isset($price_data['regular_total']) && is_numeric($price_data['regular_total'])
            ? (float) $price_data['regular_total']
            : 0;

        $discountPrice = isset($price_data['discount_total']) && is_numeric($price_data['discount_total'])
            ? (float) $price_data['discount_total']
            : 0;

        $activePrice = ($discountPrice > 0) ? $discountPrice : $regularPrice;

        $productObj->set_price($activePrice ?: 0);
  
    	$merge_key = md5(json_encode([
            'config_id' => $configId,
            'custom_id' => $customId,
            'width'     => $width,
            'height'    => $height,
            'depth'     => $depth,
        ]));

        $cartItemData = [
            'config_settings' => [
                'merge_key' => $merge_key,
                'config_id' => $configId,
                'db_data' => [
                    'width'     => $width,
                    'height'    => $height,
                    'depth'     => $depth,
                    'attachment_id' => $attachment_id,
                    'has_brand_texture' => $hasBrandTexture,
                ],
                'general_settings' => [
                    'components' => $components,
                    'textures' => $productTextures,
                    'ai_textures' => $aiTextures,
                    'brand_texture' => $hasBrandTexture ? $brand_texture : null,
                ],
            ],
            'cart_prices' => [
                'regular' => (float)$price_data['regular_total'],
                'discount' => (float)$price_data['discount_total'],
                'active' => (float)$price_data['display_total'],
            ]
        ];

        wc_clear_notices();
        $cartItemKey = WC()->cart->add_to_cart($productId, $quantity, 0, [], $cartItemData);

        if(!$cartItemKey) {
            $completedAddToCart = false;
            break;
        }
    }
    // foreach($products as $product) {
    //     $productId = $product->product_id;

    //     $productObj = wc_get_product($productId);

    //     if (!$productObj) {
    //         $completedAddToCart = false;
    //         break;
    //     }

    //     $furnitureType = $product->furniture_type;
    //     $dbData = $product->db_data;
    //     $hasBrandTexture = $product->has_brand_texture;
    //     $customId = $dbData->custom_id;
    //     $width = $dbData->width;
    //     $height = $dbData->height;
    //     $depth = $dbData->depth;
    //     $options = $product->db_data->options;

    //     $productTextures = getProductTextures($furnitureType, $textures);

    //     $price_data = getProductTotals(
    //         $productId,
    //         $furnitureType,
    //         $hasBrandTexture,
    //         $productTextures,
    //         $width,
    //         $height,
    //         $depth,
    //         $components,
    //         true,
    //         false 
    //     );

    //     $regularPrice  = isset($price_data['regular_total']) && is_numeric($price_data['regular_total'])
    //         ? (float) $price_data['regular_total']
    //         : 0;

    //     $discountPrice = isset($price_data['discount_total']) && is_numeric($price_data['discount_total'])
    //         ? (float) $price_data['discount_total']
    //         : 0;

    //     $activePrice = ($discountPrice > 0) ? $discountPrice : $regularPrice;

    //     $productObj->set_price($activePrice ?: 0);
  
    // 	$merge_key = md5(json_encode([
    //         'config_id' => $configId,
    //         'custom_id' => $customId,
    //         'width'     => $width,
    //         'height'    => $height,
    //         'depth'     => $depth,
    //         'options' => $options,
    //     ]));

    //     $attachment_id = !empty($dbData->attachment_id) ? 
    //         $dbData->attachment_id : 
    //         save_product_attachment_id_from_base64($dbData->attachment_base64, 'thumbnail');

    //     $cartItemData = [
    //         'config_settings' => [
    //             'config_id' => $configId,
    //             'custom_id' => $customId,
    //             'attachment_id' => $attachment_id,
    //             'main_settings' => [
    //                 'dimensions' => [
    //                     'width' => $width,
    //                     'height' => $height,
    //                     'depth' => $depth,
    //                 ],
    //                 'components' => $components,
    //                 'textures' => $productTextures,
    //                 'brand_texture' => $hasBrandTexture
    //                     ? (
    //                         isset($aiTextures->brand->base64)
    //                             ? $aiTextures->brand->base64
    //                             : (
    //                                 isset($aiTextures->brand->color)
    //                                     ? $aiTextures->brand->color
    //                                     : null
    //                             )
    //                     )
    //                     : null,
    //             ],
    //             'db_data' => $dbData,
    //             'merge_key' => $merge_key,
    //         ],
    //         'cart_prices' => [
    //             'regular' => (float)$price_data['regular_total'],
    //             'discount' => (float)$price_data['discount_total'],
    //             'active' => (float)$price_data['display_total'],
    //         ]
    //     ];

    //     wc_clear_notices();
    //     $cartItemKey = WC()->cart->add_to_cart($productId, $quantity, 0, [], $cartItemData);

    //     if(!$cartItemKey) {
    //         $completedAddToCart = false;
    //         break;
    //     }
    // }

    if ($completedAddToCart) {
		WC()->cart->calculate_totals();

    	// Generate mini-cart HTML
		ob_start();
		woocommerce_mini_cart();
		$mini_cart = ob_get_clean();

		// Build fragments array
		$fragments = [
    		'div.widget_shopping_cart_content' =>
        		'<div class="widget_shopping_cart_content">' . $mini_cart . '</div>',
		];

		// Let WooCommerce + theme modify fragments
		$fragments = apply_filters('woocommerce_add_to_cart_fragments', $fragments);

		// Get cart hash
		$cart_hash = WC()->cart->get_cart_hash();
		
        wp_send_json_success([
            'cart_count' => count($productsToAdd),
            'message' => 'Products added!',
            'config_id' => $configId,
            'ai_textures' => $aiTextures,
            'mod_products' => $mod_products,
            'new_config_option_html' => $newConfigOptionHtml,
			'fragments' => $fragments,
   	 		'cart_hash' => $cart_hash,
        ]);
    } else {
        wp_send_json_error(['message' => 'Failed to add config products.']);
    }
}

add_action('wp_ajax_ajax_config_calculate_totals', 'ajax_config_calculate_totals');
add_action('wp_ajax_nopriv_ajax_config_calculate_totals', 'ajax_config_calculate_totals'); 

function ajax_config_calculate_totals() {

    if (!isset($_POST['products'])) {
        wp_send_json_error(['message' => 'Missing products data']);
    }

    if (!isset($_POST['textures'])) {
        wp_send_json_error(['message' => 'Missing texture data']);
    }

    if (!isset($_POST['dimensions'])) {
        wp_send_json_error(['message' => 'Missing dimensions data']);
    }

    if (!isset($_POST['components'])) {
        wp_send_json_error(['message' => 'Missing components data']);
    }

    $products = json_decode(stripslashes($_POST['products']));
    $textures = json_decode(stripslashes($_POST['textures']));
    $dimensions = json_decode(stripslashes($_POST['dimensions']));
    $components = json_decode(stripslashes($_POST['components']));

    $discount_total = 0;
    $total = 0;
    $productsWithPrices = [];

    foreach($products as $product) {
        $product_id = $product['id'];
        $custom_id = $product['custom_id'];
        $furnitureType = $product['furniture_type'];
        $hasBrandTexture = $product['db_data']['has_brand_texture'];
        $width = $dimensions['db_data']['width'];
        $height = $dimensions[$furnitureType .'_height'];
        $depth = $dimensions[$furnitureType .'_depth'];

        $priceData = getProductTotals(
            $product_id, 
            $furnitureType,
            $hasBrandTexture,
            $textures,
            $width,
            $height,
            $depth,
            $components,
        );

        $total += $priceData['regular'];
        $discount_total += $priceData['discount'];

        $productsWithPrices[] = [
            'custom_id' => $custom_id,
            'price_data' => $priceData
        ];
    }

    ob_start();

    include __DIR__ .'/template-parts/elements/price/price-data.php'; 

    wp_send_json_success([
        'totals' => ob_get_clean(),
        'new_regular_total' => $total,
        'new_discount_total' => $discount_total,
        'new_display_price' => $discount_total && $discount_total > 0 ? $discount_total : $total,
        'products_with_prices' => $productsWithPrices,
    ]);
}

add_action('wp_ajax_ajax_save_config_settings', 'ajax_save_config_settings');
add_action('wp_ajax_nopriv_ajax_save_config_settings', 'ajax_save_config_settings');

function ajax_save_config_settings() 
{
    $user_id = get_current_user_id();

    if(!$user_id) {
        wp_send_json_error(['message' => 'User not logged in']);
    }

    $config_settings = isset($_POST['config_settings']) ? json_decode(stripslashes($_POST['config_settings']), true) : null;
    $furniture_list = isset($_POST['products_list']) ? json_decode(stripslashes($_POST['products_list']), true) : null;
    $config_id = isset($_POST['config_id']) ? intval($_POST['config_id']) : null;
    $save_new_config = is_null($config_id) || $config_id == 0;
    $savedUpdatedData = saveUpdateConfig($config_settings, $config_id, $user_id);
    $config_id = $savedUpdatedData['config_id'];
    $newConfigOptionHtml = $savedUpdatedData['new_config_option_html'];
    $newSaveButtonsHtml = '';


    if(!empty($furniture_list)) {
        $successfully_added_products = false;
        if($save_new_config) {
            global $furniture_config_v2_template_parts_url;

            $results = addFurnitureToNewSettingsConfig($config_id, $furniture_list);

            $successfully_added_products = $results['mod_products'] ?? null;
            // $newCustomIds = $results['new_custom_ids'];
            $currentConfigId = $config_id;

            ob_start();
            include $furniture_config_v2_template_parts_url . '/room/config-data/config-save-buttons.php'; 
            $newSaveButtonsHtml = ob_get_clean();
        } else {
            $successfully_added_products = addFurnitureToSettingsConfig($config_id, $furniture_list);
        }

        if(!$successfully_added_products) {
            wp_send_json_error(['message' => 'Failed saving furniture items.']);
        }
    }

    wp_send_json_success([
        'message' => 'Saved!',
        'config_id' => $config_id,
        // 'furniture_list' => getCurrentSettingsFurnitureList($config_id),
        'new_config_option_html' => $newConfigOptionHtml,
        'mod_products' => $successfully_added_products,
        // 'new_custom_ids' => $newCustomIds,
        'new_save_buttons_html' => $newSaveButtonsHtml,
    ]);
}

add_action('wp_ajax_nopriv_ajax_login_v2', 'ajax_login_v2');
add_action('wp_ajax_ajax_login_v2', 'ajax_login_v2');  

function ajax_login_v2() {
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

add_action('wp_ajax_nopriv_ajax_register_v2', 'ajax_register_v2');
add_action('wp_ajax_ajax_register_v2', 'ajax_register_v2'); 

function ajax_register_v2() {
    check_ajax_referer('ajax-login-nonce', 'security');

    $username = sanitize_user($_POST['username']);
    $email    = sanitize_email($_POST['email']);
    $password = $_POST['password'];

    if (username_exists($username) || email_exists($email)) {
        wp_send_json_error(['message' => 'Username or email already exists.']);
    }

	if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        wp_send_json_error(['message' => 'Invalid email format.']);
    }

	if (strlen($password) < 5) {
        wp_send_json_error(['message' => 'Password must contain at least 5 characters.']);
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


add_action('wp_ajax_render_config_room_preview', 'render_config_room_preview');
add_action('wp_ajax_nopriv_render_config_room_preview', 'render_config_room_preview');

function render_config_room_preview() 
{
    $user_id = get_current_user_id();

    if(!$user_id) {
        wp_send_json_error(['message' => 'User not logged in']);
    }

    $model_default_zoom = null;
    $model_zoom_min = null;
    $currentConfigId = isset($_POST['config_id']) ? $_POST['config_id'] : null;
    $currency_symbol = get_woocommerce_currency_symbol();

    $savedSettings = getSettingsByConfigId($currentConfigId, $user_id);
    $defaultTextures = json_decode(stripslashes($savedSettings->textures));
    $components = json_decode(stripslashes($savedSettings->components));
    $productsList = getSettingsProductsByConfigId($currentConfigId);
    $furnitureDimensions = getDefaultFurnitureDimensions($savedSettings);

    $roomData = getDefaultRoomSettings($savedSettings);
    $defaultRoomLayout = $roomData['default_room_layout'] ?? null;
    $wallHeightStandard = $roomData['wall_height_standard'];
    $wallWidthStandard = $roomData['wall_width_standard'];
    $wallDepthStandard = $roomData['wall_depth_standard'];
    ?>
    
    <?php
    ob_start();
    ?>
    <?php  
        include __DIR__ . '/template-parts/room/config-preview/index-loaded.php'; 
    ?>

    <?php
    $content = ob_get_clean();


    wp_send_json_success([
        'content' => $content,
        'products_list' => $furniture_list_objects,
        'room_type' => $defaultRoomLayout,
        'room_dimensions' => [
            'width' => $wallWidthStandard,
            'height' => $wallHeightStandard,
            'depth' => $wallDepthStandard,
            'width_max' => $roomData['wall_width_max'],
            'height_max' => $roomData['wall_height_max'],
            'depth_max' => $roomData['wall_depth_max'],
        ],
        'default_textures' => $defaultTextures,
        'furniture_dimensions' => $furnitureDimensions,
    ]);
}