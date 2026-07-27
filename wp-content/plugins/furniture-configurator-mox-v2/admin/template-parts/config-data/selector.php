<?php 
if(!$userId) return;
?>

<div class="configurator-selector">
    <div class="configurator-selector-inner">
        <label><?php echo __('Select saved configurator', 'furniture-config'); ?>: </label>
        <select>
            <option value=""><?php echo __('Select', 'furniture-config'); ?></option>
            <?php foreach($savedConfigs as $savedConfig) : ?>
                <?php
                    $id = $savedConfig->id;
                    $selected = isset($currentConfigId) && $currentConfigId == $id ? " selected='selected'" : ""; 
                ?>
                <option value="<?php echo $id; ?>"<?php echo $selected; ?>>
                    <?php echo $id; ?>
                </option>
            <?php endforeach; ?>
        </select>
    </div>
</div>