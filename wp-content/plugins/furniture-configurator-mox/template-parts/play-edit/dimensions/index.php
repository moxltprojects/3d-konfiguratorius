
<?php 
global $wall_single, $walls_two;
?>

<div class="dimensions">
    <div class="dimensions-inner">
        <div class="content">
            <?php if($wall_single) : ?>
                    <?php include $template_parts_url .'/room-layouts/single-wall.php'; ?>
                <?php else: ?>
                    <?php include $template_parts_url .'/room-layouts/with-corner.php'; ?>
            <?php endif; ?>
        </div>
    </div>
</div>