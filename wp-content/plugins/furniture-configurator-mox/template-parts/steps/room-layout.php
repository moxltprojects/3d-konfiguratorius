
<?php
global $plugin_url, $HEIGHT_SLUG, $DEPTH_SLUG, $WIDTH_SLUG, $wall_single, $walls_two;
?>

<section class="room-layout" data-step="2">
    <div class="room-layout-options">
        <div class="option<?php echo $default_room_layout == $wall_single ? ' current' : ''; ?>">
            <?php 
                $type = $wall_single;
                $wall_image = $plugin_url .'/assets/images/single-side.png';
            ?>
            <?php include $template_parts_url .'/display/room-layout-option-button.php'; ?>

            <?php include $template_parts_url .'/room-layouts/single-wall.php'; ?>

        </div>

        <div class="option<?php echo $default_room_layout == $walls_two ? ' current' : ''; ?>">
            <?php 
                $type = $walls_two;
                $wall_image = $plugin_url .'/assets/images/two-sides.png';
            ?>
            <?php include $template_parts_url .'/display/room-layout-option-button.php'; ?>
            
            <?php include $template_parts_url .'/room-layouts/with-corner.php'; ?>
        
        </div>
    </div>
</section>