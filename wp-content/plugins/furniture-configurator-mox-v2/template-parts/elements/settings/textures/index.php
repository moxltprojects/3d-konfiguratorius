<div class="settings-configurator-container">
    <div class="settings-configurator-container-inner">
        <?php include __DIR__ .'/heading.php'; ?>
        <div class="settings-main-content">
            <?php 
                $catIndex = 0;
            ?>
            <?php foreach($textureTypes as $item) : ?>
                <?php 
                    $itemId = $item->term_id;
                    $itemName = $item->name;
                    $activeCatClass = $catIndex === 0 ? ' active' : '';
                    $catIndex++;
                ?>
                <?php include __DIR__ .'/textures-list.php'; ?>
            <?php endforeach; ?>
            <?php if(!isset($productId)): ?>
                <div class="texture-bottom-block">
                    <button class="button continue-config-btn arrow-right-short"><?php echo __('Continue', 'furniture-config'); ?></button>
                    <button class="continue-config-cards"></button>           
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>