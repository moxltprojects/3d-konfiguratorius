<?php 
$post_select_name = 'material_'. $parent_id;
?>

<div class="children materials-list">
<?php foreach($material_list as $post_id) : ?>
    <?php 
        $dynamic_component_title = get_the_title($post_id); 
    ?>
    <?php include $furniture_parts_template_parts_url .'/product/settings-sections/dynamic-components/radio-label.php'; ?>
    </label>
<?php endforeach; ?>
</div>