<?php
$compTypeSlug = $compType->slug;
$compTypeName = $compType->name;
$compLoop     = get_products_query(null, $productPage, 1000, false, $compTypeSlug);
$isCompComponent = true;
?>

<div class="furniture-type component-type" data-slug="<?php echo esc_attr($compTypeSlug); ?>">
    <button class="furniture-type-button">
        <div class="name"><?php echo esc_html($compTypeName); ?></div>
    </button>
    <div class="furniture-type-list">
        <button type="button" data-type="go-back"><?php echo __('Go Back', 'furniture-config'); ?></button>
        <div class="furniture-type-list-inner">
            <?php if($compLoop->have_posts()) : ?>
                <?php while($compLoop->have_posts()) : $compLoop->the_post(); ?>
                    <?php include __DIR__ .'/add-cabinet-item-child.php'; ?>
                <?php endwhile; wp_reset_query(); ?>
            <?php else : ?>
                <p><?php echo __('List is empty.', 'furniture-config'); ?></p>
            <?php endif; ?>
        </div>
    </div>
</div>
