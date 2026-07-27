
<?php
global $furniture_config_v2_plugin_url, $HEIGHT_SLUG, $DEPTH_SLUG, $WIDTH_SLUG, $WALL_SINGLE, $WALL_DOUBLE;
?>

<section class="room-layout" data-step="<?php echo $listItem['step']; ?>">
    <div class="room-layout-options">
    
        <?php if(!$currentRoomType || $currentRoomType === $WALL_SINGLE) : ?>
            <div class="option<?php echo $defaultRoomLayout == $WALL_SINGLE || $currentRoomType == null ? ' current' : ''; ?>">
                <?php 
                    $type = $WALL_SINGLE;
                    $wall_image = $furniture_config_v2_plugin_url .'/assets/images/room/single-side.png';
                ?>
                <?php include __DIR__ .'/room-layout-option-button.php'; ?>

                <?php include __DIR__ .'/single-wall.php'; ?>

            </div>
        <?php endif; ?>

        <?php if(!$currentRoomType || $currentRoomType === $WALL_DOUBLE) : ?>
            <div class="option<?php echo $defaultRoomLayout == $WALL_DOUBLE ? ' current' : ''; ?>">
                <?php 
                    $type = $WALL_DOUBLE;
                    $wall_image = $furniture_config_v2_plugin_url .'/assets/images/room/two-sides.png';
                ?>
                <?php include __DIR__ .'/room-layout-option-button.php'; ?>
                
                <?php include __DIR__ .'/with-corner.php'; ?>
            </div>
        <?php endif; ?>
    </div>
</section>