<?php 
global $TEXTURE_ALL_SLUG;
?>

<div class="selector-list-container">
    <div class="selector-list-container-inner">
        <h2><?php echo __('Select cabinets', 'furniture-config'); ?></h2>
        <p><?php echo __('Select the cabinet group you want to start with here', 'furniture-config'); ?></p>
        <div class="furnitures-list">
            <div class="furnitures-list-inner">
                <?php foreach($furnitureTypes as $furnitureType): ?>
                    <?php
                        $furnitureSlug = $furnitureType->slug;
                        if($furnitureSlug === $TEXTURE_ALL_SLUG) continue;
                    ?>
                    <label class="config-label">
                        <input type="checkbox" value="<?php echo $furnitureSlug; ?>" <?php echo in_array($furnitureSlug, $defaultFurnitureTypes) ? "checked" : ''; ?> />
                        <span class="pseudo-input"></span>
                        <?php echo $furnitureType->name; ?>
                    </label>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>