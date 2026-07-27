<?php 
global $furniture_config_v2_template_parts_url;
?>

<div class="summary">
    <div class="summary-inner">
        <h2><?php echo __('Summary', 'furniture-config'); ?></h2>

        <?php include __DIR__ .'/summary-cabinets.php'; ?>

        <?php include $furniture_config_v2_template_parts_url .'/room/steps/play-edit/total-container.php'; ?>

        <?php include __DIR__ .'/add-to-cart-button.php'; ?>
    </div>
</div>