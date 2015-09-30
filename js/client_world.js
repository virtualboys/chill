var container, scene, camera, rendererMain, raycaster, objects = [];
var myKeyState = {};
var sphere;

var player, playerId, moveSpeed, turnSpeed;

var planeMesh;

var playerData;
var cssScene,rendererCSS;
var otherPlayers = [], otherPlayersId = [];

var loadWorld = function(){

    init();

    function init(){


        //Setup------------------------------------------
        container = document.getElementById('container');
        var newName1 = document.createElement("TH");

        newName1.innerHTML = "<input type='text'  name='site' id='site' value='cell value'>";

        scene = new THREE.Scene();

        cssScene = new THREE.Scene();


        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 5;
        //camera.lookAt( new THREE.Vector3(0,0,0));

        rendererCSS	= new THREE.CSS3DRenderer();
        rendererCSS.setSize( window.innerWidth, window.innerHeight );
        rendererCSS.domElement.style.position	= 'absolute';
        rendererCSS.domElement.style.top	= 0;
        rendererCSS.domElement.style.margin	= 0;
        rendererCSS.domElement.style.padding	= 0;
        document.body.appendChild( rendererCSS.domElement );

        rendererMain = new THREE.WebGLRenderer( { alpha: true} );
        rendererMain.setSize( window.innerWidth, window.innerHeight );
        rendererMain.domElement.style.position	= 'absolute';
        rendererMain.domElement.style.top	= 0;
        rendererMain.domElement.style.zIndex	= 1;
        rendererCSS.domElement.appendChild( rendererMain.domElement );




        raycaster = new THREE.Raycaster();
        //Add Objects To the Scene HERE-------------------

        var geometry = new THREE.PlaneGeometry( 20, 20, 32 );
        var material = new THREE.MeshBasicMaterial( {color: 0xCCFFFF, side: THREE.DoubleSide} );
        var plane = new THREE.Mesh( geometry, material );
        plane.rotation.x=(90*Math.PI/180);
        plane.position.y=0;

        scene.add( plane );

        var directionalLight = new THREE.DirectionalLight( 0xffffff, .1 );
        directionalLight.position.set(.3, 1, 0 );
        scene.add( directionalLight );

        var light = new THREE.AmbientLight( 0x444444 ); // soft white light
        scene.add( light );
        //Events------------------------------------------
        document.addEventListener('click', onMouseClick, false );
        document.addEventListener('mousedown', onMouseDown, false);
        document.addEventListener('mouseup', onMouseUp, false);
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseout', onMouseOut, false);
        document.addEventListener('keydown', onKeyDown, false );
        document.addEventListener('keyup', onKeyUp, false );
        window.addEventListener( 'resize', onWindowResize, false );

        //Final touches-----------------------------------

         var tag = document.createElement('script');

         tag.src = "https://www.youtube.com/iframe_api";
         vplayer = document.createElement( 'iframe' );
         var firstScriptTag = document.getElementsByTagName('script')[0];
         firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        //document.body.appendChild( container );


        var material = new THREE.MeshBasicMaterial({color: 0x000000,side: THREE.DoubleSide});
        material.color.set('black')
        material.opacity   = 0;
        material.blending  = THREE.NoBlending;
        var geometry = new THREE.PlaneGeometry(1.33333333*5,5,30);
        planeMesh= new THREE.Mesh( geometry, material );
        planeMesh.position.y +=2.5;
        // add it to the WebGL scene
        scene.add(planeMesh);


       	vplayer.style.width = '640px';
        vplayer.style.height = '480px';
       	vplayer.style.border = '0px';
        vplayer.style.border = '0px';


        var cssObject = new THREE.CSS3DObject( vplayer );
        // we reference the same position and rotation
        cssObject.position = planeMesh.position;
        cssObject.position.y+=2.5;
        cssObject.rotation = planeMesh.rotation;
        cssObject.scale.x= .0105;
        cssObject.scale.y=.0105;

        // add it to the css scene
        cssScene.add(cssObject);

    }

    function onMouseClick(){
        intersects = calculateIntersects( event );

        if ( intersects.length > 0 ){
            //If object is intersected by mouse pointer, do something
            if (intersects[0].object == sphere){
                alert("This is a sphere!");
            }
        }
    }
    function onMouseDown(){

    }
    function onMouseUp(){

    }
    function onMouseMove(){

    }
    function onMouseOut(){

    }
    function onKeyDown( event ){

        //event = event || window.event;

        myKeyState[event.keyCode || event.which] = true;

    }

    function onKeyUp( event ){

        //event = event || window.event;

        myKeyState[event.keyCode || event.which] = false;

    }
    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        rendererMain.setSize( window.innerWidth, window.innerHeight );

    }
    function calculateIntersects( event ){

        //Determine objects intersected by raycaster
        event.preventDefault();

        var vector = new THREE.Vector3();
        vector.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
        vector.unproject( camera );

        raycaster.ray.set( camera.position, vector.sub( camera.position ).normalize() );

        var intersects = raycaster.intersectObjects( objects );

        return intersects;
    }

};

var createPlayer = function(data){

    playerData = data;

    //var cube_geometry = new THREE.BoxGeometry(data.sizeX, data.sizeY, data.sizeZ);
    var icosa_geometry = new THREE.DodecahedronGeometry(1);
    var cube_material = new THREE.MeshPhongMaterial({color: 0xffCCff, wireframe: false, shading: THREE.FlatShading, emissive: 0x9999FF});
    player = new THREE.Mesh(icosa_geometry, cube_material);

    player.rotation.set(0,0,0);

    player.position.x = data.x;
    player.position.y = data.y;
    player.position.z = data.z;

    playerId = data.playerId;
    moveSpeed = data.speed;
    turnSpeed = data.turnSpeed;

    updateCameraPosition();

    objects.push( player );
    scene.add( player );

    camera.lookAt( player.position );
};

var animate = function(){
    requestAnimationFrame( animate );
    render();
}

var render = function(){
    if ( player ) {
        updateCameraPosition();

        checkKeyStates(myKeyState,player);
        updatePlayerData();
        socket.emit('updatePosition', playerData);
        for(var i=0; i<otherPlayers.length; i++){
            somePlayer=otherPlayers[i];
            //checkKeyStates(somePlayer.keyState,somePlayer);
        }

        camera.lookAt( player.position );
        //camera.lookAt(planeMesh);
    }

    //Render Scene---------------------------------------
    rendererMain.clear();
    rendererMain.render( scene , camera );
    rendererCSS.render(cssScene,camera);
}

var updateCameraPosition = function(){

    camera.position.x = player.position.x + 6 * Math.sin( player.rotation.y );
    camera.position.y = player.position.y + 3;
    camera.position.z = player.position.z + 6 * Math.cos( player.rotation.y );

};

var updatePlayerPosition = function(data){

    var somePlayer = playerForId(data.playerId);

    somePlayer.position.x = data.x;
    somePlayer.position.y = data.y;
    somePlayer.position.z = data.z;

    somePlayer.keyState = data.keyState;

    somePlayer.rotation.x = data.r_x;
    somePlayer.rotation.y = data.r_y;
    somePlayer.rotation.z = data.r_z;

};

var updatePlayerData = function(){

    playerData.x = player.position.x;
    playerData.y = player.position.y;
    playerData.z = player.position.z;
    playerData.keyState=myKeyState;

    playerData.r_x = player.rotation.x;
    playerData.r_y = player.rotation.y;
    playerData.r_z = player.rotation.z;

};
var checkKeyStates = function(keyState, somePlayer){

    if (keyState[38] || keyState[87]) {
        // up arrow or 'w' - move forward
        somePlayer.position.x -= moveSpeed * Math.sin(somePlayer.rotation.y);
        somePlayer.position.z -= moveSpeed * Math.cos(somePlayer.rotation.y);

    }
    if (keyState[40] || keyState[83]) {
        // down arrow or 's' - move backward
        somePlayer.position.x += moveSpeed * Math.sin(somePlayer.rotation.y);
        somePlayer.position.z += moveSpeed * Math.cos(somePlayer.rotation.y);

    }
    if (keyState[37] || keyState[65]) {
        // left arrow or 'a' - rotate left
        somePlayer.rotation.y += turnSpeed;
    }
    if (keyState[39] || keyState[68]) {
        // right arrow or 'd' - rotate right
        somePlayer.rotation.y -= turnSpeed;
    }
    if (keyState[81]) {
        // 'q' - strafe left
        somePlayer.position.x -= moveSpeed * Math.cos(somePlayer.rotation.y);
        somePlayer.position.z += moveSpeed * Math.sin(somePlayer.rotation.y);
    }
    if (keyState[69]) {
        // 'e' - strage right
        somePlayer.position.x += moveSpeed * Math.cos(somePlayer.rotation.y);
        somePlayer.position.z -= moveSpeed * Math.sin(somePlayer.rotation.y);
    }

};

var addOtherPlayer = function(data){
    var cube_geometry = new THREE.BoxGeometry(data.sizeX, data.sizeY, data.sizeZ);
    var cube_material = new THREE.MeshLambertMaterial({color: 0xCCCCFF, wireframe: false});
    var otherPlayer = new THREE.Mesh(cube_geometry, cube_material);

    otherPlayer.position.x = data.x;
    otherPlayer.position.y = data.y;
    otherPlayer.position.z = data.z;
    otherPlayer.keyState={};

    otherPlayersId.push( data.playerId );
    otherPlayers.push( otherPlayer );
    objects.push( otherPlayer );
    scene.add( otherPlayer );

};

var removeOtherPlayer = function(data){

    scene.remove( playerForId(data.playerId) );

};

 function onYouTubeIframeAPIReady() {
        vplayer = new YT.Player('player', {
          height: '200',
          width: '120',
          videoId: 'm5qXMrAd_G4',
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });

       /*	vplayer.style.width = '640px';
        vplayer.style.height = '480px';
       	vplayer.style.border = '0px';
        vplayer.style.border = '0px';


        var cssObject = new THREE.CSS3DObject( vplayer );
        // we reference the same position and rotation
        cssObject.position = planeMesh.position;
        cssObject.position.y+=2.5;
        cssObject.rotation = planeMesh.rotation;
        cssObject.scale.x= .0105;
        cssObject.scale.y=.0105;

        // add it to the css scene
        cssScene.add(cssObject);*/
 }

 function onPlayerReady(event) {
         event.target.playVideo();
         vplayer=document.getElementById('player');
         vplayer.style.width = '640px';
         vplayer.style.height = '480px';
         vplayer.style.border = '0px';
         vplayer.style.border = '0px';


         var cssObject = new THREE.CSS3DObject( vplayer );
         // we reference the same position and rotation
         cssObject.position = planeMesh.position;
         cssObject.position.y+=2.5;
         cssObject.rotation = planeMesh.rotation;
         cssObject.scale.x= .0105;
         cssObject.scale.y=.0105;

         // add it to the css scene
         cssScene.add(cssObject);
 }
       function stopVideo() {
         player.stopVideo();
       }

      function onPlayerStateChange(event) {

      }
var playerForId = function(id){
    var index;
    for (var i = 0; i < otherPlayersId.length; i++){
        if (otherPlayersId[i] == id){
            index = i;
            break;
        }
    }
    return otherPlayers[index];
};