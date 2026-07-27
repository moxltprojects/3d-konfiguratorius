const activeClass = "active";

window.addEventListener('load', () => {
    let header = null;
    const searchCanvas = document.querySelector('.search-canvas .awb-off-canvas');
    let intervalIndex = 0;

    const headerInterval = setInterval(() => {
        header = document.querySelector('.fusion-tb-header');
        if(header || intervalIndex === 10) {
            getSearch(header, searchCanvas);
            clearInterval(headerInterval);
        }
        intervalIndex++;
    }, 200);

    document.addEventListener('scroll', () => {
        if(!header) header = document.querySelector('.fusion-tb-header');
        getSearch(header, searchCanvas)
    })

    window.addEventListener('resize', () => {
        if(!header) header = document.querySelector('.fusion-tb-header');
        getSearch(header, searchCanvas)
    })
});

function getSearch(header, searchCanvas) {
    if(!searchCanvas) return;
    const headerMain = header.querySelector('.fusion-fullwidth'); 
    const heightMain = headerMain.offsetHeight;
    searchCanvas.style.top = `${heightMain}px`;
}

function showTab(button, tabId) {
    // Rasti tab elemento konteinerį
    const tabsContainer = button.closest('.tabs');
    
    // Pašalinti active klasę nuo visų mygtukai
    const buttons = tabsContainer.querySelectorAll('.tab-button');
    buttons.forEach(btn => {
        btn.classList.remove('active')
        btn.parentElement.classList.remove('active-btn')
    });
    
    // Pridėti active klasę paspaudžiamam mygtukui
    button.classList.add('active');
    button.parentElement.classList.add('active-btn');

    // Paslėpti visus tab turinius
    const contents = tabsContainer.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));
    
    // Rodyti pasirinktą tab turinį
    document.getElementById(tabId).classList.add('active');
}


function showMoreContent(button, tabId) {
    const tabContent = document.getElementById(tabId);
    const tabContentBox = tabContent.querySelector('.tab-content-box');

    if (tabContentBox.classList.contains('show-content')) {
        tabContentBox.classList.remove('show-content');
        button.querySelectorAll('.fusion-button-text').forEach(text => {
            text.textContent = 'Read more';
        });
    } else {
        tabContentBox.classList.add('show-content');
        button.querySelectorAll('.fusion-button-text').forEach(text => {
            text.textContent = 'Hide';
        });
    }
}
