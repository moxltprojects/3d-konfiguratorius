<?php

add_action('init', 'shortcodes_furniture_config');
function shortcodes_furniture_config() {
    add_shortcode('mox_furniture_default_dimensios', 'mox_furniture_default_dimensios_shortcode');
    add_shortcode('mox_furniture_config', 'mox_furniture_config_shortcode');
}

function mox_furniture_default_dimensios_shortcode()
{
    global $post;
    $product_id = get_the_ID();

    $default_height = 0;

    $default_width = 0;

    $default_depth = 0;

    ob_start();
    ?>

    <div class="default-dimensions">
        <div class="default-dimensions-inner">
            <table>
                <tr>
                    <th><?php echo __( 'Height:', 'furniture-config'); ?></th>
                    <td><?php echo sprintf(__( '%s mm', 'furniture-config'), $default_height); ?></td>
                </tr>
                <tr>
                    <th><?php echo __( 'Width:', 'furniture-config'); ?></th>
                    <td><?php echo sprintf(__( ' %s mm', 'furniture-config'), $default_width); ?></td>
                </tr>
                <tr>
                    <th><?php echo __( 'Depth:', 'furniture-config'); ?></th>
                    <td><?php echo sprintf(__( '%s mm', 'furniture-config'), $default_depth); ?></td>
                </tr>
            </table>
        </div>
    </div>

    <?php
    return ob_get_clean();
}

function mox_furniture_config_shortcode()
{
    global $post;

    $product_id = get_the_ID();
    $user_id = get_current_user_id();
    $user_id = $user_id == 0 ? null : $user_id;

    ob_start();
    ?>

    <?php include __DIR__ .'/template-parts/index.php'; ?>
    
    <?php
    return ob_get_clean();
}
