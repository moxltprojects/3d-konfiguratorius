<?php
global $FURNITURE_TYPE_ALL_SLUG, $furniture_config_v2_template_parts_url;

$furnitureTypeId = $furnitureType->term_id;
$furnitureTypeSlug = $furnitureType->slug;

if($furnitureTypeSlug === $FURNITURE_TYPE_ALL_SLUG) {
    return;
}

$furnitureTypeName = $furnitureType->name;
$childrenLoop = get_products_query($furnitureTypeSlug, $productPage, $productsListPerPage);

?>

<div class="furniture-type" data-slug="<?php echo $furnitureTypeSlug; ?>">
    <button class="furniture-type-button">
        <div class="name"><?php echo $furnitureTypeName; ?></div>
    </button>
    <div class="furniture-type-list">
        <button type="button" data-type="go-back"><?php echo __('Go Back', 'furniture-config'); ?></button>
        <div class="furniture-type-list-inner">
            <?php if($childrenLoop->have_posts()): ?>
                 <?php while ( $childrenLoop->have_posts() ) : $childrenLoop->the_post(); ?>
                        <?php 
                            include __DIR__ .'/add-cabinet-item-child.php'; 
                        ?>
                    <?php endwhile; ?>
                <?php else: ?>
                    <p><?php echo __('List is empty.', 'furniture-config'); ?></p>
            <?php endif; ?>
        </div>
        <div class="load-more-container">
            <?php if($childrenLoop->max_num_pages > 1) :?>
                <?php include $furniture_config_v2_template_parts_url .'/elements/load-more-button.php'; ?>
            <?php endif; ?>
        </div>
    </div>
</div>