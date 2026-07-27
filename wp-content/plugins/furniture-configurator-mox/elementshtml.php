<?php 

function render_step_heading($heading, $body)
{   
    ob_start();
    ?>
    <div class="step-heading">
        <h2><?php echo $heading; ?></h2>
        <p><?php echo $body; ?></p>
    </div>
    <?php
    return ob_get_clean();
}

function render_dimension_input_html($options, $property, $max_value, $furniture_id)
{
    ob_start();
    $default = $options['default'];
    $min = $options['min'];
    $max = $options['max'];
    ?>
    <tr class="property-item">
        <td class="label"><?php echo sprintf(__('Select %s:', 'config-furniture'), $property); ?></td>
        <td>
            <input value="<?php echo $default; ?>" name="<?php echo $property; ?>" min="<?php echo $min; ?>" max="<?php echo $max; ?>" />
            <p class="note">
                <?php echo sprintf(__( 'Minimum value: %s', 'furniture-config'), $min); ?> <?php echo sprintf(__( 'Maximum value: %s', 'furniture-config'), $max); ?>
            </p>
        </td>
    </tr>
    <?php

    return ob_get_clean();
}

function render_decor_html($property, $object)
{
    ob_start();
    $object_id = $object->ID;
    $thumbnail_url = get_the_post_thumbnail_url($object_id, 'thumbnail');
    $name = $object->post_title;
    $property_title = ucfirst($property);
    ?>
    <div class="decor-item" data-type_title="<?php echo $property_title; ?>" data-type="<?php echo $property; ?>">
        <h3 class="heading"><?php echo $property_title; ?></h3>
        <button type="button"> 
            <img src="<?php echo $thumbnail_url; ?>" name="<?php echo $name; ?>"/>
            <h4 class=""><?php echo $name; ?></h4>
        </button>
    </div>
    <?php

    return ob_get_clean();
}

function render_selections($type, $title, $value, $img = null)
{
    ob_start();
    ?>
    <div class="selection-item" data-type="<?php echo $type; ?>">
        <div class="selection-item-inner">
            <h3><?php echo $title; ?>:</h3>
            <div class="value-container">
                <?php if($img): ?>
                    <img src="<?php echo $img; ?>" title="<?php echo $value; ?>" />
                <?php endif; ?>
                <h4><?php echo $value; ?></h4>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

function render_add_to_cart_button(){
	?>

	<button type="button" class="config_add_to_cart_button fusion-button button-flat fusion-button-default-size button-default fusion-button-default button-2 fusion-button-default-span fusion-button-default-type">
		Add to Cart
	</button>

	<?php
}

