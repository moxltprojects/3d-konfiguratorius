
<div class="config-furniture-shortcode">
    <div class="config-furniture-shortcode-inner">
        <div class="config-loader-container">
            <span class="loader"></span>
        </div>
    </div>
</div>
<script>
    window.addEventListener('DOMContentLoaded', async function() {
        await initFurnitureConfig("<?php echo $product_id; ?>", "<?php echo $user_id; ?>");
    });
</script>