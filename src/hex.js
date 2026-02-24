$(document).ready(function(){
// CONSTANTS are expressed in a all uppercase //

// Caching some of the jQuery elements
const CANVAS_ELEM = $('#hexCanvas');
const CANVAS_CONTEXT = CANVAS_ELEM[0].getContext('2d');
const GRID_ELEM = $('#hexGrid');

const IMAGE_EXT = '.png';
const TERRAIN_DIR = './terrain/'

const DEBUG = true;

// setup the current hex grid
var $currentHexGrid = $testGrid;

// $varaiables meant to be universal start with $ //
var $colorBackground = $('#showTerrainColors').is(':checked');
var $drawHexBorders = $('#showGridlines').is(':checked');
var $displayCoords = $('#showCoordinates').is(':checked');
var $displayImage = $('#showTerrainImages').is(':checked');
var $coordinatesFont="12px Courier";
var $borderColor="#000";

var $hexesAreBuilt=false
var $selectedHexes=[];

$('input').on('change', function(){
    $colorBackground = $('#showTerrainColors').is(':checked');
    $drawHexBorders = $('#showGridlines').is(':checked');
    $displayCoords = $('#showCoordinates').is(':checked');
    $displayImage = $('#showTerrainImages').is(':checked');
    drawHexGrid($currentHexGrid,20,20);
});

/* ### FUNCTIONS TO DRAW HEX GRIDS AND THEIR COMPONENTS ### */
function drawHexGrid(gridArray, originX = 0, originY = 0) {
    let rows = gridArray.rows;
    let cols = gridArray.columns;

    let canvasOriginX = originX;
    let canvasOriginY = originY;

    let canvasWidth = (cols * ((HEX_WIDTH) * 3 / 4) + HEX_WIDTH/3) + originX;
    let canvasHeight = (rows * HEX_HEIGHT + HEX_HEIGHT/2 + 2) + originY;

    CANVAS_ELEM.attr('width', canvasWidth).attr('height', canvasHeight);

    let currentHexX, currentHexY;
    let currentCoords = [];

    let offsetColumn = false;

    for (let col = 0; col < cols; col++) {
        let tiles = gridArray.tiles.filter(o => o.x == col);
        for (let row = 0; row < rows; row++) {
            let tile = tiles.find(o => o.y == row);
            currentHexX = col * HEX_SIDE + originX;
            if (!offsetColumn) {
                currentHexY = row * HEX_HEIGHT + originY;
            } else {
                currentHexY = row * HEX_HEIGHT + originY + HEX_HEIGHT * 0.5;
            }
            // DEBUG ? console.log(tile) : null
            if(!tile) {
                var terrain = TERRAIN_TYPES['blank'];
            } else {
                var terrain = checkSpecialTerrain(tile);
            currentCoords = [col,row];
            buildHex(currentHexX, currentHexY, terrain, currentCoords);
            }
        }
        offsetColumn = !offsetColumn;
    }
    allHexContainers = $('.hex');
    allSelectionLayer = $('.overlay');
    if(!$hexesAreBuilt) {
        updateListeners()
    }
    $hexesAreBuilt=true;
}

function updateListeners() {
    // ### EVENT LISTENERS FOR HEXES ### //
    allHexContainers.on('click',function (event) {
        hexClickEvent(event,this);
    });
    allHexContainers.attr('draggable','false');
    allHexContainers.on('contextmenu', function(event) {
        event.preventDefault();
        // For custom context menu action.
    });
    var lastOverTime = 0;
    allHexContainers.on('mousemove', function(event) {
        let currentTime = Date.now();
        let timeDiff = currentTime - lastOverTime;
        if (timeDiff >= 20) {
            hex = event.target;
            lastOverTime = currentTime;
            mouseover(getActualClick(event,hex));
        }
    });
    allHexContainers.on('mousedown', function(event) {
        event.preventDefault();
    });        
}


function buildHex(drawHexX, drawHexY, hexTerrain, currentCoords) {
    $colorBackground || $drawHexBorders ? drawHex(drawHexX, drawHexY, hexTerrain) : null;
    $displayCoords ? drawCoordinates(currentCoords,drawHexX,drawHexY) : null;
    let x = currentCoords[0];
    let y = currentCoords[1];
    let image = hexTerrain.image;
    let name = hexTerrain.name;
    let description = hexTerrain.description;
    if($hexesAreBuilt) {
        if($displayImage) {
           $(`#hex_${x}_${y}`)
               .attr('src',TERRAIN_DIR + image + IMAGE_EXT);
        } else {
            $(`#hex_${x}_${y}`)
                .attr('src',TERRAIN_DIR + 'blank' + IMAGE_EXT);
        }
    } else {
        if($displayImage) {
            drawImage(x,y,image,drawHexX,drawHexY)
        } else {
            drawImage(x,y,'blank',drawHexX,drawHexY)
        }
    }
    addOverlay(x,y,drawHexX,drawHexY);
//    addPopover(x,y,name,description)
}
    
//    function addPopover(x,y,name,description) {
//        theTile = $('#hex_' + x + '_' + y);
//        theTile.attr('data-toggle',"popover")
//        theTile.attr('title',name)
//        theTile.attr('data-content',description)
//        theTile.attr('data-placement','top');
//        theTile.attr('data-trigger','focus')
//    }
//
//    var $everyPopover = $('[data-toggle="popover"]');
//
//    function closePopovers() {
//        $everyPopover.popover('hide');
//    }

function checkSpecialTerrain(tile) {
    if('specialTerrain' in tile) {
        return tile.specialTerrain;
    } else {
        var currentHexTerrain = tile.terrain;
        return TERRAIN_TYPES[currentHexTerrain];
    }
    return null;
}

function drawCoordinates(currentCoords,drawHexX,drawHexY) {
	CANVAS_CONTEXT.font = $coordinatesFont;
	CANVAS_CONTEXT.fillStyle = "#000";
	CANVAS_CONTEXT.textAlign = "center";
	CANVAS_CONTEXT.fillText(currentCoords.join(','),
							drawHexX + (HEX_WIDTH / 2) -
							(HEX_WIDTH/4), drawHexY + (HEX_HEIGHT - 5));
}

function drawHex(drawHexX, drawHexY, hexTerrain) {
    // Set the stroke style for drawing the hexagon's outline.
    CANVAS_CONTEXT.strokeStyle = $borderColor;

    // Begin the path for drawing the hexagon.
    CANVAS_CONTEXT.beginPath();

    // Move to the first point of the hexagon.
    CANVAS_CONTEXT.moveTo(drawHexX + HEX_WIDTH - HEX_SIDE, drawHexY);

    // Draw lines to form the hexagon.
    CANVAS_CONTEXT.lineTo(drawHexX + HEX_SIDE, drawHexY);
    CANVAS_CONTEXT.lineTo(drawHexX + HEX_WIDTH, drawHexY + (HEX_HEIGHT / 2));
    CANVAS_CONTEXT.lineTo(drawHexX + HEX_SIDE, drawHexY + HEX_HEIGHT);
    CANVAS_CONTEXT.lineTo(drawHexX + HEX_WIDTH - HEX_SIDE, drawHexY + HEX_HEIGHT);
    CANVAS_CONTEXT.lineTo(drawHexX, drawHexY + (HEX_HEIGHT / 2));

    // Fill the hexagon with the specified color, if provided.
    if ($colorBackground) {
        CANVAS_CONTEXT.fillStyle = hexTerrain.color;
        CANVAS_CONTEXT.fill();
    }

    // Close the path and stroke the hexagon's outline.
    if ($drawHexBorders) {
        CANVAS_CONTEXT.closePath();
        CANVAS_CONTEXT.stroke();
    }
}

function drawImage(x,y,image,xOff,yOff){
    let src = TERRAIN_DIR + image + IMAGE_EXT
    let id = "hex_" + x + '_' + y;
    GRID_ELEM.append(`<img src="${src}" id="${id}" class='_${x + '_' + y} hex' />
`);
    $(`#${id}`)
        .css('left',xOff)
        .css('top',yOff);
    $(`#${id}`)
        .css('width',HEX_WIDTH)
        .css('height',HEX_HEIGHT);
};

function addOverlay (x,y,xOff,yOff){
    let id = 'sel_' + x + '_' + y;
    let image = './assets/Blank2.png';
    let selectionHex = `<img id='${id}' class='_${x + '_' + y} overlay' style='left:${xOff};top:${yOff};height:${HEX_HEIGHT};width:${HEX_WIDTH};z-index=7;' src="${image}" />`; 
    GRID_ELEM.append(selectionHex);
    $(`#${id}`)
        .css('left',xOff)
        .css('top',yOff);
    $(`#${id}`)
        .css('width',HEX_WIDTH)
        .css('height',HEX_HEIGHT);
};

function getActualClick (event,hex) {
    let coordinates = hex.id.split("_").slice(1,3);
    let direction = hexOffset(event);
    let oddOrEven = hex.id.split("_")[1]%2 == 0 ? "even" : "odd"
    let actualClick =addHexes(DIRECTIONAL_NEIGHBORS[oddOrEven][direction],coordinates)
    if(!hexIsInBounds(actualClick)) {
        return null;
    }
    return actualClick;
}

/* ### Click handlers ### */
function hexClickEvent(event,hex) {
    // $selectAction should be 'select', 'toggle' or 'unselect'
    let actualClick = getActualClick(event,hex);
    if(getActualClick == null) {
        return null
    }
    clickAndNeighbors = getHexNeighbors(actualClick);
    switch($('.selectionActionSelect').attr('mapAction')) {
        case "toggle":
            let hexString = actualClick.join('_');
            let currentState = ($selectedHexes.includes(hexString));
            // DEBUG ? console.log(currentState) : null
            for(target of clickAndNeighbors) {
                currentState ? unSelectHex(target.join('_')) : selectHex(target.join('_')); 
            }
            break;
        case "select":
            for(t of clickAndNeighbors) {
                selectHex(t.join('_'));
            }
            break;
        case "unselect":
            for(t of clickAndNeighbors) {
                unSelectHex(t.join('_'));
            }
            break;
        case "information":
            getInfo(actualClick);
    }
}

function getInfo(coordinates) {
    x = coordinates[0];
    y = coordinates[1];
    $currentHexGrid.tiles.find((entry) => {
        if(entry.x == x && entry.y == y) {
            entry = checkSpecialTerrain(entry);
            d = entry.description;
            n = entry.name;
            $('#hex_' + coordinates.join('_')).popover('show');
        }
    });
}

var $selectNeighbors = $('.selectionShapeSelect').attr('neighbors');
$('img[neighbors]').on('click', function() {
    $selectNeighbors = $(this).attr('neighbors');
    $('.imageButton').removeClass('selectionShapeSelect');
    $(this).addClass('selectionShapeSelect');
    // DEBUG ? console.log($selectNeighbors) : null
});

var $selectAction = $('.selectionActionSelect').attr('mapAction');
$('img[mapAction]').add('img + i').on('click', function(){
     let selection = $(this).prop('tagName') == 'I' ? $(this).prev()
        : $(this);
    $selectAction = $(this).attr('mapAction');
    $('img[mapAction]').removeClass('selectionActionSelect');
    $(selection).addClass('selectionActionSelect');
    // DEBUG ? console.log($selectAction) : null
});

function hexOffset(event) {
    var posx = event.offsetX;
    var posy = event.offsetY;
    // --- Apply offset for the map div
    /*    var map = document.getElementById('hexmap');
        posx = posx - map.offsetLeft;
        posy = posy - map.offsetTop;
    */
    let x,y,z;
    x = (posx - (HEX_WIDTH / 2)) / (HEX_WIDTH * 0.75);
    y = (posy - (HEX_HEIGHT / 2)) / HEX_HEIGHT;
    z = -0.5 * x - y;
    y = -0.5 * x + y;
    
    ix = Math.floor(x + 0.5);
    iy = Math.floor(y + 0.5);
    iz = Math.floor(z + 0.5);
    s = ix + iy + iz;
    if (s) {
        abs_dx = Math.abs(ix - x);
        abs_dy = Math.abs(iy - y);
        abs_dz = Math.abs(iz - z);
        if (abs_dx >= abs_dy && abs_dx >= abs_dz) {
            ix -= s;
        } else if (abs_dy >= abs_dx && abs_dy >= abs_dz) {
            iy -= s;
        } else {
            iz -= s;
        }
    }
    // ----------------------------------------------------------------------
    // --- map_x and map_y are the map coordinates of the click
    // ----------------------------------------------------------------------
    map_x = ix;
    map_y = (iy - iz + (1 - ix % 2)) / 2 - 0.5;
    if(map_x == 1 && map_y == -1) { return "NE"}
    if(map_x == 1 && map_y == 0) {return "SE"}
    if(map_x == -1 && map_y == 0) {return "NW"}
    if(map_x == -1 && map_y == 1) {return "SW"}
    return "CENTER";
}

function getHexNeighbors(centralHex) {
    var neighbors = [];
    let goodneighbors = centralHex[0] % 2 === 0 ? EVEN_NEIGHBORS : ODD_NEIGHBORS;  
    for (i of goodneighbors[$selectNeighbors]) {
            thisNeighbor = addHexes(i, centralHex);
            hexIsInBounds(thisNeighbor) ? 
                neighbors.push(addHexes(i, centralHex))
            : null;
    }
    return neighbors;
}


/* Utility Functions */
function hexEquality(hex1,hex2) {
    hex1 = hex1.join('_');
    hex2 = hex2.join('_');
    check = hex1==hex2;
    return check;
}

function hexIsInBounds(theAccusedHex) {
    x = theAccusedHex[0];
    y = theAccusedHex[1];
    if(x >= $testGrid.columns ||
    x < 0 ||
    y >= $testGrid.rows ||
    y < 0) {
        return false
    } else {
        return true
    }
}

function addHexes (hex1,hex2) {
    let sumHex = (
        [
            (Number(hex1[0])+
             Number(hex2[0]))
            ,(Number(hex1[1])+
              Number(hex2[1]))
        ]);
    return sumHex;
}

function selectHex (selectedHex) {
    !typeof(selectedHex,'string') ? selectedHex = selectedHex.join('_') : null
    // DEBUG ? console.log($selectedHexes.includes(selectedHex)) : null
    if($selectedHexes.includes(selectedHex)) {
        return null;
    }
    $(`#sel_${selectedHex}`).addClass('selection');
    $selectedHexes.push(selectedHex);
}

$('#btnSelectNone').on('click',function(){
    unSelectAll();
});

function unSelectAll() {
    // Currently, the implementation is 100% reliant on unSelectHex
    // It pulls a shallow copy of the $selectedHexes array and works through them
    for(hex of $selectedHexes.slice()) {
        unSelectHex(hex);
    }
}

function unSelectHex (selectedHex) {
    !typeof(selectedHex,'string') ? selectedHex = selectedHex.join('_') : null
    if(!$selectedHexes.includes(selectedHex)) {
        return null
    }
    //$selectedHexes.delete(selectedHex)
    hexIndex = $selectedHexes.indexOf(selectedHex);
    // DEBUG ? console.log(hexIndex) : null
    $selectedHexes.splice(hexIndex,1);
    $('#sel_' + selectedHex).removeClass('selection');
}

var $mouseoverTarget = [];
function mouseover(xy) {
    if (xy == null || xy.length == undefined) {
        return false;
    } else if ($mouseoverTarget.toString() == xy.toString()) {
        return true;
    } else {
        unmouseover();
        var target = [xy];
        for (t of getHexNeighbors(xy)) {
            target.push(t);
        }
    }
    for (t of target) {
        // DEBUG ? console.log(t) : null
        $('#sel_' + t.join('_')).addClass('mouseover');
    }
    $mouseoverTarget = xy;
}

function unmouseover() {
    allSelectionLayer.removeClass('mouseover');
}

// Execute code here:
drawHexGrid($currentHexGrid,20,20);
    
});
