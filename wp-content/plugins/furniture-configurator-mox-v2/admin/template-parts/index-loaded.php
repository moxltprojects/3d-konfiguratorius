<?php
global $adminStepsList;
?>
<div 
    class="room-config-container" 
    data-progress="1"
>
    <div class="room-config-container-inner">
        <?php include __DIR__ .'/steps/header.php'; ?>

        <div class="progress-content">
            <div class="progress-content-inner">

                <?php include __DIR__ .'/display/3d-model.php'; ?>

                <div class="steps-content">
                    <?php foreach($adminStepsList as $listItem) : ?>
                        <?php include __DIR__ .'/steps/'. $listItem['slug'] .'/index.php'; ?>
                    <?php endforeach; ?>
                </div>
            </div> 
        </div>

        <?php include __DIR__ .'/steps/footer.php'; ?>

    </div>
</div>