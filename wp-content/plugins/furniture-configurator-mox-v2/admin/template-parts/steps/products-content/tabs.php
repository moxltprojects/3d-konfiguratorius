<?php 
global $admin_furniture_config_v2_template_parts_url, $WALL_SINGLE_TITLE, $WALL_DOUBLE_TITLE, $WALL_DIMENSIONS, $MY_CABINETS_TYPE, $ADD_CABINETS_TYPE;
?>

<div class="room-type-tabs">
    <button type="button" data-type="<?php echo $WALL_SINGLE; ?>" class="active"><?php echo __($WALL_SINGLE_TITLE, 'furniture-config'); ?></button>
    <button type="button" data-type="<?php echo $WALL_DOUBLE ?>"><?php echo __($WALL_DOUBLE_TITLE, 'furniture-config'); ?></button>
</div>

<div class="tabs">
    <button type="button" data-type="<?php echo $MY_CABINETS_TYPE; ?>" class="active"><?php echo __('My Cabinets', 'furniture-config'); ?></button>
    <button type="button" data-type="<?php echo $ADD_CABINETS_TYPE ?>"><?php echo __('Add a Cabinet', 'furniture-config'); ?></button>
</div>
