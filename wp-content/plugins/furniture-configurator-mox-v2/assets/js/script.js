window.addEventListener('DOMContentLoaded', function() {
    toggleAccordions();
});

function toggleAccordions() {
    const accordions = document.querySelectorAll('.config-accordion:not(.loaded), .theme-accordion');

    accordions.forEach(accordion => {
        accordion.classList.add('loaded');
        const items = accordion.querySelectorAll('.config-accordion-item, .theme-accordion-item');

        items.forEach(item => {
            const button = item.querySelector('button, a');
            button.addEventListener('click', function(e) {
                e.preventDefault();
                if(item.classList.contains('active')) {
                    item.classList.remove('active');
                    return;
                }

                const prevActive = accordion.querySelector('.config-accordion-item.active, .theme-accordion-item.active');
                if(prevActive) {
                    prevActive.classList.remove('active');
                }
                item.classList.add('active');
            });
        });
    });

}

// function expandSettingsContainer() {
//     const buttons = document.querySelectorAll('.load-more-btn-container button:not(.init)');

//     buttons.forEach(button => {
//         button.classList.add('init');
//         const type = button.getAttribute('data-type');
//         const parent = button.closest('.settings-preview-container');

//         button.addEventListener('click', function(e) {
//             e.preventDefault();
//             if(!type) return;

//             parent.classList.add('loading');

//             switch(type) {
//                 case 'settings-gallery': {
//                     initFurnitureConfigGallery(parent);
//                     break;
//                 }
//                 case 'settings-components' : {
//                     initFurnitureConfigComponents(parent);
//                     break;
//                 }
//                 default: {
//                     initFurnitureConfigGallery(parent);
//                 }
//             }
//         });
//     });
// }
    