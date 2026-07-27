<?php

add_action('wp_ajax_render_config_furniture_gallery', 'render_config_furniture_gallery');
add_action('wp_ajax_nopriv_render_config_furniture_gallery', 'render_config_furniture_gallery');

function render_config_furniture_gallery() 
{
    /******* Textures *********/
//     $textureCategories = get_furniture_texture_categories();
	$textureTypes = get_furniture_texture_types();
	$furnitureTypes = get_furniture_types();
    $defaultFurnitureTypes = get_default_furniture_types_array($furnitureTypes);
    $defaultTexturesCategories = get_default_config_settings_textures($textureTypes, $furnitureTypes);
    // $front = $textures_data['front'] ?? [];
    // $frontTexturesList = $front['list'] ?? [];
    // $frontObject    = $front['object']    ?? null;
    // $defaultFrontTextureId = $front['id'] ?? null;
    // $frontThumbnail = $front['thumbnail'] ?? null;
    // $frontPrice     = $front['price']     ?? 0.0;

    ob_start();
    ?>

    <?php include __DIR__ .'/template-parts/category/gallery/index-loaded.php'; ?>

    <?php
    $content = ob_get_clean();

    wp_send_json_success([
        'content' => $content    
    ]);
}

add_action('wp_ajax_render_config_furniture_products', 'render_config_furniture_products');
add_action('wp_ajax_nopriv_render_config_furniture_products', 'render_config_furniture_products');

function render_config_furniture_products() 
{
    /******* Textures *********/
    $selected_components = get_default_config_settings_components();
    $textureTypes = get_furniture_texture_types();
    $furnitureTypes = get_furniture_types();
    $defaultFurnitureTypes = get_default_furniture_types_array($furnitureTypes);
    $defaultTextures = get_default_config_settings_texture_object($textureTypes, $furnitureTypes, true);

    ob_start();
    ?>
    
    <?php include __DIR__ .'/template-parts/category/furniture-types/index.php'; ?> 
    <?php include __DIR__ .'/template-parts/category/components/index-loaded.php'; ?>
    <?php include __DIR__ .'/template-parts/category/products/list.php'; ?>

    <?php
    $content = ob_get_clean();

    wp_send_json_success([
        'content' => $content,
        'components' => $selected_components,
        'selected_furniture_types' => $defaultFurnitureTypes,
        'default_textures' => $defaultTextures,
        'products_textures_settings' => $differentTextureSettingsArr
    ]);
}

add_action('wp_ajax_render_settings_images', 'render_settings_images');
add_action('wp_ajax_nopriv_render_settings_images', 'render_settings_images');

function render_settings_images() 
{
    /******* Textures *********/
    $texture_id = $_POST['texture_id'] ?? null;

    if (!isset($_POST['texture_id'])) {
        wp_send_json_error(['message' => 'Missing texture data']);
    }

    $galleries = get_field('galleries', intval($texture_id));
    $all_gallery = $galleries;

    wp_send_json_success([
        'images' => $galleries,
        'id' => intval($texture_id), 
    ]);
}

add_action('wp_ajax_render_config_products', 'render_config_products');
add_action('wp_ajax_nopriv_render_config_products', 'render_config_products');

function render_config_products() 
{
    /******* Textures *********/
    $page = $_POST['page'] ?? 1;
    $perPage = $_POST['per_page'] ?? null;
    $furnitureTypes = isset($_POST['furniture_types']) ? explode(',', $_POST['furniture_types']) : [];
    $textureTypes = get_furniture_texture_types();    
    
    $productsLoop = get_products_query($furnitureTypes, $page, $perPage);
    $differentTextureSettingsArr = [];

    ob_start();

    if($productsLoop->have_posts()): 
        while ( $productsLoop->have_posts() ) : $productsLoop->the_post(); 
            wc_setup_product_data( get_the_ID() ); 
            include __DIR__ .'/template-parts/category/products/list-item.php';
        endwhile; wp_reset_query(); 
        else: ?>
        <p><?php echo __('No products found', 'furniture-config'); ?></p> 
    <?php endif; 
    $content = ob_get_clean();

    ob_start();
    if($page < $productsLoop->max_num_pages) :
        include __DIR__ .'/template-parts/category/products/load-more-button.php'; 
    endif; 
    $loadMoreContent = ob_get_clean();

    wp_send_json_success([
        'content' => $content,
        'load_more_content' => $loadMoreContent, 
    ]);
}

add_action('wp_ajax_render_config_furniture_product_settings', 'render_config_furniture_product_settings');
add_action('wp_ajax_nopriv_render_config_furniture_product_settings', 'render_config_furniture_product_settings');

function render_config_furniture_product_settings() 
{
    global $TEXTURE_ALL_SLUG;
    /******* Textures *********/
    
    if(!isset($_POST['product_id']) || intval($_POST['product_id']) == 0) {
        wp_send_json_error(['message' => 'Missing product ID']);
    }

    if(!isset($_POST['furniture_type'])) {
        wp_send_json_error(['message' => 'Missing furniture type']);
    }

    $productId = intval($_POST['product_id']);
    $furnitureTypeSlug = $_POST['furniture_type'];

    $glbSrc = get_field('3d_image', $productId);
    $furnitureType = get_term_by( 'slug', $furnitureTypeSlug, 'config-furniture-type' );
    $furnitureTypeID  = $furnitureType && ! is_wp_error( $furnitureType) ? 
        $furnitureType->term_id : null; 

    // $itemFurnitureTypes = get_the_terms($productId, 'config-furniture-type');
        
    // $furnitureType = null;
    // $furnitureTypeSlug = null;
    // $furnitureTypeID = null;
    // if(!empty($itemFurnitureTypes)) {
    //     $furnitureType = $itemFurnitureTypes[0];
    //     $furnitureTypeSlug = $furnitureType->slug;
    //     $furnitureTypeID = (int) $furnitureType->term_id;
    // }
    $furnitureAllType = get_furniture_component_types_by_slug($TEXTURE_ALL_SLUG);
    $furnitureTypes = [$furnitureAllType, $furnitureType];
    $defaultFurnitureTypes = [$TEXTURE_ALL_SLUG, $furnitureTypeSlug];
// $defaultFurnitureTypes = get_default_furniture_types_array($furnitureTypes);
    $selected_components = getDefaultProductSettingsComponents($productId, $furnitureTypeSlug);
	$textureTypes = get_furniture_texture_types(null, $furnitureTypeID);
	// $furnitureTypes = get_furniture_types();

    $defaultTexturesData = get_default_textures_for_products($furnitureType, $textureTypes, $productId, $furnitureAllType);
    $defaultTexturesCategories = $defaultTexturesData['texture_types'];
    $defaultTexturesList = $defaultTexturesData['texture_list'];
    
    list (
        $room_height,
        $max_dimension,
        $height_standard,
        $height_min,
        $height_max,
        $depth_standard,
        $depth_min,
        $depth_max,
        $width_standard,
        $width_min,
        $width_max,
    ) = getDefaultProductSettingsDimensions($productId);

    $priceData = getProductTotals(
        $productId, 
        $furnitureType,
        $defaultTexturesList,
        $width_standard,
        $height_standard,
        $depth_standard,
        $selected_components,
    );

    $total = $priceData['regular_total'];
    $discount_total = $priceData['discount_total'];

    ob_start();
    ?>

    <?php include __DIR__ .'/template-parts/product/index-loaded.php'; ?>

    <?php
    $content = ob_get_clean();

    wp_send_json_success([
        'content' => $content,
        'data' => [
            'glb_src' => $glbSrc,
            'furniture_type' => $furnitureTypeSlug,
            'base_total' => $base_total,
        ],   
        'dimensions' => [
            'room_height' => $room_height,
            'max_dimension' => $max_dimension,
            'height' => $height_standard,
            'depth' => $depth_standard,
            'width' => $width_standard,
        ],
        'textures' => $defaultTexturesList,
        'components' => $selected_components,
    ]);
}

add_action('wp_ajax_config_furniture_calculate_totals', 'config_furniture_calculate_totals');
add_action('wp_ajax_nopriv_config_furniture_calculate_totals', 'config_furniture_calculate_totals'); // Allow guests

function config_furniture_calculate_totals() {

    if (!isset($_POST['product_id'])) {
        wp_send_json_error(['message' => 'Missing product data']);
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

    if (!isset($_POST['product_components'])) {
        wp_send_json_error(['message' => 'Missing product components data']);
    }

    $product_id = intval($_POST['product_id']);
    $textures = json_decode($_POST['textures']);
    $dimensions = json_decode(stripslashes($_POST['dimensions']));
    $components = json_decode(stripslashes($_POST['components']));

    list($totals) = get_product_totals(
        $product_id, 
        $textures, 
        $dimensions->width,
        $dimensions->height,
        $dimensions->depth,
        $components,
    );

    if ($totals) {
        wp_send_json_success([
            'totals' => number_format($totals, 2, '.', ''),
        ]);
    } else {
        wp_send_json_error(['message' => 'Failed to calculate totals.']);
    }
}

add_action('wp_ajax_config_furniture_ajax_add_to_cart', 'config_furniture_ajax_add_to_cart');
add_action('wp_ajax_nopriv_config_furniture_ajax_add_to_cart', 'config_furniture_ajax_add_to_cart'); // Allow guests

function wp_ajax_nopriv_config_furniture_ajax_add_to_cart() {

    if (!isset($_POST['product_id'])) {
        wp_send_json_error(['message' => 'Missing product data']);
    }

    if (!isset($_POST['main_settings'])) {
        wp_send_json_error(['message' => 'No settings data']);
    }

    $main_settings = json_decode(stripslashes($_POST['main_settings']));
    $product_id = intval($_POST['product_id']);
    $quantity = 1;


    $cart_item_data = [
        'config_totals' => null,
        'main_settings' => $main_settings,
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

add_action('wp_ajax_product_ajax_calculate_totals', 'product_ajax_calculate_totals');
add_action('wp_ajax_nopriv_product_ajax_calculate_totals', 'product_ajax_calculate_totals'); 

function product_ajax_calculate_totals() {

    if (!isset($_POST['product_id'])) {
        wp_send_json_error(['message' => 'Missing product data']);
    }

    if (!isset($_POST['furniture_type'])) {
        wp_send_json_error(['message' => 'Missing product data']);
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

    $product_id = intval($_POST['product_id']);
    $furnitureType = $_POST['furniture_type'];
    $textures = json_decode(stripslashes($_POST['textures']));
    $dimensions = json_decode(stripslashes($_POST['dimensions']));
    $components = json_decode(stripslashes($_POST['components']));

    $priceData = getProductTotals(
        $product_id, 
        $furnitureType,
        $textures,
        $dimensions->width,
        $dimensions->height,
        $dimensions->depth,
        $components,
    );

    $total = $priceData['regular_total'];
    $discount_total = $priceData['total_discount'];

    if ($total) {
        ob_start();
    
        include __DIR__ .'/template-parts/elements/price/price-data.php'; 

        wp_send_json_success([
            'totals' => ob_get_clean(),
        ]);
    } else {
        wp_send_json_error(['message' => 'Failed to calculate totals.']);
    }
}

add_action('wp_ajax_product_ajax_add_to_cart', 'product_ajax_add_to_cart');
add_action('wp_ajax_nopriv_product_ajax_add_to_cart', 'product_ajax_add_to_cart'); // Allow guests

function product_ajax_add_to_cart() {

    if (!isset($_POST['product_id'])) {
        wp_send_json_error(['message' => 'Missing product data']);
    }

    if (!isset($_POST['main_settings'])) {
        wp_send_json_error(['message' => 'No settings data']);
    }

    $main_settings = json_decode(stripslashes($_POST['main_settings']));
    $product_id = intval($_POST['product_id']);
    $quantity = 1;

    $cart_item_data = [
        'config_totals' => null,
        'main_settings' => $main_settings,
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