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
const gardenTexture = new THREE.TextureLoader().load('./sky.jpg');
const brickTexture = new THREE.TextureLoader().load('brick.jpg');
const tilesTexture = new THREE.TextureLoader().load("tiles.jpg");
const grassTexture = new THREE.TextureLoader().load("grass.jpeg")
const slateTexture = new THREE.TextureLoader().load("slate.jpg")
const feltTexture = new THREE.TextureLoader().load("felt.jpg")
const shedTexture = new THREE.TextureLoader().load("shed.jpg")
const doorTexture = new THREE.TextureLoader().load("door.jpg")

shedTexture.wrapS = shedTexture.wrapT = THREE.RepeatWrapping
shedTexture.repeat.set(2,2)

grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping
grassTexture.repeat.set(10,10)

slateTexture.wrapS = slateTexture.wrapT = THREE.RepeatWrapping
slateTexture.repeat.set(2,2)

tilesTexture.wrapS = tilesTexture.wrapT = THREE.RepeatWrapping
tilesTexture.repeat.set(2,2)

feltTexture.wrapS = feltTexture.wrapT = THREE.RepeatWrapping
feltTexture.repeat.set(2,2)

//Materials
const shedMaterial = new THREE.MeshBasicMaterial({map: shedTexture});
shedMaterial.side = THREE.DoubleSide
const floorMaterial = new THREE.MeshBasicMaterial({color: 0x3f9b0b, map: grassTexture});
const tilesMaterial_with_texture = new THREE.MeshBasicMaterial({ map: tilesTexture});
const tilesMaterial = new THREE.MeshBasicMaterial({ map: tilesTexture});
const slateMaterial = new THREE.MeshBasicMaterial({ map: slateTexture});
slateMaterial.side = THREE.DoubleSide
const windowMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
const brushMat = new THREE.MeshBasicMaterial({color: 0xffc400})
tilesMaterial.side = THREE.DoubleSide;
const feltMaterial = new THREE.MeshBasicMaterial({map: feltTexture})
feltMaterial.side = THREE.DoubleSide
const doorMaterial = new THREE.MeshBasicMaterial({ map: doorTexture })

//Background
scene.background = gardenTexture

let shedDimensions = {
    width: 8, 
    height: 2, 
    depth: 8, 
    window1Enabled: true,
    window1Scale_x: 1,
    window1Scale_y: 1,
    window1Position_x: 0,
    window1Position_y: 0,
    window2Enabled: true,
    window2Scale_z: 1,
    window2Scale_y: 1,
    window2Position_z: 0,
    window2Position_y: 0,
    window3Enabled: true,
    window3Scale_z: 1,
    window3Scale_y: 1,
    window3Position_z: 0,
    window3Position_y: 0,
    doorEnabled: true,
    doorPosition_x: 0,
    roof: "Apex",
    roofMaterial: "Slate"
}

let widthPresets = {
  'Small': 4,
  'Medium': 6,
  'Large': 8
}

const wallThickness = 1

//Complex Solid Geometry Variables
let csgEvaluator;

csgEvaluator = new Evaluator();
csgEvaluator.attributes = [ 'position', 'normal' ];
csgEvaluator.useGroups = false;

//add floor
const floor2_geom = new THREE.BufferGeometry()
const vertices_floor = new Float32Array([
  -50, 5, 50, //1 + 4 + 7 + 10
  50, 5, - 50, 
  -50, 5, -50,
  50, 5, 50])

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

vertices_floor[1] = vertices_floor[4] = vertices_floor[7] = vertices_floor[10] = -shedDimensions.height/2

scene.add(floor_v2)

//User interface

const gui = new dat.GUI()

var folder1 = gui.addFolder("1. Select Shed Size")
var folder2 = gui.addFolder("2. Select Window and Doors")
var folder3 = gui.addFolder("3. Select Roof Type")
var folder4 = gui.addFolder("4. Select Colours")

var folder21 = folder2.addFolder("Edit Window 1 Parameters")
var folder22 = folder2.addFolder("Edit Window 2 Parameters")
var folder23 = folder2.addFolder("Edit Window 3 Parameters")
var folder24 = folder2.addFolder("Edit Door Parameters")

folder1.add( shedDimensions, 'width', 4,10,2).onFinishChange(rebuildBuilding).name("Shed Width (Metres)")
folder1.add( shedDimensions, 'height', 2,2.5,0.1).onFinishChange(rebuildBuilding).name("Shed Height (Metres)")
folder1.add( shedDimensions, 'depth', 4,10,2).onFinishChange(rebuildBuilding).name("Shed Depth (Metres)")

folder2.add(shedDimensions, 'window1Enabled').onChange(rebuildBuilding)

folder21.add(shedDimensions, "window1Scale_x", 0.5, 2.5, 0.5).onFinishChange(rebuildBuilding).name('Window1 Width')
folder21.add(shedDimensions, "window1Scale_y", 0.5, 1, 0.1).onFinishChange(rebuildBuilding).name('Window1 Height')
folder21.add(shedDimensions, "window1Position_x", -2, 2, 1).onFinishChange(rebuildBuilding).name('Window1 Position x')
folder21.add(shedDimensions, "window1Position_y", -0.5, 0.5, 0.2).onFinishChange(rebuildBuilding).name('Window1 Position y')

folder2.add(shedDimensions, 'window2Enabled').onChange(rebuildBuilding)
folder22.add(shedDimensions, "window2Scale_z", 0.5, 2.5, 0.5).onFinishChange(rebuildBuilding).name('Window2 Width')
folder22.add(shedDimensions, "window2Scale_y", 0.5, 1, 0.1).onFinishChange(rebuildBuilding).name('Window2 Height')
folder22.add(shedDimensions, "window2Position_z", -2, 2, 1).onFinishChange(rebuildBuilding).name('Window2 Position z')
folder22.add(shedDimensions, "window2Position_y", -0.5, 0.5, 0.2).onFinishChange(rebuildBuilding).name('Window2 Position y')

folder2.add(shedDimensions, 'window3Enabled').onChange(rebuildBuilding)
folder23.add(shedDimensions, "window3Scale_z", 0.5, 2.5, 0.5).onFinishChange(rebuildBuilding).name('Window2 Width')
folder23.add(shedDimensions, "window3Scale_y", 0.5, 1, 0.1).onFinishChange(rebuildBuilding).name('Window2 Height')
folder23.add(shedDimensions, "window3Position_z", -2, 2, 1).onFinishChange(rebuildBuilding).name('Window2 Position z')
folder23.add(shedDimensions, "window3Position_y", -0.5, 0.5, 0.2).onFinishChange(rebuildBuilding).name('Window2 Position y')

folder24.add(shedDimensions, "doorPosition_x", -1.5, 1.5, 0.5).onChange(rebuildBuilding).name("Door Position x")

folder3.add(shedDimensions, "roof", ["Flat", "Apex"]).onChange(rebuildBuilding).name("Select Roof Type")
folder3.add(shedDimensions, "roofMaterial", ["Tiles", "Slate", "Felt"]).onChange(rebuildBuilding).name("Select Roof Material")

// folder4.addColor(colorParams, 'colorWall').name('Colour of Walls').onChange(updateColorWalls);
// folder4.addColor(colorParams, 'colorRoof').name('Colour of Roof').onChange(updateColorRoof);

function roofMaterialChoice_apex(endBits, slope1, slope2, tilesMaterial, slateMaterial, feltMaterial){
  if (shedDimensions.roofMaterial === "Tiles"){
    endBits.material = tilesMaterial
    slope1.material = tilesMaterial
    slope2.material = tilesMaterial
  }else if (shedDimensions.roofMaterial === "Slate"){
    endBits.material = slateMaterial
    slope1.material = slateMaterial
    slope2.material = slateMaterial
  }else{
    endBits.material = feltMaterial
    slope1.material = feltMaterial
    slope2.material = feltMaterial
  }
}

function roofMaterialChoice_flatRoof(flatRoof, tilesMaterial, slateMaterial, feltMaterial){
  if (shedDimensions.roofMaterial === "Tiles"){
    flatRoof.material = tilesMaterial
  }else if (shedDimensions.roofMaterial === "Slate"){
    flatRoof.material = slateMaterial
  }else{
    flatRoof.material = feltMaterial
  }
}

function buildApexRoof(){

  let geometry1 = new THREE.BufferGeometry();
  let geometry2 = new THREE.BufferGeometry();
  let geometry3 = new THREE.BufferGeometry();

    // Slope 1
  const vertices_1 = new Float32Array([

    shedDimensions.width / 2 + wallThickness, shedDimensions.height / 2, -shedDimensions.depth/2,
    0, shedDimensions.height/2 + 2, -shedDimensions.depth / 2,
    shedDimensions.width / 2 + wallThickness, shedDimensions.height / 2, shedDimensions.depth / 2,
    0, shedDimensions.height / 2 + 2, shedDimensions.depth / 2,

  ]);

    //Slope 2
  const vertices_2 = new Float32Array([

    -shedDimensions.width / 2 - wallThickness, shedDimensions.height / 2, -shedDimensions.depth / 2,
    0, shedDimensions.height / 2 + 2, -shedDimensions.depth / 2,
    -shedDimensions.width / 2 - wallThickness, shedDimensions.height / 2, shedDimensions.depth / 2,
    0, shedDimensions.height / 2 + 2, shedDimensions.depth / 2,

  ])

  // End bits
  const vertices_3 = new Float32Array([

    // Front triangle
    -shedDimensions.width / 2 - wallThickness, shedDimensions.height / 2, -shedDimensions.depth / 2,
    shedDimensions.width / 2 + wallThickness, shedDimensions.height / 2, -shedDimensions.depth / 2,
    0, shedDimensions.height / 2 + 2, -shedDimensions.depth / 2,
    
    // Back triangle
    -shedDimensions.width / 2 - wallThickness, shedDimensions.height / 2, shedDimensions.depth / 2,
    shedDimensions.width / 2 + wallThickness, shedDimensions.height / 2, shedDimensions.depth / 2,
    0, shedDimensions.height / 2 + 2, shedDimensions.depth / 2,

  ])

  // Indices for drawing order for roof slope 1 and 2
  const indices = [
      0, 1, 2,
      2, 3, 1
  ];

  const indices_endBits = [
    0, 1, 2,
    5, 4, 3
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
  const endBits = new THREE.Mesh(geometry3, tilesMaterial);

  return { slope1, slope2, endBits }

}

function disposeGroup(group) {
  group.traverse((child) => {
    if (child.isMesh) {
      // Dispose geometry
      if (child.geometry) {
        child.geometry.dispose();
      }

      // Dispose material
      if (child.material) {
        if (Array.isArray(child.material)) {
          // Handle multi-material meshes
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  });

  // Remove the group from the scene after disposing of its children
  if (group.parent) {
    group.parent.remove(group);
  }
}

//Rebuild shed
function rebuildBuilding(){

    console.log("width", shedDimensions.width)
    console.log("height", shedDimensions.height)
    console.log("depth", shedDimensions.depth)


    //remove old building
    const shedGroup = new THREE.Group()
    console.log("shedGroup children phase 1", shedGroup.children)

    shedGroup.name = "shed"
    if (scene.getObjectByName("shed")){
        scene.remove(scene.getObjectByName("shed"))   
    }
  
    //define new wall geometries
    //in x plane

    let hole_door = new Operation(new THREE.BoxGeometry(1.2, 2.0, wallThickness), shedMaterial);
    hole_door.operation = SUBTRACTION;

    let tempDoor = new THREE.Mesh( hole_door.geometry, doorMaterial )

    let frame_x = new Operation( new THREE.BoxGeometry( 2, 1.75, wallThickness), shedMaterial );
    frame_x.operation = ADDITION;

    let hole_x = new Operation( new THREE.BoxGeometry( 1.9, 1.65, wallThickness), shedMaterial );
    hole_x.operation = SUBTRACTION;

    let bar1_x = new Operation( new THREE.BoxGeometry( 2, 0.1, 0.1 ), shedMaterial);
    bar1_x.operation = ADDITION;

    let bar2_x = new Operation( new THREE.BoxGeometry( 0.1, 2, 0.1 ), shedMaterial);
    bar2_x.operation = ADDITION;

    let windowGroup_x = new OperationGroup();
    windowGroup_x.add(hole_x, frame_x, hole_x, bar1_x, bar2_x);

    //in z plane
    let frame_z = new Operation( new THREE.BoxGeometry( wallThickness , 1.75, 2 ), shedMaterial );
    frame_z.operation = ADDITION;

    let hole_z = new Operation( new THREE.BoxGeometry( wallThickness, 1.65, 1.9 ), shedMaterial );
    hole_z.operation = SUBTRACTION;

    let bar1_z = new Operation( new THREE.BoxGeometry( 0.1, 0.1, 2 ), shedMaterial );
    bar1_z.operation = ADDITION;

    let bar2_z = new Operation( new THREE.BoxGeometry( 0.1, 2, 0.1 ), shedMaterial );
    bar2_z.operation = ADDITION;

    let windowGroup_z = new OperationGroup();
    windowGroup_z.add(frame_z, hole_z, bar1_z, bar2_z );

    let frame_2z = new Operation( new THREE.BoxGeometry( wallThickness , 1.75, 2 ), shedMaterial );
    frame_2z.operation = ADDITION;

    let hole_2z = new Operation( new THREE.BoxGeometry( wallThickness, 1.65, 1.9 ), shedMaterial );
    hole_2z.operation = SUBTRACTION;

    let bar1_2z = new Operation( new THREE.BoxGeometry( 0.1, 0.1, 2 ), shedMaterial );
    bar1_2z.operation = ADDITION;

    let bar2_2z = new Operation( new THREE.BoxGeometry( 0.1, 2, 0.1 ), shedMaterial );
    bar2_2z.operation = ADDITION;

    let windowGroup_2z = new OperationGroup();
    windowGroup_2z.add(frame_2z, hole_2z, bar1_2z, bar2_2z );

    let wallWidthGeom = new THREE.BoxGeometry( shedDimensions.width, shedDimensions.height, wallThickness )
    let wallDepthGeom = new THREE.BoxGeometry( wallThickness, shedDimensions.height, shedDimensions.depth )

    //define first window side
    let wallWidth1 = new Operation( wallWidthGeom, shedMaterial )
    wallWidth1.position.z = shedDimensions.depth / 2 - wallThickness / 2

    if (shedDimensions.window1Enabled){

      windowGroup_x.scale.x = shedDimensions.window1Scale_x
      windowGroup_x.scale.y = shedDimensions.window1Scale_y
      windowGroup_x.position.x = shedDimensions.window1Position_x
      windowGroup_x.position.y = shedDimensions.window1Position_y
      wallWidth1.add( windowGroup_x )

      //compute geometry evaluation
      let wallSide = csgEvaluator.evaluateHierarchy(wallWidth1)
      wallSide.material = shedMaterial
      
      shedGroup.add(wallSide)
      
    }else{
      shedGroup.add(wallWidth1)
    }

    console.log("shedGroup children phase 2", shedGroup.children)
    //define door side
    let wallWidth2 = new Operation( wallWidthGeom, shedMaterial )
    wallWidth2.position.z = tempDoor.position.z = - shedDimensions.depth / 2 + wallThickness / 2

    if (shedDimensions.doorEnabled){

      hole_door.position.x = tempDoor.position.x = shedDimensions.doorPosition_x
      wallWidth2.add ( hole_door )

      //compute geometry evaluation
      let doorSide = csgEvaluator.evaluateHierarchy(wallWidth2)
      doorSide.material = shedMaterial

      shedGroup.add(doorSide, tempDoor)

    }else{

      shedGroup.add(wallWidth2)

    }

    //define second window side
    let wallDepth1 = new Operation( wallDepthGeom, shedMaterial )
    wallDepth1.position.x = shedDimensions.width / 2 + wallThickness / 2

    if (shedDimensions.window2Enabled){

      windowGroup_z.scale.z = shedDimensions.window2Scale_z
      windowGroup_z.scale.y = shedDimensions.window2Scale_y
      windowGroup_z.position.z = shedDimensions.window2Position_z
      windowGroup_z.position.y = shedDimensions.window2Position_y
      wallDepth1.add(windowGroup_z)
      
      let wallDepthSide1 = csgEvaluator.evaluateHierarchy(wallDepth1)
      wallDepthSide1.material = shedMaterial

      shedGroup.add(wallDepthSide1)
    }else{
      shedGroup.add(wallDepth1)
    }

    //define third window side
    let wallDepth2 = new Operation( wallDepthGeom, shedMaterial )
    wallDepth2.position.x = - shedDimensions.width / 2 - wallThickness / 2

    if (shedDimensions.window3Enabled){

      windowGroup_2z.scale.z = shedDimensions.window3Scale_z
      windowGroup_2z.scale.y = shedDimensions.window3Scale_y
      windowGroup_2z.position.z = shedDimensions.window3Position_z
      windowGroup_2z.position.y = shedDimensions.window3Position_y
      wallDepth2.add(windowGroup_2z)

      let wallDepthSide2 = csgEvaluator.evaluateHierarchy(wallDepth2)
      wallDepthSide2.material = shedMaterial

      shedGroup.add(wallDepthSide2)
    }else{
      shedGroup.add(wallDepth2)
    }

    //sort roof
    if (shedDimensions.roof == "Flat"){
      let flatRoof = new THREE.Mesh(new THREE.BoxGeometry(shedDimensions.width + 2 * wallThickness, wallThickness, shedDimensions.depth), tilesMaterial)
      flatRoof.position.y = shedDimensions.height / 2 + wallThickness/2
      roofMaterialChoice_flatRoof(flatRoof, tilesMaterial, slateMaterial, feltMaterial)
      shedGroup.add(flatRoof)
    }else if (shedDimensions.roof == "Apex"){
      const {slope1, slope2, endBits} = buildApexRoof()
      roofMaterialChoice_apex(endBits, slope1, slope2, tilesMaterial, slateMaterial, feltMaterial)
      console.log("end bits", endBits)
      //roofMaterialChoice_apex()
      shedGroup.add(slope1, slope2, endBits)
    }

    scene.add(shedGroup)

    if(wallWidth1){
      wallWidth1.geometry.dispose()
      wallWidth1.material.dispose()
    }

    if(wallWidth2){
      wallWidth2.geometry.dispose()
      wallWidth2.material.dispose()
    }

    if(wallDepth1){
      wallDepth1.geometry.dispose()
      wallDepth1.material.dispose()
    }

    if(wallDepth2){
      wallDepth2.geometry.dispose()
      wallDepth2.material.dispose()
    }

    if(windowGroup_x){
      disposeGroup(windowGroup_x)
    }

    if(hole_door){
      hole_door.geometry.dispose()
      hole_door.material.dispose()
    }

    if(windowGroup_z){
      disposeGroup(windowGroup_z)
    }

    if(windowGroup_z){
      disposeGroup(windowGroup_2z)
    }

    try{
      if (wallSide){
        wallSide.geometry.dispose()
        wallSide.material.dispose()
      }
    }catch(error){
      console.log("no wall side")
    }

    try{
      if (doorSide){
        doorSide.geometry.dispose()
        doorSide.material.dispose()
      }
    }catch(error){
        console.log("no door side")
    }

    try{
      if (wallDepthSide1){
        wallDepthSide1.geometry.dispose()
        wallDepthSide1.material.dispose()
      }
    }catch(error){
      console.log("no wall depth side")
    }

    try{
      if (wallDepthSide2){
        wallDepthSide2.geometry.dispose()
        wallDepthSide2.material.dispose()
      }
    }catch(error){
      console.log("no wall depth 2 side")
    }
    
}


rebuildBuilding()

function animate(){

  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera);
  
}

animate()