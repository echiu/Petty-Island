const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
const OBJLoader = require('three-obj-loader')(THREE)

var startTime = Date.now();
var featherGeo;
var featherMatrix = [];
var allMeshes = new Set();

var smith = new THREE.Geometry();
var smithLoaded = new Promise((resolve, reject) => {
    (new THREE.OBJLoader()).load('./geo/petty-park.obj', function(obj) {
        smith = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);
        smith.computeBoundingSphere();
        //do these 3 steps to smooth the object out
        //smith.computeFaceNormals();
        //smith.mergeVertices();
        //smith.computeVertexNormals();
        resolve(smith);
    });
});

var mapBottom = new THREE.Geometry();
var mapBottomLoaded = new Promise((resolve, reject) => {
    (new THREE.OBJLoader()).load('./geo/map-bottom.obj', function(obj) {
        mapBottom = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);
        mapBottom.computeBoundingSphere();
        //do these 3 steps to smooth the object out
        //mapBottom.computeFaceNormals();
        //mapBottom.mergeVertices();
        //mapBottom.computeVertexNormals();
        resolve(mapBottom);
    });
});

var mapTop = new THREE.Geometry();
var mapTopLoaded = new Promise((resolve, reject) => {
    (new THREE.OBJLoader()).load('./geo/map-top.obj', function(obj) {
        mapTop = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);
        mapTop.computeBoundingSphere();
        //do these 3 steps to smooth the object out
        //mapTop.computeFaceNormals();
        //mapTop.mergeVertices();
        //mapTop.computeVertexNormals();
        resolve(mapTop);
    });
});

// var gallery = new THREE.Geometry();
// var galleryLoaded = new Promise((resolve, reject) => {
//     (new THREE.OBJLoader()).load('./geo/gallery.obj', function(obj) {
//         gallery = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);
//         gallery.computeBoundingSphere();
//         //do these 3 steps to smooth the object out
//         // mountains.computeFaceNormals();
//         // mountains.mergeVertices();
//         // mountains.computeVertexNormals();
//         resolve(gallery);
//     });
// });

// var sculpture = new THREE.Geometry();
// var sculptureLoaded = new Promise((resolve, reject) => {
//     (new THREE.OBJLoader()).load('./geo/sculpture.obj', function(obj) {
//         sculpture = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);
//         sculpture.computeBoundingSphere();
//         //do these 3 steps to smooth the object out
//         // mountains.computeFaceNormals();
//         // mountains.mergeVertices();
//         // mountains.computeVertexNormals();
//         resolve(sculpture);
//     });
// });

// var lake = new THREE.Geometry();
// var lakeLoaded = new Promise((resolve, reject) => {
//     (new THREE.OBJLoader()).load('./geo/lake.obj', function(obj) {
//         lake = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);
//         lake.computeBoundingSphere();
//         //do these 3 steps to smooth the object out
//         // lake.computeFaceNormals();
//         // lake.mergeVertices();
//         // lake.computeVertexNormals();
//         resolve(lake);
//     });
// });

// var mountains = new THREE.Geometry();
// var mountainsLoaded = new Promise((resolve, reject) => {
//     (new THREE.OBJLoader()).load('./geo/mountains.obj', function(obj) {
//         mountains = new THREE.Geometry().fromBufferGeometry(obj.children[0].geometry);
//         mountains.computeBoundingSphere();
//         //do these 3 steps to smooth the object out
//         // mountains.computeFaceNormals();
//         // mountains.mergeVertices();
//         // mountains.computeVertexNormals();
//         resolve(mountains);
//     });
// });


/////////////////////////////////////////////////////////////////////

// called after the scene loads
function onLoad(framework) {
    var scene = framework.scene;
    var camera = framework.camera;
    var renderer = framework.renderer;
    var gui = framework.gui;
    var stats = framework.stats;
    var controls = framework.controls;

    // Set light
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.color.setHSL(0.1, 1, 1);
    directionalLight.position.set(1, 3, 2);
    directionalLight.position.multiplyScalar(10);
    scene.add(directionalLight);

    // set camera position and rotation point
    camera.position.set(0, 55, 75);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    controls.target.set(0, 2, -3);

    //add smith head to scene
    //perform all these operations after all the data is loaded
    Promise.all([smithLoaded]).then(values => {   
        /*
        var smithMaterial = new THREE.MeshStandardMaterial({map: new THREE.TextureLoader().load('../assets/smithtexture.bmp')});
        smithMaterial.normalMap = new THREE.TextureLoader().load('../assets/smithnormal.jpg');
        smithMaterial.roughness = 1;
        smithMaterial.metalness = 0;
        */
        var smithMaterial = new THREE.ShaderMaterial( {
            uniforms: {
                normalMap: { type: "t", value: new THREE.TextureLoader().load('./geo/smithnormal.jpg') },
                u_useNormalMap : { type: 'i', value: true },
                texture: { type: "t", value: new THREE.TextureLoader().load('./geo/smithtexture.bmp') },
                u_useTexture: { type: 'i', value: true },
                u_albedo: { type: 'v3', value: new THREE.Vector3(1, 1, 1) },
                u_ambient: { type: 'f', value: 0.2 },
                u_lightPos: { type: 'v3', value: new THREE.Vector3(30, 50, 40) },
                u_lightCol: { type: 'v3', value: new THREE.Vector3(1, 1, 1) },
                u_lightIntensity: { type: 'f', value: 1.0 }
            },
            vertexShader: require('./shaders/iridescence-vert.glsl'),
            fragmentShader: require('./shaders/iridescence-frag.glsl')
        });
        var mesh = new THREE.Mesh( smith, smithMaterial);
        scene.add(mesh);

        var bottomMesh = new THREE.Mesh( mapBottom, smithMaterial);
        scene.add(bottomMesh);

        var topMaterial = new THREE.ShaderMaterial( {
            uniforms: {
                normalMap: { type: "t", value: new THREE.TextureLoader().load('./geo/smithnormal.jpg') },
                u_useNormalMap : { type: 'i', value: true },
                texture: { type: "t", value: new THREE.TextureLoader().load('./geo/map-texture.png') },
                u_useTexture: { type: 'i', value: true },
                u_albedo: { type: 'v3', value: new THREE.Vector3(1, 1, 1) },
                u_ambient: { type: 'f', value: 0.2 },
                u_lightPos: { type: 'v3', value: new THREE.Vector3(30, 50, 40) },
                u_lightCol: { type: 'v3', value: new THREE.Vector3(1, 1, 1) },
                u_lightIntensity: { type: 'f', value: 1.0 }
            },
            vertexShader: require('./shaders/iridescence-vert.glsl'),
            fragmentShader: require('./shaders/top-frag.glsl')
        });

        var topMesh = new THREE.Mesh( mapTop, topMaterial);
        scene.add(topMesh);

        // var galleryMesh = new THREE.Mesh( gallery, smithMaterial);
        // scene.add(galleryMesh);

        // var sculptureMesh = new THREE.Mesh( sculpture, smithMaterial);
        // scene.add(sculptureMesh);

        // var lakeMesh = new THREE.Mesh( lake, smithMaterial);
        // scene.add(lakeMesh);

        // var mountainMesh = new THREE.Mesh( mountains, smithMaterial);
        // scene.add(mountainMesh);
    });
}


// called on frame updates
function onUpdate(framework) {

    
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);