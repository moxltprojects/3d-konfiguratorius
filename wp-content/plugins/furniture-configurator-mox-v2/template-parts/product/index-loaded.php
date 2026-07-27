<?php 

global $steps_content_data, $furniture_config_v2_template_parts_url;
$innerProductPage = true;
$componentsCategories = get_furniture_component_categories_filtered_by_furniture_types($furnitureTypes);

?>

<div class="config-furniture-settings-content">
    <div class="config-furniture-settings-content-inner">
        <?php include $furniture_config_v2_template_parts_url .'/elements/add-to-cart-button.php'; ?>
        <div class="setting-container-wrap">
            <div class="settings-container">
                <div class="settings-container-inner">
                    <div>
                        <?php include $furniture_config_v2_template_parts_url .'/elements/settings/textures/index.php'; ?>
                    </div>
                    <div>   
                        <h2><?php echo __('Components', 'furniture-config'); ?></h2>
                        <?php include $furniture_config_v2_template_parts_url .'/elements/settings/components/accordion/index.php'; ?>
                    </div>
                    <div>
                        <h2><?php echo __('Dimensions', 'furniture-config'); ?></h2>
                        <?php include $furniture_config_v2_template_parts_url .'/product/settings-sections/dimensions/index.php'; ?>
                    </div>
                    <!-- <php include $furniture_config_v2_template_parts_url .'/product/settings-sections/dynamic-components/index.php'; > -->
                </div>
            </div>

            <?php include $furniture_config_v2_template_parts_url .'/product/display/product-thumbnail.php'; ?>
        </div>
    </div>
</div>