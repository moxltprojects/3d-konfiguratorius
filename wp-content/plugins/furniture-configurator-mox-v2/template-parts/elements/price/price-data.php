<?php 
global $furniture_config_v2_template_parts_url;
$currency_symbol = get_woocommerce_currency_symbol();

$discount_total = (float) $discount_total;
$total = (float) $total;

?>

<span class="price-data">
    <?php if($discount_total && $discount_total > 0): ?>
        <span>
            <span class="price-num"><?php echo number_format($discount_total, 2, '.', ''); ?></span>
            <?php echo $currency_symbol; ?>
        </span>
        <del>
            <span class="price-num"><?php echo number_format($total, 2, '.', ''); ?></span>
            <?php echo $currency_symbol; ?>
        </del>
        <?php else: ?>
            <span>
                <span class="price-num"><?php echo number_format($total, 2, '.', ''); ?></span> 
                <?php echo $currency_symbol; ?>
            </span>
    <?php endif; ?>
</span>