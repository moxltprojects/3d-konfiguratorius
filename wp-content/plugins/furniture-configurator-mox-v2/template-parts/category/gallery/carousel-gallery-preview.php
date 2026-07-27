<?php 
$textureTypes = get_furniture_texture_types();
$furnitureTypes = get_furniture_types();

$defaultTexturesCategories = get_default_config_settings_texture_ids($textureTypes, $furnitureTypes);
?>

<div class="settings-preview-gallery-container settings-preview-container">
    <div class="settings-preview-gallery-container-inner settings-preview-container-inner">
        <div class="preview-gallery-image">
            <?php 
                $imageSlug = 'image_1';
            ?>
            <?php include __DIR__  .'/texture-image.php';?>
        </div>
        <div class="config-loader-container">
            <span class="loader"></span>
        </div>
    </div>
    <div class="load-more-btn-container style2">
        <div class="load-more-btn-container-inner">
            <button class="furniture-config-btn arrow-down" data-type="settings-gallery"><?php echo __('Load more', 'furniture-config'); ?></button>
        </div>
    </div>
</div>