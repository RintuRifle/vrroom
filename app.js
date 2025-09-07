// VR Museum Gallery - Main Application Logic

// Museum artworks data
const museumData = {
    "museum_artworks": [
        {
            "id": "starry-night",
            "title": "",
            "artist": "Gravitational Force",
            "year": "",
            "description": "Every mass attracts every other mass with a force proportional to the product of their masses and inversely proportional to the square of the distance between them.",
            "image_url": "assets/grty.png",
            "wall_position": "north",
            "frame_size": "large"
        },
        {
            "id": "mona-lisa",
            "title": "",
            "artist": "Laws of motion & gravity",
            "year": "",
            "description": "1.First Law (Law of Inertia)\nSecond Law (Force and Acceleration)(F = m·a)\n3.Third Law (Action–Reaction)",
            "image_url": "assets/phy1.jpg",
            "wall_position": "east",
            "frame_size": "medium"
        },
        {
            "id": "great-wave",
            "title": "",
            "artist": "Isaac Newton",
            "year": "1643 - 1727",
            "description": "Laws of motion & gravity",
            "image_url": "assets/is.jpg",
            "wall_position": "south",
            "frame_size": "large"
        },
        {
            "id": "girl-with-pearl",
            "title": "",
            "artist": "BLACK HOLE",
            "year": "",
            "description": "Super dense regions in space where gravity is so strong that not even light can escape.",
            "image_url": "assets/bk.jpg",
            "wall_position": "west",
            "frame_size": "medium"
        },
        {
            "id": "scream",
            "title": "",
            "artist": "Jupiter",
            "year": "1893",
            "description": "Jupiter is largest planet in our solar system",
            "image_url": "assets/jp.jpg",
            "wall_position": "north",
            "frame_size": "medium"
        },
        {
            "id": "american-gothic",
            "title": "",
            "artist": "Water cycle",
            "year": "",
            "description": "Process where water evaporates , forms clouds (condensation), falls as rain (precipitation), and flows back to rivers & oceans  (collection).",
            "image_url": "assets/wc.jpg",
            "wall_position": "east",
            "frame_size": "small"
        }
    ]
};

// Global variables
let scene;
let artworksContainer;
let camera;
let isVRActive = false;
let currentDescriptionTimeout;
let hoveredArtwork = null;

// Wall positions configuration
const wallConfigs = {
    north: { position: [0, 2, -7], rotation: [0, 0, 0] },
    south: { position: [0, 2, 7], rotation: [0, 180, 0] },
    east: { position: [9, 2, 0], rotation: [0, -90, 0] },
    west: { position: [-9, 2, 0], rotation: [0, 90, 0] }
};

// Frame size configurations
const frameSizes = {
    small: { width: 1.5, height: 1.2, frameWidth: 1.7, frameHeight: 1.4 },
    medium: { width: 2.0, height: 1.5, frameWidth: 2.2, frameHeight: 1.7 },
    large: { width: 2.5, height: 1.8, frameWidth: 2.7, frameHeight: 2.0 }
};

// Global function for button onclick
window.startGalleryExperience = function() {
    console.log('Starting gallery experience...');
    enterGallery();
};

// Initialize the VR museum experience
function enterGallery() {
    console.log('Entering VR museum gallery...');
    
    // Show loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
    
    // Hide UI overlay
    const uiOverlay = document.getElementById('ui-overlay');
    if (uiOverlay) {
        uiOverlay.classList.add('hidden');
    }
    
    // Initialize the scene after a short delay
    setTimeout(() => {
        initializeGallery();
        // Hide loading overlay
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }, 1000);
}

function initializeGallery() {
    console.log('Initializing museum gallery...');
    
    // Get scene references
    scene = document.querySelector('#museum-scene');
    artworksContainer = document.querySelector('#artworks-container');
    camera = document.querySelector('#main-camera');
    
    if (!scene || !artworksContainer || !camera) {
        console.error('Scene elements not found');
        return;
    }
    
    // Wait for scene to be ready
    if (!scene.hasLoaded) {
        scene.addEventListener('loaded', () => {
            createArtworks();
            setupInteractions();
            hideWelcomePanel();
        });
    } else {
        createArtworks();
        setupInteractions();
        hideWelcomePanel();
    }
    
    console.log('Museum gallery initialized successfully');
}

function createArtworks() {
    console.log('Creating museum artworks...');
    
    // Group artworks by wall
    const artworksByWall = {};
    museumData.museum_artworks.forEach(artwork => {
        if (!artworksByWall[artwork.wall_position]) {
            artworksByWall[artwork.wall_position] = [];
        }
        artworksByWall[artwork.wall_position].push(artwork);
    });
    
    // Create artworks for each wall
    Object.keys(artworksByWall).forEach(wallName => {
        const artworks = artworksByWall[wallName];
        const wallConfig = wallConfigs[wallName];
        
        if (!wallConfig) return;
        
        // Calculate spacing for artworks on this wall
        const spacing = calculateArtworkSpacing(artworks.length, wallName);
        
        artworks.forEach((artwork, index) => {
            createArtworkEntity(artwork, wallConfig, index, spacing);
        });
    });
    
    console.log(`Created ${museumData.museum_artworks.length} artworks`);
}

function calculateArtworkSpacing(count, wallName) {
    const wallWidth = (wallName === 'north' || wallName === 'south') ? 16 : 12;
    const spacing = wallWidth / (count + 1);
    return { spacing, wallWidth };
}

function createArtworkEntity(artworkData, wallConfig, index, spacingInfo) {
    const frameSize = frameSizes[artworkData.frame_size];
    const { spacing } = spacingInfo;
    
    // Calculate position on wall
    let xOffset = 0;
    let zOffset = 0;
    
    const wallName = artworkData.wall_position;
    if (wallName === 'north' || wallName === 'south') {
        xOffset = (spacing * (index + 1)) - (spacingInfo.wallWidth / 2);
    } else {
        zOffset = (spacing * (index + 1)) - (spacingInfo.wallWidth / 2);
    }
    
    // Create main artwork container
    const artworkEntity = document.createElement('a-entity');
    artworkEntity.setAttribute('id', `artwork-${artworkData.id}`);
    artworkEntity.classList.add('interactive', 'artwork-entity');
    
    // Position based on wall
    const finalPosition = [
        wallConfig.position[0] + xOffset,
        wallConfig.position[1],
        wallConfig.position[2] + zOffset
    ];
    
    artworkEntity.setAttribute('position', finalPosition.join(' '));
    artworkEntity.setAttribute('rotation', wallConfig.rotation.join(' '));
    
    // Create frame
    const frame = document.createElement('a-box');
    frame.setAttribute('width', frameSize.frameWidth);
    frame.setAttribute('height', frameSize.frameHeight);
    frame.setAttribute('depth', '0.1');
    frame.setAttribute('color', '#8B4513');
    frame.setAttribute('material', 'roughness: 0.8; metalness: 0.1');
    frame.setAttribute('position', '0 0 0');
    
    // Create artwork plane with color
    const artworkPlane = document.createElement('a-plane');
    artworkPlane.setAttribute('width', frameSize.width);
    artworkPlane.setAttribute('height', frameSize.height);
    artworkPlane.setAttribute('position', '0 0 0.06');
    artworkPlane.setAttribute('material', `src: ${artworkData.image_url}; roughness: 0.1;`);
    
    // Add artwork title on the artwork itself
    const artworkTitle = document.createElement('a-text');
    artworkTitle.setAttribute('value', artworkData.title);
    artworkTitle.setAttribute('align', 'center');
    artworkTitle.setAttribute('width', '6');
    artworkTitle.setAttribute('color', '#ffffff');
    artworkTitle.setAttribute('position', '0 0 0.07');
    artworkTitle.setAttribute('font', 'roboto');
    
    // Create museum label
    const label = document.createElement('a-plane');
    label.setAttribute('width', '2');
    label.setAttribute('height', '0.4');
    label.setAttribute('color', '#ffffff');
    label.setAttribute('position', `0 ${-frameSize.frameHeight/2 - 0.4} 0.02`);
    label.setAttribute('material', 'roughness: 0.9');
    
    const labelText = document.createElement('a-text');
    labelText.setAttribute('value', `${artworkData.title}\n${artworkData.artist}, ${artworkData.year}`);
    labelText.setAttribute('align', 'center');
    labelText.setAttribute('width', '6');
    labelText.setAttribute('color', '#000000');
    labelText.setAttribute('position', '0 0 0.01');
    labelText.setAttribute('font', 'roboto');
    
    // Store artwork data for interactions
    artworkEntity.setAttribute('data-artwork', JSON.stringify(artworkData));
    
    // Assemble the artwork
    label.appendChild(labelText);
    artworkEntity.appendChild(frame);
    artworkEntity.appendChild(artworkPlane);
    artworkEntity.appendChild(artworkTitle);
    artworkEntity.appendChild(label);
    
    artworksContainer.appendChild(artworkEntity);
}

function getArtworkColor(artworkId) {
    const colors = {
        'starry-night': '#1e40af',
        'mona-lisa': '#8b5a3c',
        'great-wave': '#0ea5e9',
        'girl-with-pearl': '#7c3aed',
        'scream': '#dc2626',
        'american-gothic': '#059669'
    };
    return colors[artworkId] || '#6b7280';
}

function hideWelcomePanel() {
    setTimeout(() => {
        const welcomePanel = document.querySelector('#welcome-panel');
        if (welcomePanel) {
            welcomePanel.setAttribute('animation', 'property: opacity; to: 0; dur: 1000');
            setTimeout(() => {
                welcomePanel.setAttribute('visible', 'false');
            }, 1000);
        }
    }, 3000);
}

function setupInteractions() {
    console.log('Setting up artwork interactions...');
    
    if (camera) {
        camera.setAttribute('raycaster', 'objects: .interactive; far: 20');
        
        // Listen for intersection events on the camera
        camera.addEventListener('raycaster-intersection', function(evt) {
            if (evt.detail && evt.detail.els && evt.detail.els.length > 0) {
                const intersectedEl = evt.detail.els[0];
                if (intersectedEl && intersectedEl.classList.contains('artwork-entity')) {
                    handleArtworkHover(intersectedEl);
                }
            }
        });
        
        camera.addEventListener('raycaster-intersection-cleared', function(evt) {
            if (evt.detail && evt.detail.el) {
                const clearedEl = evt.detail.el;
                if (clearedEl && clearedEl.classList.contains('artwork-entity')) {
                    handleArtworkUnhover(clearedEl);
                }
            }
        });
    }
    
    // Click interaction
    document.addEventListener('click', function(evt) {
        if (hoveredArtwork) {
            showArtworkDescription(hoveredArtwork);
        }
    });
    
    // Cursor interactions
    const cursor = document.querySelector('#main-cursor');
    if (cursor) {
        cursor.addEventListener('click', function(evt) {
            if (hoveredArtwork) {
                showArtworkDescription(hoveredArtwork);
            }
        });
        
        cursor.addEventListener('fusing', function(evt) {
            if (hoveredArtwork) {
                cursor.setAttribute('material', 'color: #ff6b6b');
            }
        });
        
        cursor.addEventListener('fusecomplete', function(evt) {
            if (hoveredArtwork) {
                showArtworkDescription(hoveredArtwork);
                cursor.setAttribute('material', 'color: #32a085');
            }
        });
    }
    
    console.log('Interactions set up successfully');
}

function handleArtworkHover(artworkElement) {
    if (hoveredArtwork === artworkElement) return;
    
    hoveredArtwork = artworkElement;
    console.log('Hovering over artwork:', artworkElement.id);
    
    // Scale up the artwork
    artworkElement.setAttribute('animation', 'property: scale; to: 1.05 1.05 1.05; dur: 200');
    
    // Change cursor color
    const cursor = document.querySelector('#main-cursor');
    if (cursor) {
        cursor.setAttribute('material', 'color: #ff6b6b');
        cursor.setAttribute('animation', 'property: scale; to: 1.2 1.2 1.2; dur: 200');
    }
}

function handleArtworkUnhover(artworkElement) {
    if (hoveredArtwork !== artworkElement) return;
    
    console.log('Un-hovering artwork:', artworkElement.id);
    hoveredArtwork = null;
    
    // Scale back down
    artworkElement.setAttribute('animation', 'property: scale; to: 1 1 1; dur: 200');
    
    // Reset cursor
    const cursor = document.querySelector('#main-cursor');
    if (cursor) {
        cursor.setAttribute('material', 'color: #32a085');
        cursor.setAttribute('animation', 'property: scale; to: 1 1 1; dur: 200');
    }
    
    // Hide description after delay
    if (currentDescriptionTimeout) {
        clearTimeout(currentDescriptionTimeout);
    }
    currentDescriptionTimeout = setTimeout(() => {
        hideArtworkDescription();
    }, 2000);
}

function showArtworkDescription(artworkElement) {
    const artworkDataStr = artworkElement.getAttribute('data-artwork');
    if (!artworkDataStr) return;
    
    const artworkData = JSON.parse(artworkDataStr);
    console.log('Showing description for:', artworkData.title);
    
    // Update description panel content
    const artworkTitle = document.querySelector('#artwork-title');
    const artworkInfo = document.querySelector('#artwork-info');
    const artworkDescription = document.querySelector('#artwork-description');
    const descriptionPanel = document.querySelector('#description-panel');
    
    if (artworkTitle) artworkTitle.setAttribute('value', artworkData.title);
    if (artworkInfo) artworkInfo.setAttribute('value', `${artworkData.artist} • ${artworkData.year}`);
    if (artworkDescription) {
        const wrappedText = wrapText(artworkData.description, 50);
        artworkDescription.setAttribute('value', wrappedText);
    }
    
    // Show panel with animation
    if (descriptionPanel) {
        descriptionPanel.setAttribute('visible', 'true');
        descriptionPanel.setAttribute('animation', 'property: opacity; from: 0; to: 1; dur: 400');
    }
    
    // Clear any hide timeout
    if (currentDescriptionTimeout) {
        clearTimeout(currentDescriptionTimeout);
    }
}

function hideArtworkDescription() {
    const descriptionPanel = document.querySelector('#description-panel');
    if (descriptionPanel && descriptionPanel.getAttribute('visible') === 'true') {
        descriptionPanel.setAttribute('animation', 'property: opacity; from: 1; to: 0; dur: 300');
        setTimeout(() => {
            descriptionPanel.setAttribute('visible', 'false');
        }, 300);
    }
}

function wrapText(text, maxLength) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
        if ((currentLine + word).length <= maxLength) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    });
    
    if (currentLine) lines.push(currentLine);
    return lines.join('\n');
}

function setupVREvents() {
    const sceneEl = document.querySelector('a-scene');
    if (!sceneEl) return;
    
    sceneEl.addEventListener('enter-vr', function() {
        isVRActive = true;
        console.log('Entered VR mode');
    });
    
    sceneEl.addEventListener('exit-vr', function() {
        isVRActive = false;
        console.log('Exited VR mode');
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('Museum gallery DOM loaded');
    
    // Wait for A-Frame to load
    const sceneEl = document.querySelector('a-scene');
    if (sceneEl) {
        if (sceneEl.hasLoaded) {
            setupVREvents();
        } else {
            sceneEl.addEventListener('loaded', setupVREvents);
        }
    }
});

// Additional event listeners for interaction
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        hideArtworkDescription();
    }
    if (e.key === 'Enter' || e.key === ' ') {
        if (hoveredArtwork) {
            showArtworkDescription(hoveredArtwork);
        }
    }
});

// Mobile optimizations
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        if (scene && scene.renderer) {
            scene.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }, 100);
});

// Prevent context menu
document.addEventListener('contextmenu', e => e.preventDefault());

// Handle visibility changes for performance
document.addEventListener('visibilitychange', function() {
    if (scene) {
        if (document.hidden) {
            scene.pause();
        } else {
            scene.play();
        }
    }
});

// Debug export
window.MuseumVR = {
    enterGallery,
    museumData,
    scene,
    showArtworkDescription,
    hideArtworkDescription,
    startGalleryExperience: window.startGalleryExperience
};

console.log('VR Museum Gallery JavaScript loaded successfully');