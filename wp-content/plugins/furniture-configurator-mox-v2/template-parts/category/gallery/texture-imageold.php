 <?php foreach($defaultTexturesCategories as $textureCategory): ?>
    <?php 
        $texturesSubcategories = $textureCategory->subcategories ?? [];
    ?>
    <?php foreach($texturesSubcategories as $texturesSubcategory): ?>
        <?php 
            $galleries = is_callable($texturesSubcategory->galleries)
                ? ($texturesSubcategory->galleries)()
                : null;

            if(empty($galleries)) continue;

            $typeSlug = $texturesSubcategory->type_slug;

            $image1Src = $galleries['image_1']['url'] ?? null;

        ?>
        <?php if($showSingleImg) : ?> 
            <?php 
                if(!$image1Src) continue;
            ?>
            <img src="<?php echo $image1Src; ?>" />

            <?php else: ?>
                <?php if($image1Src) : ?> 
                    <div class="swiper-slide image-1">
                        <img src="<?php echo $image1Src; ?>" />
                    </div>
                <?php endif; ?>
                <?php 
                    $image2Src = $galleries['image_2']['url'] ?? null;
                ?>
                    <?php if($image2Src) : ?> 
                        <div class="swiper-slide image-2">
                        <img src="<?php echo $image2Src; ?>" />
                    </div>
                <?php endif; ?>
                <?php 
                    $image3Src = $galleries['image_3']['url'] ?? null;
                ?>
                    <?php if($image3Src) : ?> 
                        <div class="swiper-slide image-3">
                        <img src="<?php echo $image3Src; ?>" />
                    </div>
                <?php endif; ?>
        <?php endif; ?>
    <?php endforeach; ?>
<?php endforeach; ?>