<?php 
global $admin_furniture_config_v2_template_parts_url, $WALL_SINGLE, $WALL_DOUBLE;
?>
<div class="summary">
    <div class="summary-inner">
        <?php include $admin_furniture_config_v2_template_parts_url . '/global/room-type-tabs.php'; ?>

        <div class="summary-content">
            <?php 
                $roomType = $WALL_SINGLE;
            ?>
            <?php include __DIR__ .'/summary-cabinets.php'; ?>

             <?php 
                $roomType = $WALL_DOUBLE;
            ?>
            <?php include __DIR__ .'/summary-cabinets.php'; ?>
            
        </div>

    </div>
</div>