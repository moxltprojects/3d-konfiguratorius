<?php

global $MY_CABINETS_TYPE, $ADD_CABINETS_TYPE;

?>

<div class="cabinets">
    <div class="cabinets-inner">
        <?php include $template_parts_url ."/play-edit/cabinets/tabs.php"; ?>

        <div class="content">
            <div class="content-inner">
                <?php include $template_parts_url ."/play-edit/cabinets/my-cabinets.php"; ?>
                <?php include $template_parts_url ."/play-edit/cabinets/add-cabinets.php"; ?>
            </div>
        </div>
    </div>
</div>