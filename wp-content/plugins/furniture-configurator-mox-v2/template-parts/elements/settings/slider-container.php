
<div 
    class="list-container dimension-container" 
    data-dimension_type="<?php echo $dimension_type; ?>" 
    data-furniture_type="<?php echo $type ?? null; ?>" 
>
    <div class="dimension-container-inner">
        <h3><?php echo $heading; ?></h3>
        <div class="input-container">
            <input 
                type="number" 
                name="<?php echo $dimension_type; ?>" 
                value="<?php echo $standard; ?>" 
                min="<?php echo $min; ?>" 
                max="<?php echo $max; ?>" 
            />
            <span class="unit"><?php echo isset($unit) ? $unit : 'mm' ?></span>
        </div>

        <div class="slider-container">
            <input 
                type="range" 
                id="<?php echo $dimension_type; ?>" 
                name="<?php echo $dimension_type; ?>"
                value="<?php echo $standard; ?>"  
                min="<?php echo $min; ?>" 
                max="<?php echo $max; ?>" 
            />
        </div>
    </div>
</div>