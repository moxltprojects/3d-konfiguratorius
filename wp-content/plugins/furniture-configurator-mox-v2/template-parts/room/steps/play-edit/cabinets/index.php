<?php

global $MY_CABINETS_TYPE, $ADD_CABINETS_TYPE;

?>

<div class="cabinets">
    <div class="cabinets-inner">
        <?php include __DIR__ ."/tabs.php"; ?>

        <div class="content">
            <div class="content-inner">
                <?php include __DIR__ ."/my-cabinets.php"; ?>
                <?php include __DIR__ ."/add-cabinets.php"; ?>
            </div>
            <div class="edit-container"></div>
        </div>
    </div>
</div>