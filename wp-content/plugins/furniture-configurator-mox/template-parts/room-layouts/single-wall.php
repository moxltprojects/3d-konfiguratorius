<div class="dimensions-block">
    <?php 
        $heading = __('Room width', 'furniture-config');
        $type = $WIDTH_SLUG;
        $dimension_type = $WIDTH_SLUG;
        $standard = $wall_width_standard;
        $min = $wall_width_min;
        $max = $wall_width_max;
        $constant_name = 'roomWidth'; 
    ?>
    <?php include $template_parts_url .'/dimensions/slider-container.php'; ?>
    
    <?php 
        $heading = __('Room Depth', 'furniture-config');
        $type = $DEPTH_SLUG;
        $dimension_type = $DEPTH_SLUG;
        $standard = $wall_depth_standard;
        $min = $wall_depth_min;
        $max = $wall_depth_max;
        $constant_name = 'roomDepth'; 
    ?>
    <?php include $template_parts_url .'/dimensions/slider-container.php'; ?>

    <?php 
        $heading = __('Wall height', 'furniture-config');
        $type = $HEIGHT_SLUG;
        $dimension_type = $HEIGHT_SLUG;
        $standard = $wall_height_standard;
        $min = $wall_height_min;
        $max = $wall_height_max;
        $constant_name = 'roomHeight'; 
    ?>
    <?php include $template_parts_url .'/dimensions/slider-container.php'; ?>
</div>