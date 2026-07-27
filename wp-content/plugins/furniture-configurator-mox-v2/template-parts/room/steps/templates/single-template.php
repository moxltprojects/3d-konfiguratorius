<?php 
global $furniture_config_v2_plugin_url, $WALL_SINGLE, $WALL_SINGLE_TITLE, $WALL_DOUBLE, $WALL_DOUBLE_TITLE;
$post_id = get_the_ID();

$templateRoomTypes = get_field('available_room_types', $post_id);
$selectedTemplate = $currentTemplatePostId == $post_id;

?>

<div class="single-template<?php echo $selectedTemplate ? ' selected' : ''; ?>">
    <div class="single-template-inner">
        <div class="image-container">
            <?php if ( has_post_thumbnail() ) : ?>
                <?php the_post_thumbnail('medium'); ?>
                <?php else: ?>
                <img src="<?php echo $furniture_config_v2_plugin_url .'/assets/images/room/template-placeholder.jpg'; ?>">
            <?php endif; ?>
        </div>
        <div class="main-container">
            <div class="main-container-inner">
                <h3><?php echo esc_html( get_the_title() ); ?></h3>
                <form method="post">
                    <div>
                        <input type="hidden" name="post_id" value="<?php echo $post_id; ?>">
                        <label>Room Layout:
                            <select <?php echo $selectedTemplate ? 'disabled' : ''; ?> name="room_type">
                                <option value="<?php echo $WALL_SINGLE; ?>" <?php echo $selectedTemplate && $currentTemplateRoomType == $WALL_SINGLE ? 'selected="selected"' : ''; ?>>
                                    <?php echo __($WALL_SINGLE_TITLE,'furniture-config'); ?>
                                </option>
                                <option value="<?php echo $WALL_DOUBLE; ?>" <?php echo $selectedTemplate && $currentTemplateRoomType == $WALL_DOUBLE ? 'selected="selected"' : ''; ?>>
                                    <?php echo __($WALL_DOUBLE_TITLE,'furniture-config'); ?>
                                </option>
                            </select>
                        </label>
                    </div>

                    <?php $status = get_post_status(get_the_ID()); ?>

                    <?php if ($status === 'pending') : ?>

                        <button type="button" class="fusion-button button-flat fusion-button-default-size button-default fusion-button-default button-9999 fusion-button-span-no fusion-button-default-type mox-ai-auto-setup-button" data-hover="text_slide_up" aria-label="Step 1: Analyze" fdprocessedid="5cy19" disabled>
                            <div class="awb-button-text-transition  awb-button__hover-content--centered">
                                <span class="fusion-button-text awb-button__text awb-button__text--default"><?php echo __('Coming soon', 'furniture-config'); ?></span>
                                <span class="fusion-button-text awb-button__text awb-button__text--default"><?php echo __('Coming soon', 'furniture-config'); ?></span>
                            </div>
                        </button>

                    <?php elseif ($selectedTemplate) : ?>

                        <button data-action_type="cancel" type="submit" class="fusion-button button-flat fusion-button-default-size button-default fusion-button-default button-9999 fusion-button-span-no fusion-button-default-type mox-ai-auto-setup-button" data-hover="text_slide_up" aria-label="Step 1: Analyze" fdprocessedid="5cy19">
                            <div class="awb-button-text-transition  awb-button__hover-content--centered">
                                <span class="fusion-button-text awb-button__text awb-button__text--default"><?php echo __('Cancel selection', 'furniture-config'); ?></span>
                                <span class="fusion-button-text awb-button__text awb-button__text--default"><?php echo __('Cancel selection', 'furniture-config'); ?></span>
                            </div>
                        </button>

                        <?php else: ?>

                            <button data-action_type="select" type="submit" class="fusion-button button-flat fusion-button-default-size button-default fusion-button-default button-9999 fusion-button-span-no fusion-button-default-type mox-ai-auto-setup-button" data-hover="text_slide_up" aria-label="Step 1: Analyze" fdprocessedid="5cy19">
                                <div class="awb-button-text-transition  awb-button__hover-content--centered">
                                    <span class="fusion-button-text awb-button__text awb-button__text--default"><?php echo __('Select', 'furniture-config'); ?></span>
                                    <span class="fusion-button-text awb-button__text awb-button__text--default"><?php echo __('Select', 'furniture-config'); ?></span>
                                </div>
                            </button>
                        
                    <?php endif; ?>
                </form>
            </div>
        </div>
    </div>
</div>