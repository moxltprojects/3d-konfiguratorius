<?php 

?>

<div class="model-display-container">
    <div class="model-display-container-inner">
        <?php include __DIR__ .'/3d-settings-sidebar.php'; ?>
        <div class="room-model-container">
            <div class="room-model-container-inner">
                <div class="canvas-parent current" data-type="<?php echo $WALL_SINGLE; ?>"></div>
                <div class="canvas-parent" data-type="<?php echo $WALL_DOUBLE; ?>"></div>
            </div>
        </div>
    </div>
</div>
