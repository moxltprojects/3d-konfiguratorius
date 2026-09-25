<?php
global $ADD_CABINETS_TYPE;
$productPage          = 1;
$furnitureComponentTypes = get_furniture_component_types();
?>

<div class="tab-content furniture-types-list-container" data-type="<?php echo $ADD_CABINETS_TYPE; ?>">
    <div class="furniture-types-container-inner add-element-tabs-wrapper">

        <div class="add-element-tabs">
            <button type="button" class="add-element-tab active" data-tab="furniture"><?php _e('Furniture', 'furniture-config'); ?></button>
            <button type="button" class="add-element-tab" data-tab="components"><?php _e('Components', 'furniture-config'); ?></button>
        </div>

        <div class="add-element-tab-content active" data-tab="furniture">
            <ul class="furniture-types-list">
                <?php foreach($furnitureTypes as $furnitureType) : ?>
                    <?php include __DIR__ .'/add-cabinet-item.php'; ?>
                <?php endforeach; ?>
            </ul>
        </div>

        <div class="add-element-tab-content" data-tab="components">
            <?php if(!empty($furnitureComponentTypes)) : ?>
                <ul class="furniture-types-list component-types-list">
                    <?php foreach($furnitureComponentTypes as $compType) : ?>
                        <?php include __DIR__ .'/add-cabinet-comp-item.php'; ?>
                    <?php endforeach; ?>
                </ul>
            <?php else : ?>
                <p><?php _e('No components found.', 'furniture-config'); ?></p>
            <?php endif; ?>
        </div>

    </div>
</div>
