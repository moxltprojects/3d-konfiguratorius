<?php

add_action('init', 'shortcodes_furniture_config_v2');
function shortcodes_furniture_config_v2() {
    add_shortcode('mox_furniture_config_general_settings', 'mox_furniture_config_general_settings');
	add_shortcode('mox_furniture_v2_product_thumbnail', 'mox_furniture_v2_product_thumbnail_shortcode');
    add_shortcode('mox_furniture_product_general_settings_v2', 'mox_furniture_product_general_settings_v2_shortcode');
}

function mox_furniture_config_general_settings()
{
    global $post;

    $user_id = get_current_user_id();
    $user_id = $user_id == 0 ? null : $user_id;

    ob_start();
    ?>

    <?php include __DIR__ .'/template-parts/category/index.php'; ?>
    
    <?php
    return ob_get_clean();
}

function mox_furniture_v2_product_thumbnail_shortcode()
{
    global $post;
    $id = get_the_ID();

    $glb_src = get_field('3d_image', $id);
	$furnitureTypes = get_the_terms($id, 'config-furniture-type');
	$type = '';
	if(!empty($furnitureTypes)) {
		$type = $furnitureTypes[0]->slug;
	}
    ob_start();
    ?>
    <div class="postcard-image-container" data-furniture_type="<?php echo $type; ?>" data-glb_src="<?php echo $glb_src; ?>"></div>
    <?php
    return ob_get_clean();
}

function mox_furniture_product_general_settings_v2_shortcode()
{
    global $post;

    $product_id = get_the_ID();
    $user_id = get_current_user_id();
    $user_id = $user_id == 0 ? null : $user_id;

    ob_start();
    ?>

    <?php include __DIR__ .'/template-parts/product/index.php'; ?>
    
    <?php
    return ob_get_clean();
}

