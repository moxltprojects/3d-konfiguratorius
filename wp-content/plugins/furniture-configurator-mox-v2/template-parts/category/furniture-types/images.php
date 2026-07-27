<?php 
    global $furniture_config_v2_plugin_url, $FURNITURE_TYPE_FULL, $FURNITURE_TYPE_WALL, $FURNITURE_TYPE_BASE;
?>

<div class="furniture-types-images">
    <div class="furniture-types-images-inner">
        <div class="images">
            <div class="image-block images-full<?php echo in_array($FURNITURE_TYPE_FULL, $defaultFurnitureTypes) ? ' active' : ''; ?>" data-type_slug="<?php echo $FURNITURE_TYPE_FULL; ?>">
                <img src="<?php echo $furniture_config_v2_plugin_url; ?>/assets/images/furniture-types/cabinet-full1.png" />
            </div>
            <div class="images-small">
                <div class="image-block image-wall<?php echo in_array($FURNITURE_TYPE_WALL, $defaultFurnitureTypes) ? ' active' : ''; ?>" data-type_slug="<?php echo $FURNITURE_TYPE_WALL; ?>">
                    <img src="<?php echo $furniture_config_v2_plugin_url; ?>/assets/images/furniture-types/cabinet-top.png" />
                </div>
                 <div class="image-block image-base<?php echo in_array($FURNITURE_TYPE_BASE, $defaultFurnitureTypes) ? ' active' : ''; ?>" data-type_slug="<?php echo $FURNITURE_TYPE_BASE; ?>">
                    <img src="<?php echo $furniture_config_v2_plugin_url; ?>/assets/images/furniture-types/cabinet-bottom.png" />
                </div>
            </div>
        </div>
    </div>
</div>