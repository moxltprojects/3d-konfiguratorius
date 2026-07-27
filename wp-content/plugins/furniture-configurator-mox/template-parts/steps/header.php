<?php 

global $steps_header_data;

?>

<div class="top-bar">
    <div class="top-bar-inner">
        <div class="config-progress-bar">
            <?php foreach($steps_header_data as $index => $data) : ?>
                <?php 
                    $step_index = $data['step'];
                    $is_current_class = $step_index == $init_progress_step ? ' current' : ''; 
                ?>

                <button 
                    type="button"
                    data-step="<?php echo $step_index; ?>"
                    class="step<?php echo $is_current_class; ?>"
                ><?php echo $step_index; ?>. <?php echo $data['title']; ?></button>

            <?php endforeach; ?>
        </div>
        <div class="save-data-container">
             <div class="save-data-container-inner">
                <div id="save-message"></div>
                  <button class="styled-button bright" type="button" data-action_type="save-settings">
                    <span class="text"><?php echo __('Save', 'furniture-config'); ?></span>
                </button>
            </div>
        </div>
    </div>
</div>