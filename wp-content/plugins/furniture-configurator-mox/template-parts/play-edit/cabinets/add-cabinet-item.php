<?php

$furniture_id = $child->ID;
$furniture_post = $child;

$model_file = get_field('3d_model', $furniture_id);
$model_file_url = $model_file ? $model_file['url'] : null;

if(!$model_file_url) return;

$width_obj = get_field('width', $furniture_id);
$item_width = $width_obj['default'];
$item_width_min = $width_obj['min'];
$item_width_max = $width_obj['max'];

if($item_width < $item_width_min || $item_width > $item_width_max) {
    $item_width = $item_width_min;
}

$item_type = get_furniture_type($furniture_id);
$item_type_slug = $item_type->slug;
$type = $item_type_slug;

$image = get_the_post_thumbnail( $furniture_id, 'thumbnail' );

// $woocommerce = get_field('woocommerce', $furniture_id);
// $price = (int) $woocommewoocommerce['regular_price'];
// $price = round(floatval($price > 0 ? $price : 0), 2);
// $discount_price = (int) $woocommerce['discount_price'];
// $discount_price = round(floatval($discount_price > 0 ? $discount_price: 0), 2); $item_woocommerce = get_field('woocommerce', $furniture_id);
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
    $item_price,
    $price,
    $discount_price,
    $item_price_cm3,
    $price_cm3,
    $discount_price_cm3,
) = get_item_prices($furniture_id);

// list(
//     $height, 
//     $depth,
//     $height_min,
//     $height_max,
//     $depth_min,
//     $depth_max
// ) = get_furniture_dimensions_by_type( 
//     $item_type_slug,
//     $bottom_height_standard,
//     $top_height_standard,
//     $full_height_standard,
//     $bottom_full_depth_standard,
//     $top_depth_standard,
//     $bottom_height_min,
//     $bottom_height_max,
//     $top_height_min,
//     $top_height_max,
//     $full_height_min,
//     $full_height_max,
//     $bottom_full_depth_min,
//     $bottom_full_depth_max,
//     $top_depth_min,
//     $top_depth_max
// );

$item_data = [
    'furniture_id' => $furniture_id,
    'type' => $type,
    'model_src' => $model_file_url,
    'min_width' => $item_width_min,
    'max_width' => $item_width_max,
    'display_price' => $item_price,
    'display_price_cm3' => $item_price_cm3,
];

?>

<div 
    class="cabinet-item add-cabinet-item" 
    data-item_data="<?php echo htmlspecialchars(json_encode($item_data), ENT_QUOTES, 'UTF-8'); ?>"
    data-item_width="<?php echo $item_width; ?>"
>
    <div class="add-cabinet-item-inner">
        <div class="image-container">
            <div class="image-block">
                <?php if($image): ?>
                    <?php echo $image; ?>
                <?php endif; ?>
            </div>
        </div>
        <div class="main-container">
            <div class="dimensions-info">
                <?php echo sprintf(
                    __('W: <span class="w-value">%s</span>mm <span class="range">(%s - %s)</span>', 'furniture-config'), 
                    $item_width, $item_width_min, $item_width_max
                ); ?>
            </div>
            <h3><?php echo $furniture_post->post_title; ?></h3>
        </div>
        <div class="side-container">
            <div class="item-actions-container">
                <button 
                    type="button" 
                    data-action_type="add"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="15" height="15" rx="8" fill="#2a568d" stroke="#2a568d"></rect><path d="M4.266 8L7.066 10.8L11.73 5.2" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dashoffset="0px" stroke-dasharray="1px 1px"></path></svg>
                    <span><?php echo __('Add', 'furniture-config'); ?></span>
                </button>
                <button type="button" data-type="edit">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.049 10.793a.63.63 0 0 0 .094-.007l2.628-.461a.153.153 0 0 0 .083-.044l6.623-6.623a.157.157 0 0 0 .034-.17.156.156 0 0 0-.034-.05L9.88.837a.155.155 0 0 0-.11-.045.155.155 0 0 0-.112.046L3.035 7.462a.159.159 0 0 0-.044.083l-.46 2.628a.523.523 0 0 0 .146.466.53.53 0 0 0 .372.155Zm1.053-2.725L9.77 2.403l1.146 1.145-5.668 5.666-1.389.245.244-1.39Zm8.67 4.038h-11.5a.5.5 0 0 0-.5.5v.563c0 .068.057.124.125.124h12.25a.125.125 0 0 0 .126-.124v-.563a.5.5 0 0 0-.5-.5Z" fill="currentColor"></path></svg>
                    <span><?php echo __('Edit', 'furniture-config'); ?></span>
                </button>
            </div>
            <div class="price-block">
                <div class="price">
                    <?php if($discount_price && $discount_price > 0): ?>
                        <ins>
                            <span class="price-num"><?php echo number_format($discount_price, 2, '.', ''); ?></span>
                            <?php echo $currency_symbol; ?>
                        </ins>
                        <del>
                            <span class="price-num"><?php echo number_format($price, 2, '.', ''); ?></span>
                            <?php echo $currency_symbol; ?>
                        </del>
                        <?php else: ?>
                            <ins>
                                <span class="price-num"><?php echo number_format($price, 2, '.', ''); ?></span> 
                                <?php echo $currency_symbol; ?>
                            </ins>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <div class="edit-container"></div>
                     
    <!-- <php include $template_parts_url ."/play-edit/cabinets/cabinet-item-edit.php"; > -->

</div>
