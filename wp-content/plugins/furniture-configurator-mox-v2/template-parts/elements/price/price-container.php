<?php 
global $furniture_config_v2_template_parts_url;

?>
<div class="price-container">
    <div id="totals-message"></div>
    <div class="price-container-inner">
        <strong><?php echo __('Total', 'furniture-config'); ?>: </strong> 
        <?php include $furniture_config_v2_template_parts_url .'/elements/price/price-data.php'; ?>
    </div>
</div>
