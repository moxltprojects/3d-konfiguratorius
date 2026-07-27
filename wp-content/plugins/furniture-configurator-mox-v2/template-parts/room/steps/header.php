<?php
global $stepsListHeading, $furniture_config_v2_template_parts_url;
?>

<div class="top-bar">
    <div class="top-bar-inner">
        <div class="config-progress-bar">
            <?php foreach($stepsListHeading as $index => $data) : ?>
                <?php 
                    $stepIndex = $data['step'];
                    $currentClass = $stepIndex == 1 ? ' current' : ''; 
                ?>

                <button 
                    type="button"
                    data-step="<?php echo $stepIndex; ?>"
                    class="step<?php echo $currentClass; ?>"
                ><?php echo $stepIndex; ?>. <?php echo $data['title']; ?></button>

            <?php endforeach; ?>
        </div>
        <div class="save-data-container">
             <div class="save-data-container-inner">
                <div id="save-message"></div>
                <div class="buttons-list">
                    <?php include $furniture_config_v2_template_parts_url . '/room/config-data/config-save-buttons.php'; ?>
                </div>
            </div>
        </div>
    </div>
</div>