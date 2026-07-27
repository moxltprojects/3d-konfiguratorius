import { 
    FURNITURE_TYPE_BOTTOM,
    FURNITURE_COUNTERTOP,
    DIMENSION_TYPE_DEPTH,
    DIMENSION_TYPE_HEIGHT,
    PRICE_CM_CHUNK,
} from './shared-scripts.js';

export function changeProductsPrices(products, textures, components) {
    let totalRegular = 0;
    let totalDiscount = 0;
    let totalDisplay = 0;

    // products.forEach(product => {
    //     const {prices} = {...JSON.parse(product.getAttribute('data-item_data'))};

    //     const width = parseFloat(product.getAttribute('data-item_width'));
    //     const height = parseFloat(product.getAttribute('data-item_height'));
    //     const depth = parseFloat(product.getAttribute('data-item_depth'));
    //     const { min_width, min_height, min_depth, furniture_type } = JSON.parse(product.getAttribute('data-item_data'));

    //     const {regularTotal, discountTotal, displayTotal} = changeProduct(textures, furniture_type, width, min_width, height, min_height, depth, min_depth, prices, product);

    //     totalRegular += parseFloat(regularTotal);
    //     totalDiscount += parseFloat(discountTotal);
    //     totalDisplay += parseFloat(displayTotal);
    // });
    products.forEach((product, index) => {
        // const {prices} = {...JSON.parse(product.getAttribute('data-item_data'))};

        // const width = parseFloat(product.getAttribute('data-item_width'));
        // const height = parseFloat(product.getAttribute('data-item_height'));
        // const depth = parseFloat(product.getAttribute('data-item_depth'));
        // const { min_width, min_height, min_depth, furniture_type } = JSON.parse(product.getAttribute('data-item_data'));
        const { furniture_type, min_width, min_height, min_depth, db_data} = product;

        const { custom_id, width, height, depth, prices, has_brand_texture} = db_data;

        const {regular_total, discount_total, display_total} = changeProduct(textures, furniture_type, width, min_width, height, min_height, depth, min_depth, prices, has_brand_texture);

        totalRegular += parseFloat(regular_total);
        totalDiscount += parseFloat(discount_total);
        totalDisplay += parseFloat(display_total);

        const tempObj = {...product};
        tempObj.regular_total = regular_total;
        tempObj.discount_total = discount_total;
        tempObj.display_total = display_total;
        products[product, index] = tempObj;
    });

    return {
        regular: totalRegular.toFixed(2),
        discount: totalDiscount.toFixed(2),
        display: totalDisplay.toFixed(2),
    }
}

// export function changeProductsPrices(product, textures, dimensions, components, ) {
export function changeSingleProductPrice(
    furnitureType, 
    width, 
    minWidth,
    height, 
    minHeight,
    depth, 
    minDepth,
    prices, 
    // displayCm3, 
    // regular, 
    // discount, 
    textures, 
    hasBrandTexture,
    components
) {
    const newPrices = changeProduct(textures, furnitureType, width, minWidth, height, minHeight, depth, minDepth, prices, hasBrandTexture);

    return newPrices;
}

function changeProduct(
    textures, 
    furnitureType, 
    width, 
    minWidth, 
    height, 
    minHeight, 
    depth, 
    minDepth, 
    prices, 
    hasBrandTexture,
) {
    let {
        regular, 
        discount, 
        display_cm3: displayCm3,
    } = prices;

    regular = regular ? parseFloat(regular) : 0.00; 
    discount = discount ? parseFloat(discount) : 0.00; 
    const display = discount > 0 ? discount : regular; 
    displayCm3 = displayCm3 ? parseFloat(displayCm3) : 0.00; 

    const texturesTotal = parseFloat(getTexturesPrices(textures, furnitureType, hasBrandTexture));

    let {additionalDimensions, totalDimensions} = getDimensionsCm3(width, minWidth, height, minHeight, depth, minDepth);

    const componentsTotal = 0.00
    const texturesForDimensionsPrice = texturesTotal * totalDimensions;
    totalDimensions = parseFloat(totalDimensions ? totalDimensions : 0).toFixed(2);
    const additionalDimensionsPrice = displayCm3 * additionalDimensions;

    let regularTotal = parseFloat(regular) + texturesForDimensionsPrice + additionalDimensionsPrice;
    regularTotal = parseFloat(regularTotal).toFixed(2);
    let discountTotal = discount && discount > 0 ? discount + texturesForDimensionsPrice + additionalDimensionsPrice : 0;
    discountTotal = parseFloat(discountTotal).toFixed(2);
    let displayTotal = discountTotal > 0 ? discountTotal : regularTotal;
    displayTotal = parseFloat(displayTotal).toFixed(2);
    
    // tempPrices.regular_total = regularTotal;
    // tempPrices.discount_total = discountTotal;
    // tempPrices.display_total = displayTotal;

    // if(product) {
    //     product.setAttribute('data-item_price', JSON.stringify(tempPrices));
    // }

    return {
        // regularTotal,
        // discountTotal,
        // displayTotal,
        // texturesTotal,
        // regularCm3Total: totalDimensions,
        // discountCm3Total: totalDimensions,
        // displayCm3Total: totalDimensions,
        regular_total: regularTotal,
        discount_total: discountTotal,
        display_total: displayTotal,
        total_cm3: totalDimensions,
        display: display,
        regular: regular,
        discount: discount,
        texture: texturesTotal,
        components: componentsTotal,
    }
}

function getTexturesPrices(textures, furnitureType, hasBrandTextures) {
    let totalRegular = 0, totalDiscount = 0, totalDisplay = 0;

    if(!hasBrandTextures) {
        return totalDisplay;
    }

    for (const [key, value] of Object.entries(textures)) {
        if(
            furnitureType !== FURNITURE_TYPE_BOTTOM && key.includes(FURNITURE_COUNTERTOP) &&
            !key.includes(furnitureType)
        ) {
            continue;
        }

        const { regular, discount } = value.prices;
        const regularParsed = parseFloat(regular);
        const discountParsed = parseFloat(discount);

        totalRegular += regularParsed;
        totalDiscount += discountParsed;

        totalDisplay += discountParsed && discountParsed > 0 ? discountParsed : regularParsed;
    }

    return totalDisplay;
}

function getDimensionsCm3(width, minWidth, height, minHeight, depth, minDepth) {
    // const depth = parseInt(dimensions[`${furnitureType}_${DIMENSION_TYPE_DEPTH}`]);
    // const depthMin = parseInt(dimensions[`${furnitureType}_${DIMENSION_TYPE_DEPTH}_min`]);
    let additionalDepth = parseInt(parseInt(depth) - parseInt(minDepth));

    additionalDepth = additionalDepth < 0 ? 0 : additionalDepth;

    let additionalHeight = parseInt(parseInt(height) - parseInt(minHeight));
    additionalHeight = additionalHeight < 0 ? 0 : additionalHeight;

    let additionalWidth = parseInt(parseInt(width) - parseInt(minWidth));
    additionalWidth = additionalWidth < 0 ? 0 : additionalWidth;

    let additionalDimensions = (additionalDepth * additionalHeight * additionalWidth / 1000) / PRICE_CM_CHUNK;
    let totalDimensions = (depth * height * minWidth / 1000) / PRICE_CM_CHUNK;

    return {
        additionalDimensions,
        totalDimensions
    }
}

function getDimensionsCm3Old(dimensions, furnitureType, width, minWidth) {
    const depth = parseInt(dimensions[`${furnitureType}_${DIMENSION_TYPE_DEPTH}`]);
    const depthMin = parseInt(dimensions[`${furnitureType}_${DIMENSION_TYPE_DEPTH}_min`]);
    const additionalDepth = parseInt(depth - depthMin);

    const height = parseInt(dimensions[`${furnitureType}_${DIMENSION_TYPE_HEIGHT}`]);
    const heightMin = parseInt(dimensions[`${furnitureType}_${DIMENSION_TYPE_HEIGHT}_min`]);
    const additionalHeight = parseInt(height - heightMin);

    const additionalWidth = parseInt(parseInt(width) - parseInt(minWidth));
    const additionalDimensions = (additionalDepth * additionalHeight * additionalWidth / 1000) / PRICE_CM_CHUNK;
    const totalDimensions = (depth * height * minWidth / 1000) / PRICE_CM_CHUNK;

    return {
        additionalDimensions,
        totalDimensions
    }
}

export function getDisplayPrice(regular, discount) {
    regular = parseFloat(regular);
    discount = parseFloat(discount);

    const display = discount > 0 ? discount : regular;

    return display;
}

