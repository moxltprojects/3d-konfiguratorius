<?php
    $uniquePosts = [];
    $displayedPostsIds = [];
    $currentPriceRegular = '0.00';
    $currentPriceDiscount = '0.00'; 
    $currentPostId = $currentSubcategory->post_id ?? null;
?>

<div 
    class="texture-multiple-lists-container<?php echo $typesIndex === 1 || $hasNoSubs ? ' active' : ''; ?>" 
    data-slug="<?php echo $subSlug; ?>"
    data-merged_slug="<?php echo $mergedSlug; ?>"
>
    <div class="heading-container">
        <h3 class="heading"><?php echo __($currentSubcategory->post_title ?? '', 'furniture-config'); ?></h3>
    </div>
    <div class="texture-list" data-parent_id="<?php echo $subcategoryId; ?>">
        <?php if(!empty($mergedPosts)) : ?>
            <?php foreach($mergedPosts as $texture): ?>
                <?php
                    $textureId = $texture->ID;
                    if(in_array($textureId, $displayedPostsIds)) {
                        continue;
                    }
                    $displayedPostsIds[] = $textureId;

                    $textureName = $texture->post_title; 
                    $texturePrices = getWooPrices($textureId);
                    $textureThumbnail = get_the_post_thumbnail_url($textureId, 'thumbnail');
                    $priceData = getWooPrices($textureId);
                    $texture_active_class = '';

                    if($textureId == $currentPostId) {
                        $texture_active_class = ' active';
                        $currentPriceRegular = $priceData['regular'];
                        $currentPriceDiscount = $priceData['discount'];
                    }
                ?>
                <div class="list-item<?php echo $texture_active_class; ?>" 
                    data-id="<?php echo $textureId; ?>"
                    data-name="<?php echo $textureName; ?>"
                    data-price='<?php echo json_encode($priceData); ?>'
                    data-thumbnail="<?php echo $textureThumbnail; ?>"
                >
                    <button><img src="<?php echo $textureThumbnail; ?>"></button>
                </div>
            <?php endforeach; ?>
                <p><?php __('Empty list', 'furniture-config')?></p>
        <?php endif; ?>
    </div>
    <div class="texture-price-block">
        <div class="top-block">
            <p class="price">
                <span class="currency"><?php echo get_woocommerce_currency_symbol(); ?></span>
                <span class="number">
                    <?php if(floatval($currentPriceDiscount) > 0): ?>
                        <span><?php echo $currentPriceRegular; ?></span>
                        <del><?php echo $currentPriceDiscount; ?></del>
                        <?php else: ?>
                        <span><?php echo $currentPriceRegular; ?></span>
                    <?php endif; ?>
                </span>
            </p>
        </div>
    </div>
</div>