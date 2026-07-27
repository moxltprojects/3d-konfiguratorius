
<?php
global $furniture_config_v2_plugin_url, $HEIGHT_SLUG, $DEPTH_SLUG, $WIDTH_SLUG, $WALL_SINGLE, $WALL_DOUBLE;

$unit = 'cm';
?>

<section class="room-layout" data-step="<?php echo $listItem['step']; ?>">
    <div class="room-layout-inner">  
        <div class="dimensions-block">
            <?php 
                $heading = __('Room width', 'furniture-config');
                $type = $WIDTH_SLUG;
                $dimension_type = $WIDTH_SLUG;
                $standard = $wallWidthStandard;
                $min = $wallWidthMin;
                $max = $wallWidthMax;
                $constant_name = 'ROOM_WIDTH'; 
            ?>
            <?php include $furniture_config_v2_template_parts_url .'/elements/settings/slider-container.php'; ?>
            
            <?php 
                $heading = __('Room Depth / Left Side', 'furniture-config');
                $type = $DEPTH_SLUG;
                $dimension_type = $DEPTH_SLUG;
                $standard = $wallDepthStandard;
                $min = $wallDepthMin;
                $max = $wallDepthMax;
                $constant_name = 'ROOM_DEPTH'; 
            ?>
            <?php include $furniture_config_v2_template_parts_url .'/elements/settings/slider-container.php'; ?>

            <?php 
                $heading = __('Wall height', 'furniture-config');
                $type = $HEIGHT_SLUG;
                $dimension_type = $HEIGHT_SLUG;
                $standard = $wallHeightStandard;
                $min = $wallHeightMin;
                $max = $wallHeightMax;
                $constant_name = 'ROOM_HEIGHT'; 
            ?>
            <?php include $furniture_config_v2_template_parts_url .'/elements/settings/slider-container.php'; ?>
        </div>
    </div>
</section>