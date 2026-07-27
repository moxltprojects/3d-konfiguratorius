 <?php foreach($defaultTexturesCategories as $textureCategory): ?>
    <?php 
        $catSlug = $textureCategory->slug;
        $texturesSubcategories = $textureCategory->subcategories ?? [];
    ?>
    <?php foreach($texturesSubcategories as $texturesSubcategory): ?>
        <?php 
            $galleries = is_callable($texturesSubcategory->galleries)
                ? ($texturesSubcategory->galleries)()
                : null;
            if(empty($galleries)) continue;

            $subcatSlug = $texturesSubcategory->type_slug;

            $image1Src = $galleries[$imageSlug]['url'] ?? null;

        ?>
            <?php 
                if(!$image1Src) continue;
            ?>

            <img src="<?php echo $image1Src; ?>" data-cat_slug="<?php echo $catSlug; ?>_<?php echo $subcatSlug; ?>" />

    <?php endforeach; ?>
<?php endforeach; ?>