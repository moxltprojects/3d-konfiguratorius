<?php 
global $furniture_config_v2_plugin_url;
$unit = 'cm';
?>

<div class="dimensions-block">
    <?php 
        $heading = __('Left wall length', 'furniture-config');
        $type = $DEPTH_SLUG;
        $dimension_type = $DEPTH_SLUG;
        $standard = $wallDepthStandard;
        $min = $wallDepthMin;
        $max = $wallDepthMax;
        $constant_name = 'ROOM_DEPTH'; 
    ?>
    <?php include $furniture_config_v2_template_parts_url .'/elements/settings/slider-container.php'; ?>

    <?php 
        $heading = __('Right wall length', 'furniture-config');
        $type = $WIDTH_SLUG;
        $dimension_type = $WIDTH_SLUG;
        $standard = $wallWidthStandard;
        $min = $wallWidthMin;
        $max = $wallWidthMax;
        $constant_name = 'ROOM_WIDTH'; 
    ?>
    <?php include $furniture_config_v2_template_parts_url .'/elements/settings/slider-container.php'; ?>

    <?php 
        $heading = __('Room height', 'furniture-config');
        $type = $HEIGHT_SLUG;
        $dimension_type = $HEIGHT_SLUG;
        $standard = $wallHeightStandard;
        $min = $wallHeightMin;
        $max = $wallHeightMax;
        $constant_name = 'ROOM_HEIGHT'; 
    ?>
    <?php include $furniture_config_v2_template_parts_url .'/elements/settings//slider-container.php'; ?>
</div>
