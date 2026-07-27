<?php 
$textureCategoriesMoreThenOne = count($textureTypes) > 1;
?>

<div class="settings-configurator-heading">
    <?php if($textureCategoriesMoreThenOne) : ?>
        <button class="prev" data-type="prev" disabled><span></span></button>
    <?php endif; ?>

    <div class="list">
        <?php
            $catIndex = 0; 
        ?>
        <?php foreach($textureTypes as $item) : ?>
            <?php 
                $itemId = $item->term_id;
                $itemSlug = $item->slug;
                $itemName = $item->name;
                $activeCatClass = $catIndex === 0 ? ' active' : '';
                $catIndex++;
            ?>
            <h3 class="heading<?php echo $activeCatClass; ?>" data-id="<?php echo $itemId; ?>"  data-slug="<?php echo $itemSlug; ?>"><?php echo $itemName ; ?></h3>
        <?php endforeach; ?>
    </div>

     <?php if($textureCategoriesMoreThenOne) : ?>
        <button class="next" data-type="next"><span></span></button>
    <?php endif; ?>
</div>
