<?php 
global $WALL_SINGLE, $WALL_SINGLE_TITLE, $WALL_DOUBLE, $WALL_DOUBLE_TITLE; 
?>

<div class="room-type-tabs">
    <button type="button" data-type="<?php echo $WALL_SINGLE; ?>" class="active"><?php echo __($WALL_SINGLE_TITLE, 'furniture-config'); ?></button>
    <button type="button" data-type="<?php echo $WALL_DOUBLE ?>"><?php echo __($WALL_DOUBLE_TITLE, 'furniture-config'); ?></button>
</div>