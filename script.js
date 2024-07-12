document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const loadMoreButton = document.getElementById('load-more-button');
    const themeSwitch = document.getElementById('theme-switch');
    const searchInput = document.getElementById('search-input');
    const orientationSelect = document.getElementById('orientation-select');
    const sortSelect = document.getElementById('sort-select');
    const resultsContainer = document.getElementById('results');
    const modeLabel = document.querySelector('.mode-label');
    
    const uploadInput = document.getElementById('upload-input');
    const sizeInput = document.getElementById('size-input');
    const processButton = document.getElementById('process-button');
    const blackWhiteButton = document.getElementById('black-white-button');
    const compressButton = document.getElementById('compress-button');
    const downloadLink = document.getElementById('download-link');
    const imageCanvas = document.getElementById('image-canvas');
    const progress = document.getElementById('progress');
    
    let currentPage = 1;
    let currentQuery = '';
    let currentOrientation = '';
    let currentSort = '';
    let imageFile = null;
    
    searchButton.addEventListener('click', () => {
        currentPage = 1;
        currentQuery = searchInput.value;
        currentOrientation = orientationSelect.value;
        currentSort = sortSelect.value;
        searchImages();
    });

    loadMoreButton.addEventListener('click', () => {
        currentPage++;
        searchImages();
    });

    themeSwitch.addEventListener('change', () => {
        const theme = themeSwitch.checked ? 'dark' : 'light';
        toggleTheme(theme);
    });

    async function searchImages() {
        const images = await fetchImages();
        displayImages(images);
        updateLoadMoreButtonVisibility(images.length > 0);
    }

    async function fetchImages() {
        const apiKey = 'aPfxkW5fvtMijG1w33zVaUeCLylx-Ddj32nRkKxUxFE';
        let url = `https://api.unsplash.com/search/photos?query=${currentQuery}&page=${currentPage}&client_id=${apiKey}&order_by=${currentSort}`;
        if (currentOrientation) {
            url += `&orientation=${currentOrientation}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    }

    function displayImages(images) {
        if (currentPage === 1) {
            resultsContainer.innerHTML = '';
        }
        images.forEach(image => {
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('image-container');
            const img = document.createElement('img');
            img.src = image.urls.regular;
            img.alt = image.alt_description;
            img.classList.add('result-image');
            img.addEventListener('click', () => {
                window.open(image.links.html, '_blank');
            });
            const downloadButton = document.createElement('a');
            downloadButton.href = image.links.download;
            downloadButton.download = '';
            downloadButton.textContent = 'Download';
            downloadButton.classList.add('download-button');
            downloadButton.addEventListener('click', (event) => {
                event.stopPropagation();
            });
            imgContainer.appendChild(img);
            imgContainer.appendChild(downloadButton);
            resultsContainer.appendChild(imgContainer);
        });
    }

    function updateLoadMoreButtonVisibility(hasResults) {
        loadMoreButton.style.display = hasResults ? 'block' : 'none';
    }

    function toggleTheme(theme) {
        document.body.dataset.theme = theme;
        modeLabel.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
    }

    uploadInput.addEventListener('change', (event) => {
        imageFile = event.target.files[0];
    });

    processButton.addEventListener('click', async () => {
        if (imageFile && sizeInput.value) {
            showProgress(true);
            const newSize = parseInt(sizeInput.value, 10);
            await resizeImage(imageFile, newSize);
            showProgress(false);
        }
    });

    blackWhiteButton.addEventListener('click', async () => {
        if (imageFile) {
            showProgress(true);
            await convertToBlackAndWhite(imageFile);
            showProgress(false);
        }
    });

    compressButton.addEventListener('click', async () => {
        if (imageFile) {
            showProgress(true);
            await compressImage(imageFile);
            showProgress(false);
        }
    });

    function showProgress(show) {
        progress.style.display = show ? 'block' : 'none';
    }

    async function resizeImage(file, size) {
        const img = await loadImage(file);
        const canvas = imageCanvas;
        const ctx = canvas.getContext('2d');
        canvas.width = size;
        canvas.height = size * (img.height / img.width);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const resizedImage = canvas.toDataURL('image/png');
        downloadLink.href = resizedImage;
        downloadLink.style.display = 'block';
    }

    async function convertToBlackAndWhite(file) {
        const img = await loadImage(file);
        const canvas = imageCanvas;
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
            imageData.data[i] = avg;
            imageData.data[i + 1] = avg;
            imageData.data[i + 2] = avg;
        }
        ctx.putImageData(imageData, 0, 0);
        const bwImage = canvas.toDataURL('image/png');
        downloadLink.href = bwImage;
        downloadLink.style.display = 'block';
    }

    async function compressImage(file) {
        const img = await loadImage(file);
        const canvas = imageCanvas;
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const compressedImage = canvas.toDataURL('image/jpeg', 0.5);
        downloadLink.href = compressedImage;
        downloadLink.style.display = 'block';
    }

    function loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.src = event.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
});
