<?php
global $adminStepsListHeading, $furniture_config_v2_template_parts_url;
?>

<div class="top-bar">
    <div class="top-bar-inner">
        <div class="config-progress-bar">
            <?php 
            $stepsNo = 0;
            ?>
            <?php foreach($adminStepsListHeading as $index => $data) : ?>
                <?php 
                    $stepIndex = $data['step'];
                    $stepsNo++;
                    $currentClass = $stepsNo == 1 ? ' current' : ''; 
                ?>

                <button 
                    type="button"
                    data-step="<?php echo $stepIndex; ?>"
                    class="step<?php echo $currentClass; ?>"
                ><?php echo $stepsNo; ?>. <?php echo $data['title']; ?></button>

            <?php endforeach; ?>
        </div>
        <div class="save-data-container">
             <div class="save-data-container-inner">
                <div class="buttons-list">
                    <div class="button-item">
                        <div id="save-message"></div>
                        <button class="styled-button bright" type="button" data-action_type="save-settings">
                            <span class="text"><?php echo __('Save', 'furniture-config'); ?></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>