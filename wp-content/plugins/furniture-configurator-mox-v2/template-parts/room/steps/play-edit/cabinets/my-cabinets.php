<?php 
global $furniture_config_v2_template_parts_url;
?>

<div class="tab-content dynamic-list my-cabinets-list current" data-type="<?php echo $MY_CABINETS_TYPE; ?>">
    <div class="my-cabinets-inner add-element-tabs-wrapper">
        <div class="add-element-tabs">
            <button type="button" class="add-element-tab active" data-tab="furniture"><?php _e('Furniture', 'furniture-config'); ?></button>
            <button type="button" class="add-element-tab" data-tab="components"><?php _e('Components', 'furniture-config'); ?></button>
        </div>
        <div class="add-element-tab-content active" data-tab="furniture">
            <div class="dynamic-list-inner my-cabinets-list-inner">
                <?php echo $productsListData['my_items_html'] ?? ''; ?>
            </div>
        </div>
        <div class="add-element-tab-content" data-tab="components">
            <div class="my-components-list-inner">
                <?php echo $productsListData['my_comp_items_html'] ?? ''; ?>
            </div>
        </div>
    </div>
    <?php include $furniture_config_v2_template_parts_url .'/room/steps/play-edit/total-container.php'; ?>
</div>