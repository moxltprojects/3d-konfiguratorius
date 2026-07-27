<?php 
global $furniture_config_v2_template_parts_url;
?>
<section class="cabinet-settings" data-step="<?php echo $listItem['step']; ?>">
    <div class="cabinet-settings-inner">
        <div class="main-container-wrap">
            
            <?php include __DIR__ .'/sidebar.php'; ?>

            <?php include $furniture_config_v2_template_parts_url .'/room/steps/summary/index.php'; ?>

        </div>
    </div>
    <div class="config-loader-container">
        <span class="loader"></span>
    </div>
</section>