<?php 
defined( 'ABSPATH' ) || exit;

global $product, $furniture_config_v2_template_parts_url;
if ( ! $product ) {
    return;
}
$productId = get_the_ID();
$glbSrc = get_field('3d_image', $productId);

if(!$glbSrc) return;

$furnitureTypes = get_the_terms($productId, 'config-furniture-type');
$furnitureTypeSlug = '';
if(!empty($furnitureTypes)) {
    $furnitureTypeSlug = $furnitureTypes[0]->slug;
}

$thumbnailData = getProductThumbnailData($standImageData, $productId);
$attachmentUrl = $thumbnailData['url'] ?? null;
$attachmentId = $thumbnailData['id'] ?? null;
$attachmentType = $thumbnailData['attachmentType'] ?? null;
$hasBrandTexture = get_field('has_brand_texture', $productId);

$width_obj = get_field('width', $productId);
$itemWidth = intval($width_obj['default'] ?? 0);
$itemWidthMin = intval($width_obj['min'] ?? 0);
$itemWidthMax = intval($width_obj['max'] ?? 0);

if($itemWidth < $itemWidthMin || $itemWidth > $itemWidthMax) {
    $itemWidth = $itemWidthMin;
}

$dimensions = $furnitureDimensionsSortedByType[$furnitureTypeSlug] ?? null;

$height_obj = get_field('height', $productId);
$itemHeight = intval($height_obj['default'] ?? 0);
$itemHeightMin = 0;
$itemHeightMax = 0;
if(!$dimensions || $itemHeight && $itemHeight > 0) {
    $itemHeightMin = intval($height_obj['min'] ?? 0);
    $itemHeightMax = intval($height_obj['max'] ?? 0);
} else {
    $itemHeight = intval($dimensions['height'] ?? 0);
    $itemHeightMin = intval($dimensions['min_height'] ?? 0);
    $itemHeightMax = intval($dimensions['max_height'] ?? 0);
}

if($itemHeight < $itemHeightMin || $itemHeight > $itemHeightMax) {
    $itemHeight = $itemHeightMin;
}

$depth_obj = get_field('depth', $productId);
$itemDepth = intval($depth_obj['default'] ?? 0);
$itemDepthMin = 0;
$itemDepthMax = 0;
if($itemDepth && $itemDepth > 0) {
    $itemDepthMin = intval($depth_obj['min'] ?? 0);
    $itemDepthMax = intval($depth_obj['max'] ?? 0);
} else {
    $itemDepth = intval($dimensions['depth'] ?? 0);
    $itemDepthMin = intval($dimensions['min_depth'] ?? 0);
    $itemDepthMax = intval($dimensions['max_depth'] ?? 0);
}

if($itemDepth < $itemDepthMin || $itemDepth > $itemDepthMax) {
    $itemDepth = $itemDepthMin;
}

$space_bottom_obj = get_field('space_bottom', $productId);
$itemSpaceBottom = isset($space_bottom_obj['default']) ? intval($space_bottom_obj['default']) : 0;
$itemSpaceBottomMin = 0;
$itemSpaceBottomMax = 0;
if($itemSpaceBottom && $itemSpaceBottom > 0) {
    $itemSpaceBottomMin = intval($space_bottom_obj['min'] ?? 0);
    $itemSpaceBottomMax = intval($space_bottom_obj['max'] ?? 0);
} else {
    $itemSpaceBottom = intval($dimensions['space_bottom'] ?? 0);
    $itemSpaceBottomMin = intval($dimensions['min_space_bottom'] ?? 0);
    $itemSpaceBottomMax = intval($dimensions['max_space_bottom'] ?? 0);
}

if($itemSpaceBottom < $itemSpaceBottomMin || $itemSpaceBottom > $itemSpaceBottomMax) {
    $itemSpaceBottom = $itemSpaceBottomMin;
}

$regularPrice = $product->get_regular_price();
$salePrice = $product->get_sale_price();
$displayPrice = $product->get_price();

$cm3Price = get_field('cm3_price', $productId);
$cm3PriceRegular = $cm3Price['regular'];
$cm3PriceDiscount = $cm3Price['discount'];
$cm3PriceDisplay = $cm3PriceDiscount && $cm3PriceDiscount > 0 ? $cm3PriceDiscount : $cm3PriceRegular;

$all_furniture_list_objects[] = array(
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
        'width' => $itemWidth,
        'height' => $itemHeight,
        'depth' => $itemDepth,
        'space_bottom' => $itemSpaceBottom,
        'prices' => [
            'regular_total' => $regularPrice,
            'discount_total' => $salePrice,
            'display_total' => $displayPrice,
            'regular' => $regularPrice,
            'regular_cm3' => $cm3PriceRegular,
            'discount' => $salePrice,
            'discount_cm3' => $cm3PriceDiscount,
            'display' => $displayPrice,
            'display_cm3' => $cm3PriceDisplay,
        ],
        'object_src' => $glbSrc,
        'attachment_type' => $attachmentType,
        'attachment_id' => $attachmentId,
        'has_brand_texture' => $hasBrandTexture,
        'options' => [],
    ],
);

?>

<div 
    class="cabinet-item add-cabinet-item" 
	data-product_id="<?php echo $productId; ?>"
>
    <div class="add-cabinet-item-inner">
        <div class="image-container">
            <div class="image-block">
               <?php include $furniture_config_v2_template_parts_url .'/elements/attachment_html.php'; ?>
            </div>
        </div>
        <div class="main-container">
            <div class="dimensions-info">
               <?php echo sprintf(
                    __('W: <span class="width-value">%s</span>mm', 'furniture-config'), 
                    $itemWidth
                ); ?>
                <?php echo sprintf(
                    __('H: <span class="height-value">%s</span>mm', 'furniture-config'), 
                    $itemHeight
                ); ?>
                 <?php echo sprintf(
                    __('D: <span class="depth-value">%s</span>mm', 'furniture-config'), 
                    $itemDepth
                ); ?>
            </div>
            <h3><?php the_title(); ?><?php echo getBrantTitleSuffrix($hasBrandTexture);?></h3>
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
                <button type="button" data-action_type="edit">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.049 10.793a.63.63 0 0 0 .094-.007l2.628-.461a.153.153 0 0 0 .083-.044l6.623-6.623a.157.157 0 0 0 .034-.17.156.156 0 0 0-.034-.05L9.88.837a.155.155 0 0 0-.11-.045.155.155 0 0 0-.112.046L3.035 7.462a.159.159 0 0 0-.044.083l-.46 2.628a.523.523 0 0 0 .146.466.53.53 0 0 0 .372.155Zm1.053-2.725L9.77 2.403l1.146 1.145-5.668 5.666-1.389.245.244-1.39Zm8.67 4.038h-11.5a.5.5 0 0 0-.5.5v.563c0 .068.057.124.125.124h12.25a.125.125 0 0 0 .126-.124v-.563a.5.5 0 0 0-.5-.5Z" fill="currentColor"></path></svg>
                    <span><?php echo __('Edit', 'furniture-config'); ?></span>
                </button>
            </div>
            <div class="price-block">
                <div class="price">
                    <?php echo $product->get_price_html(); ?>
                </div>
            </div>
        </div>
    </div>
</div>