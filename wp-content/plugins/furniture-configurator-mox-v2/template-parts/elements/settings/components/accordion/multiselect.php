

<?php foreach ($categoryPosts as $post): ?>
    <?php 
        $id = $post->ID;
        $name = $post->post_title;
    ?>
    <label class="config-label">
        <input 
            type="checkbox" 
            id="<?php echo $name; ?>" 
            name="furniture-components-<?php echo $categoryId; ?>-<?php echo $typeSlug; ?>" 
            value="<?php echo  $id; ?>"
            <?php 
                echo $selected_components && 
                    in_array($id, array_column($selected_components, 'id')) &&
                    in_array($categoryId, array_column($selected_components, 'parent_id')) ? 
                    "checked" : 
                    ""; 
            ?>
        >
        <span class="pseudo-input"></span>
        <?php echo $name; ?>
    </label>
<?php endforeach; ?>

