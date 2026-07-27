<?php $dynamic_component_title = get_the_title($post_id); ?>
<label>
    <input 
        type="radio" 
        id="<?php echo $dynamic_component_title; ?>" 
        name="<?php echo $post_select_name; ?>" 
        value="<?php echo $post_id; ?>"
        <?php 
            echo $selected_product_components && 
                in_array($post_id, array_column($selected_product_components, 'id')) && 
                in_array($parent_id, array_column($selected_product_components, 'parent_id'))? 
                "checked" : 
                ""; 
        ?>
    >
    <?php echo $dynamic_component_title; ?><?php echo $additional_title ?? ''; ?>
</label>