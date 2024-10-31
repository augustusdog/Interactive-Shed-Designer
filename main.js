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

//Grid
//scene.add(new THREE.GridHelper(100,20))

//Textures
const gardenTexture = new THREE.TextureLoader().load('garden.jpg');
const brickTexture = new THREE.TextureLoader().load('brick.jpg');
const tilesTexture = new THREE.TextureLoader().load("tiles.jpg");
const grassTexture = new THREE.TextureLoader().load("grass.jpeg")

//Materials
const brickMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
const floorMaterial = new THREE.MeshBasicMaterial({color: 0x3f9b0b, map: grassTexture});
const tilesMaterial = new THREE.MeshBasicMaterial({ map: tilesTexture});
const windowMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
const brushMat = new THREE.MeshBasicMaterial({color: 0xffc400})
tilesMaterial.side = THREE.DoubleSide;
const resultGridMat = brushMat.clone();

//Background
scene.background = gardenTexture;

const floor = new THREE.Mesh(new THREE.BoxGeometry(1000,100,1000), floorMaterial)

scene.add(floor)

//Complex Solid Geometry Variables
let csgEvaluator;
let result

csgEvaluator = new Evaluator();
csgEvaluator.attributes = [ 'position', 'normal' ];
csgEvaluator.useGroups = false;

//Walls
let wallWidthGeom = new THREE.BoxGeometry(10, 3, 1)
let wallDepthGeom = new THREE.BoxGeometry(1, 3, 11)

let wallWidth1 = new Operation(wallWidthGeom, brickMaterial)
let wallWidth2 = new Operation(wallWidthGeom, brickMaterial)
let wallDepth1 = new Operation(wallDepthGeom, brickMaterial)
let wallDepth2 = new Operation(wallDepthGeom, brickMaterial)

//Window frame
const windowParams = {
  addWindow1: false, //Default state is window not added
  addWindow2: false,
  addWindow3: false
}

//in x plane

let hole_door = new Operation(new THREE.BoxGeometry(1.6, 2.8, wallWidthGeom.depth), brickMaterial);
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
windowGroup_x.add(frame_x, hole_x, bar1_x, bar2_x );

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

windowGroup_x.position.x = 0
windowGroup_2x.position.x = 3

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

//side2 = new Operation( wallWidthGeom, brickMaterial );

wallWidth2.add(hole_door)

const door_side = csgEvaluator.evaluateHierarchy(wallWidth2)

scene.add(door_side)

//Roof

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

scene.add(slope1, slope2, endBits);

//Functions

function updatePrism() {
  const width = (wallWidth1.scale.x * wallWidth1.geometry.parameters.width + 2*wallDepth1.geometry.parameters.width)/2;
  const height = (wallWidth1.scale.y * wallWidth1.geometry.parameters.height)/2;
  const depth = (wallDepth2.scale.z * wallDepth2.geometry.parameters.depth)/2;

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

let resultDepth, resultDepth2

//function for adding window:
function windowAddition(){
  if (result){
    scene.remove(result)
  }

  if (resultDepth){
    scene.remove(resultDepth)
  }

  if (resultDepth2){
    scene.remove(resultDepth2)
  }

  console.log("addWindow state ", windowParams.addWindow1)
  if (windowParams.addWindow1 == true){

    console.log("WallWidth1 object type ", wallWidth1.constructor.name)

    wallWidth1.add(windowGroup_x)
    //wallWidth1.add(windowGroup_2x)

    //windowGroup_2x.position.z = wallWidth1.position.z + 5

    result = csgEvaluator.evaluateHierarchy(wallWidth1)
    //result = new Operation(interim_result.geometry, brickMaterial)

    console.log("Result object type ", result.constructor.name)
    console.log("geometry ", result.geometry)

    result.material = brickMaterial;
    result.position.z = wallWidth1.position.z
    result.position.z = wallWidth1.position.z + 5 //adjust for result's position being relaive to wallWidth1 (as wallWidth1 pressumably parent after CSG eval)

  }else{
    wallWidth1.remove(windowGroup_x)
    result = wallWidth1
  }

  result.scale.x = wallWidth1.scale.x
  result.scale.y = wallWidth1.scale.y

	scene.add( result );

  if (windowParams.addWindow2 == true){
    wallDepth1.add(windowGroup_z)

    resultDepth = csgEvaluator.evaluateHierarchy(wallDepth1)

    resultDepth.position.x = wallDepth1.position.x
    resultDepth.position.x = wallDepth1.position.x - 5.5

    resultDepth.material = brickMaterial

  }else{
    wallDepth1.remove(windowGroup_z)
    resultDepth = wallDepth1
  }

  resultDepth.scale.z = wallDepth1.scale.z
  resultDepth.scale.y = wallDepth1.scale.y

  scene.add(resultDepth)

  if(windowParams.addWindow3 == true){
    wallDepth2.add(windowGroup_2z)

    resultDepth2 = csgEvaluator.evaluateHierarchy(wallDepth2)

    resultDepth2.position.x = wallDepth2.position.x
    resultDepth2.position.x = wallDepth2.position.x + 5.5

  }else{
      wallDepth2.remove(windowGroup_2z)
      resultDepth2 = wallDepth2
  }

  resultDepth2.scale.z = wallDepth2.scale.z
  resultDepth2.scale.y = wallDepth2.scale.y

  scene.add(resultDepth2)
}

//User interface

const gui = new dat.GUI()

gui.add(wallWidth1.scale, "x", 0.5, 2).name('Scale Shed Width')
gui.add(wallWidth1.scale, "y", 0.5, 2).name('Scale Shed Height')
gui.add(wallDepth1.scale, "z", 0.5, 2).name('Scale Shed Depth')
//gui.add({InterimVar: interimVariable}, "InterimVar", 0, (2*wallWidth1.geometry.parameters.width + 2*wallDepth1.geometry.parameters.depth - 4*wallWidth1.geometry.parameters.depth),0.1).name('Window Location').onChange(setWindowLocation)

const colorParams = {
  color: '#000000' // Hex string for white, initial color
};

// Function to update the wall colour
function updateColor() {
  // Convert hex to a number for Three.js color
  const colorValue = colorParams.color.replace('#', '0x');
  wallWidth1.material.color.set(parseInt(colorValue, 16));
}

// Add a color picker to the GUI
gui.addColor(colorParams, 'color').name('Colour of Walls').onChange(updateColor);

gui.add(windowParams, 'addWindow1').name('Add Window 1')
gui.add(windowParams, 'addWindow2').name('Add Window 2')
gui.add(windowParams, 'addWindow3').name('Add Window 3')

gui.add(windowGroup_x.position, "x", -wallWidth1.geometry.parameters.width/2 + hole_x.geometry.parameters.width/2, wallWidth1.geometry.parameters.width/2 - hole_x.geometry.parameters.width/2).name("Window 1 Position")
gui.add(windowGroup_z.position, "z", -wallDepth1.geometry.parameters.depth/2 + hole_z.geometry.parameters.depth, wallDepth1.geometry.parameters.depth/2 - hole_z.geometry.parameters.depth).name("Window 2 Position")
gui.add(windowGroup_2z.position, "z", -wallDepth1.geometry.parameters.depth/2 + hole_z.geometry.parameters.depth, wallDepth1.geometry.parameters.depth/2 - hole_z.geometry.parameters.depth).name("Window 3 Position")
///////////////////////Render function//////////////////////////////////////
//ANIMATE FUNCTION
//////////////////

function animate(){

  requestAnimationFrame(animate);

  controls.update();
  
  //scaling width
  wallWidth2.scale.x = wallWidth1.scale.x
  wallDepth1.position.x = (wallWidth1.geometry.parameters.width / 2) * wallWidth1.scale.x + wallDepth1.geometry.parameters.width / 2
  wallDepth2.position.x = - wallDepth1.position.x
  wallDepth1.position.z = wallDepth2.position.z = (wallWidth2.position.z / 2) //+ wallWidth1.geometry.parameters.depth/2
  

  //scaling height
  wallWidth2.scale.y = wallDepth1.scale.y = wallDepth2.scale.y = wallWidth1.scale.y;

  //scaling depth
  wallDepth2.scale.z = wallDepth1.scale.z
  wallDepth1.position.z = wallDepth2.position.z = 0 //reset position of origin to zero as per Grok's advice - means not scaled by disproportionate amount to one side
  wallWidth1.position.z = - 1 * ((wallDepth1.geometry.parameters.depth / 2) * wallDepth1.scale.z) + wallWidth1.geometry.parameters.depth / 2
  wallWidth2.position.z = (wallDepth1.geometry.parameters.depth / 2) * wallDepth1.scale.z - wallWidth2.geometry.parameters.depth / 2

  door_side.position.z = wallWidth2.position.z
  door_side.scale.x = wallWidth2.scale.x
  door_side.scale.y = wallWidth2.scale.y

  updatePrism() //load function which updates apex roof

  windowAddition() //load window addition function

  floor.position.y = (0 - result.geometry.parameters.height/2 - floor.geometry.parameters.height/2)*wallWidth2.scale.y

  renderer.render(scene, camera);

}

animate()




