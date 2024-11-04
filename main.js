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
grassTexture.repeat.set(5,5)

//Materials
const brickMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
const floorMaterial = new THREE.MeshBasicMaterial({color: 0x3f9b0b, map: grassTexture});
const tilesMaterial_with_texture = new THREE.MeshBasicMaterial({ map: tilesTexture});
const tilesMaterial = new THREE.MeshBasicMaterial();
const windowMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
const brushMat = new THREE.MeshBasicMaterial({color: 0xffc400})
tilesMaterial.side = THREE.DoubleSide;
const resultGridMat = brushMat.clone();

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
  addWindow1: true, //Default state is window not added
  addWindow2: true,
  addWindow3: true
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

hole_door.position.y = -0.5

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

function updateFloor(){
  floor2_geom.attributes.position.setY(0, wallWidth1.scale.y * - wallWidth1.geometry.parameters.height / 2 )
  floor2_geom.attributes.position.setY(1, wallWidth1.scale.y * - wallWidth1.geometry.parameters.height / 2 )
  floor2_geom.attributes.position.setY(2, wallWidth1.scale.y * - wallWidth1.geometry.parameters.height / 2 )
  floor2_geom.attributes.position.setY(3, wallWidth1.scale.y * - wallWidth1.geometry.parameters.height / 2 )

  floor2_geom.attributes.position.needsUpdate = true;
  floor2_geom.computeVertexNormals()
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
  hole_x.scale.y = 1

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

  console.log("height ", wallDepth2.geometry.parameters.height)
  console.log("y scale ", resultDepth2.scale.y)

  scene.add(resultDepth2)
}

//User interface

const gui = new dat.GUI()

gui.add(wallWidth1.scale, "x", 0.5, 2).name('Scale Shed Width')
gui.add(wallWidth1.scale, "y", 1, 2).name('Scale Shed Height')
gui.add(wallDepth1.scale, "z", 0.5, 2).name('Scale Shed Depth')
//gui.add({InterimVar: interimVariable}, "InterimVar", 0, (2*wallWidth1.geometry.parameters.width + 2*wallDepth1.geometry.parameters.depth - 4*wallWidth1.geometry.parameters.depth),0.1).name('Window Location').onChange(setWindowLocation)

const colorParams = {
  colorWall: '#000000', // Hex string for white, initial color
  colorRoof: '#FFFFFF'
};

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

// Add a color picker to the GUI
gui.addColor(colorParams, 'colorWall').name('Colour of Walls').onChange(updateColorWalls);
gui.addColor(colorParams, 'colorRoof').name('Colour of Roof').onChange(updateColorRoof);

gui.add(windowParams, 'addWindow1').name('Add Window 1')

const interimBox = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), brickMaterial)

function updateWindow1_scale(){
  windowGroup_x.scale.x = interimBox.scale.x
  windowGroup_x.scale.y = interimBox.scale.y
}

gui.add(interimBox.scale, "y", 0.5, 1).name('Window1 Height')
gui.add(interimBox.scale, "x", 0.5, 2).name('Window1 Length')

gui.add(windowGroup_x.position, "x", -wallWidth1.geometry.parameters.width/2 + hole_x.geometry.parameters.width/2, wallWidth1.geometry.parameters.width/2 - hole_x.geometry.parameters.width/2).name("Window1 Position x")
gui.add(windowGroup_x.position, "y", -wallWidth1.geometry.parameters.height/2 + hole_x.geometry.parameters.height/2, wallWidth1.geometry.parameters.height/2 - hole_x.geometry.parameters.height/2).name("Window1 Position y")

gui.add(windowParams, 'addWindow2').name('Add Window 2')

const interimBox2 = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), brickMaterial)

function updateWindow2_scale(){
  windowGroup_z.scale.z = interimBox2.scale.z
  windowGroup_z.scale.y = interimBox2.scale.y
}

gui.add(interimBox2.scale, "y", 0.5, 1).name('Window2 Height')
gui.add(interimBox2.scale, "z", 0.5, 2).name('Window2 Length')

gui.add(windowGroup_z.position, "z", -wallDepth1.geometry.parameters.depth/2 + hole_z.geometry.parameters.depth, wallDepth1.geometry.parameters.depth/2 - hole_z.geometry.parameters.depth).name("Window 2 Position x")
gui.add(windowGroup_z.position, "y", -wallWidth1.geometry.parameters.height/2 + hole_x.geometry.parameters.height/2, wallWidth1.geometry.parameters.height/2 - hole_x.geometry.parameters.height/2).name("Window2 Position y")


gui.add(windowParams, 'addWindow3').name('Add Window 3')

const interimBox3 = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), brickMaterial)

function updateWindow3_scale(){
  windowGroup_2z.scale.z = interimBox3.scale.z
  windowGroup_2z.scale.y = interimBox3.scale.y
}

gui.add(interimBox3.scale, "y", 0.5, 1).name('Window3 Height')
gui.add(interimBox3.scale, "z", 0.5, 2).name('Window3 Length')


gui.add(windowGroup_2z.position, "z", -wallDepth1.geometry.parameters.depth/2 + hole_z.geometry.parameters.depth, wallDepth1.geometry.parameters.depth/2 - hole_z.geometry.parameters.depth).name("Window 3 Position x")
gui.add(windowGroup_2z.position, "y", -wallWidth1.geometry.parameters.height/2 + hole_x.geometry.parameters.height/2, wallWidth1.geometry.parameters.height/2 - hole_x.geometry.parameters.height/2).name("Window3 Position y")

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

  updateFloor() //load function which update floor height

  updateWindow1_scale()
  updateWindow2_scale()
  updateWindow3_scale()

  renderer.render(scene, camera);

}

animate()




