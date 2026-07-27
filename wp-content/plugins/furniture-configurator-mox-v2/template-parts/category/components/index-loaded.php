<?php 
    global $furniture_config_v2_template_parts_url;
    $componentsCategories = get_furniture_component_categories();
?>

<div class="components-container settings-preview-container">
    <div class="components-container-inner settings-preview-container-inner">
        <div class="components-main-data">
            <div class="components-main-data-inner">
                <div class="left-content">
                    <p class="desc"><?php echo __('Select cabinet type you want view', 'furniture-config'); ?></p>
                    <?php include $furniture_config_v2_template_parts_url .'/elements/settings/components/accordion/index.php'; ?>
                </div>
            </div>
        </div>
        <!-- <div class="config-loader-container">
            <span class="loader"></span>
        </div> -->
    </div>
    <!-- <div class="load-more-btn-container style2">
        <div class="load-more-btn-container-inner">
            <button class="furniture-config-btn arrow-down" data-type="settings-components"><?php echo __('Load more', 'furniture-config'); ?></button>
        </div>
    </div> -->
</div>