//import necessary pacakges. Note, ES6 modules need to be loaded in html and referenced in this js document
import * as THREE from 'three';
import { BoxGeometry, WebGPURenderer } from 'three/webgpu';
import { OrbitControls } from 'OrbitControls';
import * as dat from 'dat.gui'
import { depth } from 'three/webgpu';
import { Evaluator, Operation, OperationGroup, GridMaterial, ADDITION, SUBTRACTION } from 'three-bvh-csg'

//Initialisations

//Scene
const scene = new THREE.Scene();

//Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.setZ(30);

//Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

//Orbit control
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI / 2
controls.maxDistance = 35; //set max zoom out level

//Grid
//scene.add(new THREE.GridHelper(100,20))

//Textures
const gardenTexture = new THREE.TextureLoader().load('sky.jpg');
const brickTexture = new THREE.TextureLoader().load('brick.jpg');
const tilesTexture = new THREE.TextureLoader().load("tiles.jpg");
const grassTexture = new THREE.TextureLoader().load("grass.jpeg")
grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping
grassTexture.repeat.set(10,10)

//Materials
const brickMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
const floorMaterial = new THREE.MeshBasicMaterial({color: 0x3f9b0b, map: grassTexture});
const tilesMaterial_with_texture = new THREE.MeshBasicMaterial({ map: tilesTexture});
const tilesMaterial = new THREE.MeshBasicMaterial();
const windowMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
const brushMat = new THREE.MeshBasicMaterial({color: 0xffc400})
tilesMaterial.side = THREE.DoubleSide;


//Background
scene.background = gardenTexture;

const floor2_geom = new THREE.BufferGeometry()
const vertices_floor = new Float32Array([
  -50, -5, 50, //1 + 4 + 7 + 10
  50, -5, - 50, 
  -50, -5, -50,
  50, -5, 50])

const indices_floor = [
  0, 3, 1,
  1, 2, 0
]

const floor_uvs = new Float32Array([
  1, 0,
  0, 1,
  0, 0,
  1, 1
])

floor2_geom.setAttribute('uv', new THREE.BufferAttribute(floor_uvs, 2))
floor2_geom.setAttribute('position', new THREE.BufferAttribute(vertices_floor, 3));
floor2_geom.setIndex(indices_floor);
floor2_geom.computeVertexNormals();

const floor_v2 = new THREE.Mesh(floor2_geom, floorMaterial)

vertices_floor[1] = vertices_floor[4] = vertices_floor[7] = vertices_floor[10] = 0

scene.add(floor_v2)

//Complex Solid Geometry Variables
let csgEvaluator;

csgEvaluator = new Evaluator();
csgEvaluator.attributes = [ 'position', 'normal' ];
csgEvaluator.useGroups = false;

//Walls
let wallWidthGeom = new THREE.BoxGeometry(2, 2, 2)
let wallDepthGeom = new THREE.BoxGeometry(2, 2, 2)

let wallWidth1 = new Operation(wallWidthGeom, brickMaterial)
let wallWidth2 = new Operation(wallWidthGeom, brickMaterial)
let wallDepth1 = new Operation(wallDepthGeom, brickMaterial)
let wallDepth2 = new Operation(wallDepthGeom, brickMaterial)

//used as reference to edit wall width params while fixing scale at 1 (necessary for CSG ops)
let wallWidth1Decoy = new THREE.Mesh( new THREE.BoxGeometry( wallWidth1.geometry.parameters.width, wallWidth1.geometry.parameters.height, wallWidth1.geometry.parameters.depth ), brickMaterial)
let wallDepth1Decoy = new THREE.Mesh( new THREE.BoxGeometry(wallDepth1.geometry.parameters.width, wallDepth1.geometry.parameters.height, wallDepth1.geometry.parameters.depth), brickMaterial)

wallWidth1Decoy.scale.x = 6
wallWidth1Decoy.scale.y = 2
wallDepth1Decoy.scale.z = 6

scene.add(wallWidth1, wallWidth2, wallDepth1, wallDepth2)

//Window frame
const windowParams = {
  addWindow1: false, //Default state is window not added
  addWindow2: false,
  addWindow3: false
}

//in x plane

let hole_door = new Operation(new THREE.BoxGeometry(1.6, 4.6, wallWidthGeom.depth), brickMaterial);
hole_door.operation = SUBTRACTION;

let frame_x = new Operation( new THREE.BoxGeometry( 2, 1.75, wallWidthGeom.depth), brickMaterial );
frame_x.operation = ADDITION;

let hole_x = new Operation( new THREE.BoxGeometry( 1.9, 1.65, wallWidthGeom.depth), brickMaterial );
hole_x.operation = SUBTRACTION;

let bar1_x = new Operation( new THREE.BoxGeometry( 2, 0.1, 0.1 ), brickMaterial);
bar1_x.operation = ADDITION;

let bar2_x = new Operation( new THREE.BoxGeometry( 0.1, 2, 0.1 ), brickMaterial);
bar2_x.operation = ADDITION;

let windowGroup_x = new OperationGroup();
windowGroup_x.add(hole_x, frame_x, hole_x, bar1_x, bar2_x);

let frame_2x = new Operation( new THREE.BoxGeometry( 2, 1.75, wallWidthGeom.depth), brickMaterial );
frame_2x.operation = ADDITION;

let hole_2x = new Operation( new THREE.BoxGeometry( 1.9, 1.65, wallWidthGeom.depth), brickMaterial );
hole_2x.operation = SUBTRACTION;

let bar1_2x = new Operation( new THREE.BoxGeometry( 2, 0.1, 0.1 ), brickMaterial );
bar1_2x.operation = ADDITION;

let bar2_2x = new Operation( new THREE.BoxGeometry( 0.1, 2, 0.1 ), brickMaterial );
bar2_2x.operation = ADDITION;

let windowGroup_2x = new OperationGroup();
windowGroup_2x.add(frame_2x, hole_2x, bar1_2x, bar2_2x );


//in z plane
let frame_z = new Operation( new THREE.BoxGeometry( wallWidthGeom.depth , 1.75, 2 ), brickMaterial );
frame_z.operation = ADDITION;

let hole_z = new Operation( new THREE.BoxGeometry( wallWidthGeom.depth, 1.65, 1.9 ), brickMaterial );
hole_z.operation = SUBTRACTION;

let bar1_z = new Operation( new THREE.BoxGeometry( 0.1, 0.1, 2 ), brickMaterial );
bar1_z.operation = ADDITION;

let bar2_z = new Operation( new THREE.BoxGeometry( 0.1, 2, 0.1 ), brickMaterial );
bar2_z.operation = ADDITION;

let windowGroup_z = new OperationGroup();
windowGroup_z.add(frame_z, hole_z, bar1_z, bar2_z );

let frame_2z = new Operation( new THREE.BoxGeometry( wallWidthGeom.depth , 1.75, 2 ), brickMaterial );
frame_2z.operation = ADDITION;

let hole_2z = new Operation( new THREE.BoxGeometry( wallWidthGeom.depth, 1.65, 1.9 ), brickMaterial );
hole_2z.operation = SUBTRACTION;

let bar1_2z = new Operation( new THREE.BoxGeometry( 0.1, 0.1, 2 ), brickMaterial );
bar1_2z.operation = ADDITION;

let bar2_2z = new Operation( new THREE.BoxGeometry( 0.1, 2, 0.1 ), brickMaterial );
bar2_2z.operation = ADDITION;

let windowGroup_2z = new OperationGroup();
windowGroup_2z.add(frame_2z, hole_2z, bar1_2z, bar2_2z );

let flatRoofGeom, flatRoof

flatRoofGeom = new THREE.BoxGeometry((wallWidth1.geometry.parameters.width * wallWidth1Decoy.scale.x) + (12 / wallWidth1Decoy.scale.x), 1, wallDepth1.geometry.parameters.depth * wallDepth1Decoy.scale.z)
flatRoof = new THREE.Mesh(flatRoofGeom, tilesMaterial)

flatRoof.position.y = (1.5 * wallDepth1Decoy.scale.y / 2) + flatRoofGeom.parameters.height


scene.add(flatRoof)

let geometry1 = new THREE.BufferGeometry();
let geometry2 = new THREE.BufferGeometry();
let geometry3 = new THREE.BufferGeometry();

  // Slope 1
const vertices_1 = new Float32Array([

  wallWidth1.geometry.parameters.width / 2 + wallDepth1.geometry.parameters.width, wallWidth1.geometry.parameters.height/2, -1*(wallDepth2.geometry.parameters.depth / 2),
  0, wallWidth1.geometry.parameters.height+ 2, -1*(wallDepth2.geometry.parameters.depth / 2),
  wallWidth1.geometry.parameters.width / 2 + wallDepth1.geometry.parameters.width, wallWidth1.geometry.parameters.height/2, wallDepth2.geometry.parameters.depth / 2,
  0, wallWidth1.geometry.parameters.height+ 2, wallDepth2.geometry.parameters.depth / 2,

]);

  //Slope 2
const vertices_2 = new Float32Array([

  -wallWidth1.geometry.parameters.width / 2 - wallDepth1.geometry.parameters.width, wallWidth1.geometry.parameters.height/2, -1*(wallDepth2.geometry.parameters.depth / 2),
  0, wallWidth1.geometry.parameters.height+ 2, -1*(wallDepth2.geometry.parameters.depth / 2),
  -wallWidth1.geometry.parameters.width / 2 - wallDepth1.geometry.parameters.width, wallWidth1.geometry.parameters.height/2, wallDepth2.geometry.parameters.depth / 2,
  0, wallWidth1.geometry.parameters.height+ 2, wallDepth2.geometry.parameters.depth / 2,

])

// End bits
const vertices_3 = new Float32Array([

  // Front triangle
  -wallWidth1.geometry.parameters.width / 2 - wallDepth1.geometry.parameters.width, wallWidth1.geometry.parameters.height/2, -1*(wallDepth2.geometry.parameters.depth / 2),
  wallWidth1.geometry.parameters.width / 2 + wallDepth1.geometry.parameters.width, wallWidth1.geometry.parameters.height/2, -1*(wallDepth2.geometry.parameters.depth / 2),
  0, wallWidth1.geometry.parameters.height+ 2, -1*(wallDepth2.geometry.parameters.depth / 2),
  
  // Back triangle
  -wallWidth1.geometry.parameters.width / 2 - wallDepth1.geometry.parameters.width, wallWidth1.geometry.parameters.height/2, wallDepth2.geometry.parameters.depth / 2,
  wallWidth1.geometry.parameters.width / 2 + wallDepth1.geometry.parameters.width, wallWidth1.geometry.parameters.height/2, wallDepth2.geometry.parameters.depth / 2,
  0, wallWidth1.geometry.parameters.height+ 2, wallDepth2.geometry.parameters.depth / 2,

])

// Indices for drawing order for roof slope 1 and 2
const indices = [
    0, 1, 2,
    2, 3, 1
];
const indices_endBits = [
  0, 1, 2,
  3, 4, 5
]
// UV coordinate mapping for roof slope 1 and 2
const uvs = new Float32Array([
  1, 0,
  1, 1,
  0, 0,
  0, 1
])

geometry1.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
geometry1.setAttribute('position', new THREE.BufferAttribute(vertices_1, 3));
geometry1.setIndex(indices);
geometry1.computeVertexNormals();

geometry2.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
geometry2.setAttribute('position', new THREE.BufferAttribute(vertices_2, 3));
geometry2.setIndex(indices);
geometry2.computeVertexNormals();

geometry3.setAttribute('position', new THREE.BufferAttribute(vertices_3, 3));
geometry3.setIndex(indices_endBits);
geometry3.computeVertexNormals

const slope1 = new THREE.Mesh(geometry1, tilesMaterial);
const slope2 = new THREE.Mesh(geometry2, tilesMaterial);
const endBits = new THREE.Mesh(geometry3, tilesMaterial)

//scene.add(slope1, slope2, endBits);

//Functions

// function updateRoof(){

//   flatRoof.scale.x = wallWidth1Decoy.scale.x / 6
//   flatRoof.scale.z = wallDepth1Decoy.scale.z / 6
//   flatRoof.position.y = flatRoof.geometry.parameters.height/2 + (wallWidth1.scale.y * wallWidth1.geometry.parameters.height/2)
// }

function roofChoice(){
  if (roofOptions.selectedRoofOption == "Flat"){
    scene.remove(slope1, slope2, endBits)
    scene.add(flatRoof)
  }

  else{
    scene.remove(flatRoof)
    scene.add(slope1, slope2, endBits)
  }
}

function updatePrism() {
  const width = (wallWidth1Decoy.scale.x * wallWidth1Decoy.geometry.parameters.width + 2*wallDepth1.geometry.parameters.width)/2;
  const height = (wallWidth1Decoy.scale.y * wallWidth1Decoy.geometry.parameters.height)/2;
  const depth = (wallDepth1Decoy.scale.z * wallDepth1Decoy.geometry.parameters.depth)/2;

  // Update vertex positions here using `width`, `height`, and `depth`.
  // For example, for the first vertex of the front triangle:

  //roof slope 1
  geometry1.attributes.position.setXYZ(0, width, height, -depth); //vertex 2
  geometry1.attributes.position.setXYZ(1, 0, (2*height)+1, -depth) //vertex 3
  geometry1.attributes.position.setXYZ(2, width, height, depth); //vertex 2
  geometry1.attributes.position.setXYZ(3, 0, (2*height)+1, depth) //vertex 3

  geometry1.attributes.position.needsUpdate = true;
  geometry1.computeVertexNormals();

  //roof slope 2
  geometry2.attributes.position.setXYZ(0, -width, height, -depth); //vertex 2
  geometry2.attributes.position.setXYZ(1, 0, (2*height)+1, -depth) //vertex 3
  geometry2.attributes.position.setXYZ(2, -width, height, depth); //vertex 2
  geometry2.attributes.position.setXYZ(3, 0, (2*height)+1, depth) //vertex 3

  geometry2.attributes.position.needsUpdate = true;
  geometry2.computeVertexNormals();

  //endBits
  geometry3.attributes.position.setXYZ(0, width, height, -depth);
  geometry3.attributes.position.setXYZ(1, -width, height, -depth);
  geometry3.attributes.position.setXYZ(2, 0, (2*height)+1, -depth);
  geometry3.attributes.position.setXYZ(3, width, height, depth);
  geometry3.attributes.position.setXYZ(4, -width, height, depth);
  geometry3.attributes.position.setXYZ(5, 0, (2*height)+1, depth);

  geometry3.attributes.position.needsUpdate = true;
  geometry3.computeVertexNormals();
}

function updateFloor(){
  floor2_geom.attributes.position.setY(0,  - wallWidth1.geometry.parameters.height / 2)
  floor2_geom.attributes.position.setY(1, - wallWidth1.geometry.parameters.height /2 )
  floor2_geom.attributes.position.setY(2, - wallWidth1.geometry.parameters.height / 2 )
  floor2_geom.attributes.position.setY(3, - wallWidth1.geometry.parameters.height / 2 )

  floor2_geom.attributes.position.needsUpdate = true;
  floor2_geom.computeVertexNormals()
}

const doorParams = {
  doorParam: false
}



let resultDepth, resultDepth2
let interimBox
interimBox = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), brickMaterial)

function updateWindow1_scale(){

  windowGroup_x.scale.x = interimBox.scale.x
  windowGroup_x.scale.y = interimBox.scale.y

}

let lastScale_x, lastScale_y, lastScale_z

const roofOptions = {
  selectedRoofOption: "Flat"
}

// Function to update the wall colour
function updateColorWalls() {
  // Convert hex to a number for Three.js color
  const colorValue = colorParams.colorWall.replace('#', '0x');
  wallWidth1.material.color.set(parseInt(colorValue, 16));
}

function updateColorRoof() {
  // Convert hex to a number for Three.js color
  const colorValue2 = colorParams.colorRoof.replace('#', '0x');
  slope1.material.color.set(parseInt(colorValue2, 16));
}

const colorParams = {
  colorWall: '#000000', // Hex string for white, initial color
  colorRoof: '#FFFFFF'
};

const interimBox2 = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), brickMaterial)

function updateWindow2_scale(){
  windowGroup_z.scale.z = interimBox2.scale.z
  windowGroup_z.scale.y = interimBox2.scale.y
}

const interimBox3 = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), brickMaterial)

function updateWindow3_scale(){
  windowGroup_2z.scale.z = interimBox3.scale.z
  windowGroup_2z.scale.y = interimBox3.scale.y
}


//User interface

const gui = new dat.GUI()

var folder1 = gui.addFolder("1. Select Shed Size")
var folder2 = gui.addFolder("2. Select Window and Doors")
var folder3 = gui.addFolder("3. Select Roof Type")
var folder4 = gui.addFolder("4. Select Colours")
var folder5 = gui.addFolder("5. Misc Stuff - sort tomorow")

folder1.add(wallWidth1Decoy.scale, "x", 4, 10).name('Shed Width (Metres)')
folder1.add(wallWidth1Decoy.scale, "y", 1.5, 2.5).name('Shed Height (Metres)')
folder1.add(wallDepth1Decoy.scale, "z", 4, 10).name('Shed Depth (Metres)')

folder2.add(windowParams, 'addWindow1').name('Add Window 1')
folder2.add(windowParams, 'addWindow2').name('Add Window 2')
folder2.add(windowParams, 'addWindow3').name('Add Window 3')
folder2.add(doorParams, 'doorParam').name('Add Door')

folder3.add(roofOptions, "selectedRoofOption", ["Flat", "Apex"]).onChange(roofChoice).name("Select Roof Type")

folder4.addColor(colorParams, 'colorWall').name('Colour of Walls').onChange(updateColorWalls);
folder4.addColor(colorParams, 'colorRoof').name('Colour of Roof').onChange(updateColorRoof);

folder5.add(interimBox.scale, "y", 0.5, 1).name('Window1 Height')
folder5.add(interimBox.scale, "x", 0.5, 2).name('Window1 Length')
folder5.add(windowGroup_x.position, "x", -wallWidth1.geometry.parameters.width/2 + hole_x.geometry.parameters.width/2, wallWidth1.geometry.parameters.width/2 - hole_x.geometry.parameters.width/2).name("Window1 Position x")
folder5.add(windowGroup_x.position, "y", -wallWidth1.geometry.parameters.height/2 + hole_x.geometry.parameters.height/2, wallWidth1.geometry.parameters.height/2 - hole_x.geometry.parameters.height/2).name("Window1 Position y")

folder5.add(interimBox2.scale, "y", 0.5, 1).name('Window2 Height')
folder5.add(interimBox2.scale, "z", 0.5, 2).name('Window2 Length')

folder5.add(windowGroup_z.position, "z", -wallDepth1.geometry.parameters.depth/2 + hole_z.geometry.parameters.depth, wallDepth1.geometry.parameters.depth/2 - hole_z.geometry.parameters.depth).name("Window 2 Position x")
folder5.add(windowGroup_z.position, "y", -wallWidth1.geometry.parameters.height/2 + hole_x.geometry.parameters.height/2, wallWidth1.geometry.parameters.height/2 - hole_x.geometry.parameters.height/2).name("Window2 Position y")

folder5.add(interimBox3.scale, "y", 0.5, 1).name('Window3 Height')
folder5.add(interimBox3.scale, "z", 0.5, 2).name('Window3 Length')

folder5.add(windowGroup_2z.position, "z", -wallDepth1.geometry.parameters.depth/2 + hole_z.geometry.parameters.depth, wallDepth1.geometry.parameters.depth/2 - hole_z.geometry.parameters.depth).name("Window 3 Position x")
folder5.add(windowGroup_2z.position, "y", -wallWidth1.geometry.parameters.height/2 + hole_x.geometry.parameters.height/2, wallWidth1.geometry.parameters.height/2 - hole_x.geometry.parameters.height/2).name("Window3 Position y")

///////////////////////Render function//////////////////////////////////////
//ANIMATE FUNCTION
//////////////////

let newWallWidthGeom, newWallDepthGeom

function UpdateMajorGeoms(){
  if (wallWidth1Decoy.scale.x != lastScale_x || wallWidth1Decoy.scale.y != lastScale_y || wallDepth1Decoy.scale.z != lastScale_z){

    updateGeometries()
    
    console.log("a major geometry change has been made")

  }

  //records last value for scales
  lastScale_x = wallWidth1Decoy.scale.x
  lastScale_y = wallWidth1Decoy.scale.y
  lastScale_z = wallDepth1Decoy.scale.z

}

function updateGeometries(){
    //update Wall Geometries whilst maintaining scale of 1
    const newWidth = wallWidth1Decoy.geometry.parameters.width * wallWidth1Decoy.scale.x
    const newHeight = wallWidth1Decoy.geometry.parameters.height * wallWidth1Decoy.scale.y
    const newDepth = wallDepth1Decoy.geometry.parameters.depth * wallDepth1Decoy.scale.z
  
    //dispose of old geometries
    wallWidth1.geometry.dispose()
    wallWidth2.geometry.dispose()
    wallDepth1.geometry.dispose()
    wallDepth2.geometry.dispose()
    flatRoof.geometry.dispose()

    //create new geometries
    wallWidth1.geometry = new THREE.BoxGeometry(newWidth, newHeight, 1)
    wallWidth2.geometry = new THREE.BoxGeometry(newWidth, newHeight, 1)
    wallDepth1.geometry = new THREE.BoxGeometry(1, newHeight, newDepth)
    wallDepth2.geometry = new THREE.BoxGeometry(1, newHeight, newDepth)
    flatRoof.geometry = new THREE.BoxGeometry(newWidth + 2, 1, newDepth)

    //reset scale to 1
    wallWidth1.scale.set(1,1,1)
    wallWidth2.scale.set(1,1,1)
    wallDepth1.scale.set(1,1,1)
    wallDepth2.scale.set(1,1,1)

    //update matrices for all objects
    wallWidth1.updateMatrixWorld(true)
    wallWidth2.updateMatrixWorld(true)
    wallDepth1.updateMatrixWorld(true)
    wallDepth2.updateMatrixWorld(true)
  
}

function updatePositions(){
      //adjust positions based on new dimensions:
      wallDepth1.position.x = (wallWidth1.geometry.parameters.width / 2) * wallWidth1Decoy.scale.x + wallDepth1.geometry.parameters.width / 2
      wallDepth2.position.x = - wallDepth1.position.x
      wallDepth1.position.z = wallDepth2.position.z = (wallWidth2.position.z / 2) //+ wallWidth1.geometry.parameters.depth/2
  
      wallDepth1.position.x = (wallWidth1Decoy.geometry.parameters.width / 2) * wallWidth1Decoy.scale.x + wallDepth1.geometry.parameters.width / 2
      wallDepth2.position.x = - wallDepth1.position.x
      wallDepth1.position.z = wallDepth2.position.z = (wallWidth2.position.z / 2) //+ wallWidth1.geometry.parameters.depth/2
  
      wallWidth1.position.z =  wallDepth1.geometry.parameters.depth / 2 - wallWidth1.geometry.parameters.depth / 2//2.5 - 1 * ((wallDepth1Decoy.geometry.parameters.depth / 2) * wallDepth1Decoy.scale.z) + wallWidth1.geometry.parameters.depth / 2
      wallWidth2.position.z = - 1 * wallWidth1.position.z
    
      wallDepth1.position.z = wallDepth2.position.z = 0

      flatRoof.position.y = (2 * (wallWidth1Decoy.scale.y / 2)) + flatRoofGeom.parameters.height / 2
      
}

let newGeometry, result, csgEvaluator2

function toggleWindow1(){

  if(windowParams.addWindow1 == true){

    scene.remove(wallWidth1)

    // wallWidth1.updateMatrix(true)
    wallWidth1.add(windowGroup_x)
    // wallWidth1.updateMatrixWorld(true)

    //translate position to starting position prior to transform (else it seems to error out)
    wallWidth1.position.z = 3

    if (result){
      console.log("reaches this point")
      scene.remove(result)
      result.geometry.dispose()
      result.material.dispose()
      result.updateMatrixWorld(true)
    }

    //compute CSG transformation
    result = csgEvaluator.evaluateHierarchy(wallWidth1)
    result.updateMatrixWorld(true)
    scene.add(result)

    //set position of the result mesh
    result.position.z =  -3.5 +  6 * wallDepth1Decoy.scale.z / 6

    wallWidth1.geometry.dispose()
    wallWidth1.updateMatrixWorld(true)

  }else{
    wallWidth1.updateMatrixWorld()
    scene.add(wallWidth1)

    if (result){
      scene.remove(result)
      result.geometry.dispose()
      result.material.dispose()
      result.updateMatrixWorld(true)
    }

  }
}

let Depth1result

function toggleWindow2(){

  if(windowParams.addWindow2 == true){

    scene.remove(wallDepth1)

    wallDepth1.add(windowGroup_z)

    //translate position to starting position prior to transform (else it seems to error out)
    wallDepth1.position.x = 3

    if (Depth1result){
      scene.remove(Depth1result)
      Depth1result.geometry.dispose()
      Depth1result.material.dispose()
      Depth1result.updateMatrixWorld(true)
    }

    Depth1result = csgEvaluator.evaluateHierarchy(wallDepth1)
    Depth1result.updateMatrixWorld(true)
    scene.add(Depth1result)

    Depth1result.position.x = -3 + (wallWidth1Decoy.geometry.parameters.width / 2) * wallWidth1Decoy.scale.x + wallDepth1.geometry.parameters.width / 2

    wallDepth1.geometry.dispose()
    wallDepth1.updateMatrixWorld(true)

  }else{
    wallDepth1.updateMatrixWorld()
    scene.add(wallDepth1)

    if (Depth1result){
      scene.remove(Depth1result)
      Depth1result.geometry.dispose()
      Depth1result.material.dispose()
      Depth1result.updateMatrixWorld(true)
    }
  }
}

let Depth2result

function toggleWindow3(){

  if(windowParams.addWindow3 == true){

    scene.remove(wallDepth2)

    wallDepth2.add(windowGroup_2z)

    //translate poisition to starting position prior to transform (else it seems to error out)
    wallDepth2.position.x = 3

    if (Depth2result){
      scene.remove(Depth2result)
      Depth2result.geometry.dispose()
      Depth2result.material.dispose()
      Depth2result.updateMatrixWorld(true)
    }

    Depth2result = csgEvaluator.evaluateHierarchy(wallDepth2)
    Depth2result.updateMatrixWorld(true)
    scene.add(Depth2result)

    Depth2result.position.x = - 4 - (wallWidth1Decoy.geometry.parameters.width / 2) * wallWidth1Decoy.scale.x + wallDepth1.geometry.parameters.width / 2

    wallDepth2.geometry.dispose()
    wallDepth2.updateMatrixWorld(true)

  }else{

    wallDepth2.updateMatrixWorld(true)
    scene.add(wallDepth2)

    if (Depth2result){
      scene.remove(Depth2result)
      Depth2result.geometry.dispose()
      Depth2result.material.dispose()
      Depth2result.updateMatrixWorld(true)
    }

  }
}

let door_side

function toggleDoor(){

  if (doorParams.doorParam == true){

    scene.remove(wallWidth2)

    wallWidth2.updateMatrix(true)
    wallWidth2.add(hole_door)
    wallWidth2.updateMatrixWorld(true)

    if (door_side){
      scene.remove(door_side)
      door_side.geometry.dispose()
      door_side.material.dispose()
      door_side.updateMatrixWorld(true)
    }

    door_side = csgEvaluator.evaluateHierarchy(wallWidth2)
    door_side.updateMatrixWorld(true)
    scene.add(door_side)

    //door_side.position.z =  - 1 * (6 * wallDepth1Decoy.scale.z )

    wallWidth2.geometry.dispose()
    wallWidth2.updateMatrixWorld(true)

    hole_door.position.y = -1.5

    }else{

      wallWidth2.updateMatrixWorld(true)
      scene.add(wallWidth2)

      if (scene.getObjectByName("door_side")){
        scene.remove(door_side)
        door_side.geometry.dispose()
        door_side.material.dispose()
        door_side.parent.remove(door_side)
        door_side.updateMatrixWorld(true)
      }
    }
}

function animate(){

  requestAnimationFrame(animate);

  controls.update();

  UpdateMajorGeoms()
  updatePositions()

  //toggles window on and off
  toggleWindow1()
  toggleWindow2()
  toggleWindow3()
  //toggles door on and off
  toggleDoor()

  updatePrism() //load function which updates apex roof

  updateFloor() //load function which update floor height

  renderer.render(scene, camera);

  //console.log(csgEvaluator)

}

animate()




