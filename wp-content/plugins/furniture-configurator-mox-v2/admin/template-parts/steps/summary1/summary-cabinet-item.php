<?php
global $furniture_config_v2_template_parts_url;
?>

<div class="cabinet-item summary-cabinet-item" data-custom_id="<?php echo $customId; ?>">
    <div class="summary-cabinet-item-inner">
        <div class="main-container">
            <h3><?php echo $productTitle; ?></h3>
            <div class="dimensions-info">
                <?php echo sprintf(
                    __('H: %s(mm), D: %s(mm), W: <span class="w-value">%s</span>(mm)', 'furniture-config'), 
                    $height, $depth, $itemWidth
                ); ?>
            </div>
        </div>
        <div class="side-container">
            <div class="price-block">
               <?php include $furniture_config_v2_template_parts_url .'/elements/price/price-data.php'; ?>
            </div>
        </div>
    </div>

</div>
