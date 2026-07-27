
<div class="total-container">
    <div class="total-container-inner">
        <p><strong><?php echo __('Total', 'furniture-config'); ?>:</strong> 
            <span class="number">
            <?php if($discount && $discount > 0): ?>
                    <span><?php echo $regular; ?><?php echo $currency_symbol; ?></span>
                    <del>
                        <?php echo $discount; ?><?php echo $currency_symbol; ?>
                    </del>
                <?php else: ?>
                    <span>
                        <?php echo $regular; ?><?php echo $currency_symbol; ?>
                    </span>
            <?php endif; ?>
            </span>
        </p>
    </div>
</div>