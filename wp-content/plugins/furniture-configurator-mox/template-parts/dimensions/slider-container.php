
<div class="list-container dimension-container" data-dimension_type="<?php echo $dimension_type; ?>" data-type="<?php echo $type; ?>" data-constant_name="<?php echo $constant_name; ?>">
    <div class="dimension-container-inner">
        <h3><?php echo $heading; ?></h3>
        <div class="input-container">
            <input 
                type="number" 
                name="<?php echo $type; ?>" 
                value="<?php echo $standard; ?>" 
                min="<?php echo $min; ?>" 
                max="<?php echo $max; ?>" 
            />
            <span class="unit">mm</span>
        </div>

        <div class="slider-container">
            <input 
                type="range" 
                id="<?php echo $type; ?>" 
                name="<?php echo $type; ?>"
                value="<?php echo $standard; ?>"  
                min="<?php echo $min; ?>" 
                max="<?php echo $max; ?>" 
            />
            <!-- <div class="full-track"></div>
            <div class="active-track"></div>
            <div class="handler"></div>
            <div class="bookmark"></div> -->
        </div>
    </div>
</div>