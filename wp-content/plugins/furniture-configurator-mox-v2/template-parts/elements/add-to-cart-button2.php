<?php
    global $furniture_config_v2_template_parts_url;
?>
<div class="buy-container">
    <?php include $furniture_config_v2_template_parts_url .'/elements/price/price-container.php'; ?>
    <div id="add-to-cart-message"></div>
    <button type="submit" class="furniture-config-btn config_add_to_cart_button styled-button bright" data-product_id="<?php echo $productId; ?>">
        <span>Add to Cart</span>
    </button>
</div>
