<?php
    $current_class = isset($current_button) ? ' current' : '';
?>

<button type="button" data-type="<?php echo $type; ?>" <?php echo $current_class; ?>>
    <div class="image-block">
        <?php echo $image; ?>
    </div>
    <div><?php echo $title; ?></div>
</button>