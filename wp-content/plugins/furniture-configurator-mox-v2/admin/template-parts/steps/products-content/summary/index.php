<?php 
global $WALL_SINGLE, $WALL_DOUBLE;
?>
<div class="summary">
    <div class="summary-inner">

        <div class="summary-content">
            <?php 
                $roomType = $WALL_SINGLE;
                $currentClass = ' current'; 
            ?>
            <?php include __DIR__ .'/summary-cabinets.php'; ?>

             <?php 
                $roomType = $WALL_DOUBLE;
                $currentClass = ' '; 
            ?>
            <?php include __DIR__ .'/summary-cabinets.php'; ?>
            
        </div>

    </div>
</div>