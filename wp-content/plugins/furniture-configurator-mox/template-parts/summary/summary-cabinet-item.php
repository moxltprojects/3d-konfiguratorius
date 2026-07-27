<?php

$width_obj = get_field('width', $furniture_id);
$item_width_min = $width_obj['min'];
$item_width_max = $width_obj['max'];

if($item_width < $item_width_min || $item_width > $item_width_max) {
    $item_width = $item_width_min;
}

// $woocommerce = get_field('woocommerce', $furniture_id);
// $price = (int) $woocommewoocommerce['regular_price'];
// $price = round(floatval($price > 0 ? $price : 0), 2);
// $discount_price = (int) $woocommerce['discount_price'];
// $discount_price = round(floatval($discount_price > 0 ? $discount_price: 0), 2);
?>

<div class="cabinet-item summary-cabinet-item" data-custom_id="<?php echo $custom_id; ?>">
    <div class="summary-cabinet-item-inner">
        <div class="main-container">
            <h3><?php echo $furniture_post->post_title; ?></h3>
            <div class="dimensions-info">
                <?php echo sprintf(
                    __('H: %s(mm), D: %s(mm), W: <span class="w-value">%s</span>(mm)', 'furniture-config'), 
                    $height, $depth, $item_width
                ); ?>
            </div>
        </div>
        <div class="side-container">
            <div class="price-block">
                <div class="price">
                    <?php if($discount_price && $discount_price > 0): ?>
                        <ins>
                            <span class="price-num"><?php echo $item_total; ?></span>
                            <?php echo $currency_symbol; ?>
                        </ins>
                        <del>
                            <span class="price-num"><?php echo $item_total; ?></span>
                            <?php echo $currency_symbol; ?>
                        </del>
                        <?php else: ?>
                            <ins>
                                <span class="price-num"><?php echo $item_total; ?></span> 
                                <?php echo $currency_symbol; ?>
                            </ins>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

</div>
