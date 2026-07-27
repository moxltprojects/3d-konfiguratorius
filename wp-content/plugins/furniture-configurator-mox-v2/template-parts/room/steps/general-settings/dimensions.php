<?php 
global 
    $furniture_config_v2_template_parts_url, 
    $HEIGHT_SLUG, 
    $DEPTH_SLUG, 
    $SPACE_SLUG, 
    $FURNITURE_TYPE_FULL, 
    $FURNITURE_TYPE_WALL, 
    $FURNITURE_TYPE_BASE,
    $space_bottom_SLUG;
?>

<div class="dimensions-block">
    <div class="dimensions-block-inner">
        <div class="multiple-containers">
            <h3 class="multiple-heading"><?php echo __('Height', 'furniture-config'); ?>:</h3>
            <div class="multiple-containers-inner">
                <?php 
                    $heading = __("Top", 'furniture-config');
                    $type = $FURNITURE_TYPE_WALL;
                    $dimension_type = $HEIGHT_SLUG;
                    $standard = $furnitureDimensions['top_height'];
                    $min = $furnitureDimensions['top_height_min'];
                    $max = $furnitureDimensions['top_height_max'];
                ?>
                <?php include $furniture_config_v2_template_parts_url .'/elements/settings/slider-container.php'; ?>
                
                <?php 
                    $heading = __("Bottom", 'furniture-config');
                    $type = $FURNITURE_TYPE_BASE;
                    $dimension_type = $HEIGHT_SLUG;
                    $standard = $furnitureDimensions['bottom_height'];
                    $min = $furnitureDimensions['bottom_height_min'];
                    $max = $furnitureDimensions['bottom_height_max'];
                ?>
                <?php include $furniture_config_v2_template_parts_url .'/elements/settings/slider-container.php'; ?>

                <?php 
                    $heading = __("Full", 'furniture-config');
                    $type = $FURNITURE_TYPE_FULL;
                    $dimension_type = $HEIGHT_SLUG;
                    $standard = $furnitureDimensions['full_height'];
                    $min = $furnitureDimensions['full_height_min'];
                    $max = $furnitureDimensions['full_height_max'];
                ?>
                <?php include $furniture_config_v2_template_parts_url .'/elements/settings/slider-container.php'; ?>
            </div>
        </div>
        <div class="multiple-containers">
            <h3 class="multiple-heading"><?php echo __('Depth', 'furniture-config'); ?>:</h3>
            <div class="multiple-containers-inner">
                <?php 
                    $heading = __("Top", 'furniture-config');
                    $type = $FURNITURE_TYPE_WALL;
                    $dimension_type = $DEPTH_SLUG;
                    $standard = $furnitureDimensions['top_depth'];
                    $min = $furnitureDimensions['top_depth_min'];
                    $max = $furnitureDimensions['top_depth_max'];
                ?>
                <?php include $furniture_config_v2_template_parts_url .'/elements/settings/slider-container.php'; ?>

                <?php 
                    $heading = __("Bottom", 'furniture-config');
                    $type = $FURNITURE_TYPE_BASE;
                    $dimension_type = $DEPTH_SLUG;
                    $standard = $furnitureDimensions['bottom_depth'];
                    $min = $furnitureDimensions['bottom_depth_min'];
                    $max = $furnitureDimensions['bottom_depth_max'];
                ?>
                <?php include $furniture_config_v2_template_parts_url .'/elements/settings/slider-container.php'; ?>
                <?php 
                    $heading = __("Full", 'furniture-config');
                    $type = $FURNITURE_TYPE_FULL;
                    $dimension_type = $DEPTH_SLUG;
                    $standard = $furnitureDimensions['full_depth'];
                    $min = $furnitureDimensions['full_depth_min'];
                    $max = $furnitureDimensions['full_depth_max'];
                ?>
                <?php include $furniture_config_v2_template_parts_url .'/elements/settings/slider-container.php'; ?>
            </div>
        </div>
        <?php 
            $heading = __("Space between Bottom and Top furniture", 'furniture-config');
            $type = '';
            $dimension_type = $space_bottom_SLUG;
            $standard = $furnitureDimensions['space_bottom'];
            $min = $furnitureDimensions['space_bottom_min'];
            $max = $furnitureDimensions['space_bottom_max'];
        ?>
        <?php include $furniture_config_v2_template_parts_url .'/elements/settings/slider-container.php'; ?>
    </div>
</div>