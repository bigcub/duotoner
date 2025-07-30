class Duotoner {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.originalImage = document.getElementById('originalImage');
        this.imageInput = document.getElementById('imageInput');
        this.uploadArea = document.getElementById('uploadArea');
        this.controlsSection = document.getElementById('controlsSection');
        this.shadowColorInput = document.getElementById('shadowColor');
        this.highlightColorInput = document.getElementById('highlightColor');
        this.presetGrid = document.getElementById('presetGrid');
        this.resetBtn = document.getElementById('resetBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.swapColorsBtn = document.getElementById('swapColorsBtn');
        
        this.currentImage = null;
        this.currentPreset = null;
        
        this.presets = [
            // Classic Professional
            { name: 'Monochrome', shadow: '#000000', highlight: '#ffffff' },
            { name: 'Sepia', shadow: '#451a03', highlight: '#fef3c7' },
            
            // Blue Family
            { name: 'Navy & Cyan', shadow: '#0f172a', highlight: '#06b6d4' },
            { name: 'Blue & Orange', shadow: '#1e3a8a', highlight: '#fb923c' },
            
            // Purple Family  
            { name: 'Deep Purple & Gold', shadow: '#4b0082', highlight: '#ffd700' },
            { name: 'Violet & Lemon', shadow: '#7c3aed', highlight: '#fef08a' },
            
            // Green Family
            { name: 'Forest & Cream', shadow: '#166534', highlight: '#fef7cd' },
            { name: 'Emerald & Coral', shadow: '#059669', highlight: '#fb7185' },
            
            // Warm Tones
            { name: 'Cherry & Mocha', shadow: '#dc2626', highlight: '#a3a3a3' },
            { name: 'Sunset', shadow: '#ea580c', highlight: '#fef08a' },
            
            // Pink Family
            { name: 'Hot Pink & Purple', shadow: '#8000ff', highlight: '#de00ff' },
            
            // Monochromatic Tones
            { name: 'Blue Shadows', shadow: '#1e3a8a', highlight: '#93c5fd' },
            { name: 'Red Gradients', shadow: '#991b1b', highlight: '#fca5a5' },
            { name: 'Purple Depths', shadow: '#581c87', highlight: '#c084fc' },
            
            // High Contrast
            { name: 'Charcoal & Lime', shadow: '#374151', highlight: '#84cc16' },
            { name: 'Black & Electric Pink', shadow: '#000000', highlight: '#ec4899' }
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createPresets();
    }
    
    setupEventListeners() {
        // File input
        this.imageInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.loadImage(e.target.files[0]);
            }
        });
        
        // Upload area
        this.uploadArea.addEventListener('click', () => {
            this.imageInput.click();
        });
        
        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files[0] && files[0].type.startsWith('image/')) {
                this.loadImage(files[0]);
            }
        });
        
        // Color inputs
        this.shadowColorInput.addEventListener('input', () => {
            this.currentPreset = null;
            this.updatePresetSelection();
            this.applyDuotone();
        });
        
        this.highlightColorInput.addEventListener('input', () => {
            this.currentPreset = null;
            this.updatePresetSelection();
            this.applyDuotone();
        });
        
        // Buttons
        this.resetBtn.addEventListener('click', () => {
            this.reset();
        });
        
        this.downloadBtn.addEventListener('click', () => {
            this.download();
        });
        
        // Swap colors button
        this.swapColorsBtn.addEventListener('click', () => {
            this.swapColors();
        });
    }
    
    createPresets() {
        this.presets.forEach((preset, index) => {
            const presetItem = document.createElement('div');
            presetItem.className = 'preset-item';
            presetItem.style.setProperty('--shadow', preset.shadow);
            presetItem.style.setProperty('--highlight', preset.highlight);
            presetItem.title = preset.name;
            
            presetItem.addEventListener('click', () => {
                this.selectPreset(index);
            });
            
            this.presetGrid.appendChild(presetItem);
        });
    }
    
    selectPreset(index) {
        this.currentPreset = index;
        const preset = this.presets[index];
        
        this.shadowColorInput.value = preset.shadow;
        this.highlightColorInput.value = preset.highlight;
        
        this.updatePresetSelection();
        this.applyDuotone();
    }
    
    updatePresetSelection() {
        const presetItems = this.presetGrid.querySelectorAll('.preset-item');
        presetItems.forEach((item, index) => {
            item.classList.toggle('active', index === this.currentPreset);
        });
    }
    
    swapColors() {
        const shadowValue = this.shadowColorInput.value;
        const highlightValue = this.highlightColorInput.value;
        
        this.shadowColorInput.value = highlightValue;
        this.highlightColorInput.value = shadowValue;
        
        this.currentPreset = null;
        this.updatePresetSelection();
        this.applyDuotone();
    }
    
    loadImage(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.currentImage = img;
                this.setupCanvas();
                this.showControls();
                this.applyDuotone();
            };
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }
    
    setupCanvas() {
        const img = this.currentImage;
        const maxWidth = 600;
        const maxHeight = 500;
        
        let { width, height } = img;
        
        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }
        
        if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.display = 'block';
    }
    
    showControls() {
        this.controlsSection.style.display = 'block';
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    applyDuotone() {
        if (!this.currentImage) return;
        
        const shadowColor = this.hexToRgb(this.shadowColorInput.value);
        const highlightColor = this.hexToRgb(this.highlightColorInput.value);
        
        // Draw original image
        this.ctx.drawImage(this.currentImage, 0, 0, this.canvas.width, this.canvas.height);
        
        // Get image data
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        // Apply duotone effect
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Convert to grayscale using luminance formula
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const normalizedGray = gray / 255;
            
            // Interpolate between shadow and highlight colors
            data[i] = shadowColor.r + (highlightColor.r - shadowColor.r) * normalizedGray;
            data[i + 1] = shadowColor.g + (highlightColor.g - shadowColor.g) * normalizedGray;
            data[i + 2] = shadowColor.b + (highlightColor.b - shadowColor.b) * normalizedGray;
        }
        
        // Put the modified image data back
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    reset() {
        this.currentImage = null;
        this.currentPreset = null;
        this.canvas.style.display = 'none';
        this.controlsSection.style.display = 'none';
        this.imageInput.value = '';
        this.shadowColorInput.value = '#000000';
        this.highlightColorInput.value = '#ffffff';
        this.updatePresetSelection();
    }
    
    download() {
        if (!this.currentImage) return;
        
        // Create a temporary canvas with original image dimensions
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = this.currentImage.width;
        tempCanvas.height = this.currentImage.height;
        
        const shadowColor = this.hexToRgb(this.shadowColorInput.value);
        const highlightColor = this.hexToRgb(this.highlightColorInput.value);
        
        // Draw original image at full resolution
        tempCtx.drawImage(this.currentImage, 0, 0);
        
        // Get image data
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        // Apply duotone effect
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const normalizedGray = gray / 255;
            
            data[i] = shadowColor.r + (highlightColor.r - shadowColor.r) * normalizedGray;
            data[i + 1] = shadowColor.g + (highlightColor.g - shadowColor.g) * normalizedGray;
            data[i + 2] = shadowColor.b + (highlightColor.b - shadowColor.b) * normalizedGray;
        }
        
        tempCtx.putImageData(imageData, 0, 0);
        
        // Download the image
        tempCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'duotone-image.png';
            a.style.display = 'none';
            document.body.appendChild(a);
            
            // Add a small delay to ensure the element is in the DOM
            setTimeout(() => {
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            }, 10);
        }, 'image/png', 1.0);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new Duotoner();
});