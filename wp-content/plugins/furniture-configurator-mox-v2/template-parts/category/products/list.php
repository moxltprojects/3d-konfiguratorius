<?php 
global $furniture_config_v2_template_parts_url;
$differentTextureSettingsArr = [];
$productsLoop = get_products_query($defaultFurnitureTypes);
$productListItems = [];
?>

<div class="products-grid-container">
    <div class="products-grid-container-inner">
        <h2><?php echo __('Our Products', 'furniture-config'); ?></h2>
        <div class="products-list">
            <div class="products-list-inner">
                <?php if ( $productsLoop->have_posts() ) : ?>
                    <?php while ( $productsLoop->have_posts() ) : $productsLoop->the_post(); ?>
                        <?php 
                            // wc_setup_product_data( get_the_ID() ); 
                            include __DIR__ .'/list-item.php'; 
                        ?>
                    <?php endwhile; ?>
                <?php endif; ?>
            </div>
            <div class="load-more-container">
                <?php if($productsLoop->max_num_pages > 1) :?>
                    <?php include $furniture_config_v2_template_parts_url .'/elements/load-more-button.php'; ?>
                <?php endif; ?>
            </div>
            <div class="config-loader-container">
                <span class="loader"></span>
            </div>
        </div>
    </div>
</div>
<?php wp_reset_postdata(); ?>