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
    <?php include $furniture_config_v2_template_parts_url .'/elements/settings/slider-container.php'; ?>

    <div class="water-supply-container">
        <div class="water-supply-toggle">
            <h3><?php _e('Water supply point', 'furniture-config'); ?></h3>
            <label class="water-supply-label">
                <input
                    type="checkbox"
                    name="water_supply_enabled"
                    class="water-supply-checkbox"
                    <?php echo !empty($waterSupplyEnabled) ? 'checked' : ''; ?>
                />
                <span class="water-supply-circle"></span>
            </label>
        </div>
        <div class="water-supply-distance<?php echo !empty($waterSupplyEnabled) ? '' : ' hidden'; ?>">
            <?php
                $wsWallLeft  = isset($waterSupplyDistance) && $waterSupplyDistance < 0;
                $wsDistanceAbs = isset($waterSupplyDistance) ? abs($waterSupplyDistance) : 250;
            ?>
            <div class="water-supply-wall-selection">
                <label class="water-supply-wall-label">
                    <input type="radio" name="water_supply_wall" class="water-supply-wall-radio" value="right" <?php echo !$wsWallLeft ? 'checked' : ''; ?> />
                    <?php _e('Right wall', 'furniture-config'); ?>
                </label>
                <label class="water-supply-wall-label">
                    <input type="radio" name="water_supply_wall" class="water-supply-wall-radio" value="left" <?php echo $wsWallLeft ? 'checked' : ''; ?> />
                    <?php _e('Left wall', 'furniture-config'); ?>
                </label>
            </div>
            <?php
                $heading        = $wsWallLeft ? __('Distance from left side wall', 'furniture-config') : __('Distance from right side wall', 'furniture-config');
                $type           = 'water_supply_distance';
                $dimension_type = 'water_supply_distance';
                $standard       = $wsDistanceAbs;
                $min            = 0;
                $max            = $wsWallLeft ? $wallDepthStandard : $wallWidthStandard;
                $constant_name  = 'WATER_SUPPLY_DISTANCE';
            ?>
            <?php include $furniture_config_v2_template_parts_url .'/elements/settings/slider-container.php'; ?>
        </div>
    </div>
</div>
