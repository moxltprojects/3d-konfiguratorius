<?php if($currentConfigId && $currentConfigId != 'null') : ?>
    <div class="button-item">
        <button class="fusion-button button-flat fusion-button-default-size button-default fusion-button-default button-1 fusion-button-default-span fusion-button-default-type fusion-no-small-visibility" type="button" data-action_type="save-settings">
            <span class="text"><?php echo __('Update this configuration', 'furniture-config'); ?></span>
        </button>
    </div>
<?php endif; ?>
<?php $furniture_config_v2_template_parts_url . '/room/config-data/config-save-buttons.php'; ?>
<div class="button-item">
    <button class="fusion-button button-flat fusion-button-default-size button-default fusion-button-default button-1 fusion-button-default-span fusion-button-default-type fusion-no-small-visibility" type="button" data-action_type="create-settings">
        <span class="text"><?php echo __('Save this configuration', 'furniture-config'); ?></span>
    </button>
</div>