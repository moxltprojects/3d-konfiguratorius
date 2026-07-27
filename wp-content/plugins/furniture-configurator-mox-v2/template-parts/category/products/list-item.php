<?php
defined( 'ABSPATH' ) || exit;

global $product;
if ( ! $product ) {
    return;
}
$productId = get_the_ID();
$glb_src = get_field('3d_image', $productId);
$hasBrandTexture = get_field('has_brand_texture', $productId);

$furnitureTypes = get_the_terms($productId, 'config-furniture-type');
$furnitureType = '';
if(!empty($furnitureTypes)) {
    $furnitureType = $furnitureTypes[0]->slug;
}
$tempDifferentTextureSettingsArr = $differentTextureSettingsArr;

$differentTextureSettingsArr = get_textures_cookie_for_product($productId, $furnitureType, $differentTextureSettingsArr, $textureTypes);
$notModifiableTexture = count($tempDifferentTextureSettingsArr) < count($differentTextureSettingsArr) ? true : false;

$productListItems[] = [
    'product_id' => $productId,
    'furniture_type' => $furnitureType,
    'unmodifiable_texture' => $notModifiableTexture,
    'has_brand_texture' => $hasBrandTexture,
];
?>

<div class="product-item" data-id="<?php echo $productId; ?>" data-furniture_type="<?php echo $furnitureType; ?>" data-unmodifiable_texture="<?php echo $notModifiableTexture; ?>">
    <div class="product-item-inner">
        <div class="thumbnail">
            <a href="<?php the_permalink(); ?>">
                <?php if(empty($glb_src)) : ?>

                    <?php echo $product->get_image(); ?>

                    <?php else : ?>

                    <div class="postcard-image-container" 
                        data-furniture_type="<?php echo $furnitureType; ?>" 
                        data-glb_src="<?php echo $glb_src; ?>"
                    ></div>

                <?php endif; ?>
            </a>
        </div>
        <div class="container-block">
            <div class="container-block-inner">
                <a href="<?php the_permalink(); ?>">
                    <h3><?php the_title(); ?></h3>
                </a>
                <p><?php echo $product->get_short_description(); ?></p>
                <?php echo $product->get_price_html(); ?>
            </div>
        </div>
    </div>
</div>

