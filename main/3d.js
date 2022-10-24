const fs = require("fs");

const THREE = require("three");
const Canvas = require("canvas");
const { MMDLoader } = require("three/examples/jsm/loaders/MMDLoader");
const { MMDAnimationHelper } = require("three/examples/jsm/animation/MMDAnimationHelper");



module.exports = {
  mmd: async () => {
    let scene, renderer, camera, mesh, helper, ambientLight, light;

    let ready = false;
    
    let settings;
    let Pmx;
      
    async function setPmx (func) {
      Pmx = '/model/ふぇのふぇのチャン/ふぇのふぇの.pmx';
      console.log(Pmx);
      func();
    }
      
    //browser size
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    //Obujet Clock
    const clock = new THREE.Clock();  
    
    const MotionObjects = [
      { id: "Crossroads/Motion", VmdClip: null, AudioClip: false }
    ];
    
    window.onload = () => {
      Pmx = setPmx(function (){
        Init();
    
        LoadModeler();
      
        Render();
      });
    }
    
    let recorder;
    let blobUrl;
    
    function renderingStart() {
      let canvas = new Canvas(640, 360);
    
      let ctx = canvas.getContext('2d');
    	//canvasからストリームを取得
    	var stream = canvas.captureStream();
    	//ストリームからMediaRecorderを生成
    	recorder = new MediaRecorder(stream, {mimeType:'video/webm;codecs=vp9'});
    	//ダウンロード用のリンクを準備
    	var anchor = document.getElementById('downloadlink');
    	//録画終了時に動画ファイルのダウンロードリンクを生成する処理
    	recorder.ondataavailable = function(e) {
    		var videoBlob = new Blob([e.data], { type: e.data.type });
    		blobUrl = window.URL.createObjectURL(videoBlob);
    	}
    	//録画開始
    	recorder.start();
    	//フレーム描画開始
    	VmdControl("Crossroads/Motion", false);
    }
    
    /*
     * Initialize Three
     * camera and right
     */
    var Init = async () => {
      scene = new THREE.Scene();
      renderer = new THREE.WebGLRenderer({ 
        alpha: false,
        antialias: true
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth - 60, window.innerHeight - 120);
      renderer.shadowMap.enabled = true;
      // documentにMMDをセットする
      document.getElementById('three_canvas').appendChild(renderer.domElement);
      ambientLight = new THREE.AmbientLight( 0xffffff, 0.6 );
      scene.add( ambientLight );
      light = new THREE.DirectionalLight( 0xffe2b9, 0.4 );
      light.castShadow = true;
      // ライトの位置を設定
      // (Property) .position : Vector3
      // (Method) .copy ( v : Vector3 ) : this
      light.position.copy( new THREE.Vector3( 2, 4.7, 2 ) );
      // ライト(スポットライト光源)によるシャドウのマッピングのサイズ
      // (Property) .shadow : SpotLightShadow
      // (Property) .mapSize : Vector2
      light.shadow.mapSize.copy( new THREE.Vector2 ( 2 ** 10, 2 ** 10 ) );
      light.shadow.focus = 1;
      light.shadow.normalBias = 0.02;
      light.shadow.bias = -0.0005;
      light.shadow.camera.left = -5;
      light.shadow.camera.right = 5;
      light.shadow.camera.top = 5;
      light.shadow.camera.bottom = -5;
      // (Property) .near : Float
      light.shadow.camera.near = 0.1;
      light.shadow.camera.far = 25;
      scene.add( light );
      //light.target.position.copy( new THREE.Vector3( 0, 0, 0 ) );
      // 平行光源のターゲットをシーンに追加
      // (Method) .add ( object : Object3D, ... ) : this
      scene.add( light.target );
      //cameraの作成
      camera = new THREE.PerspectiveCamera(100, windowWidth / windowHeight, 1, 1000);
      camera.position.set(-1, 15, 30);
      camera.rotation.x = -0.1;
    }
    
    /*
     * Load PMX and VMD and Audio
     */
    var LoadModeler = async () => {
      const loader = new MMDLoader();
    
      //Loading PMX
      var LoadPMX = () => {
        return new Promise(resolve => {
          loader.load(Pmx, (object) => {
            mesh = object;
            for ( let i = 0; i < mesh.material.length; i ++ ) {
              // MMD 3Dモデルの明るさを調整する
              // (Property) .emissive : Color
              // (Method) .multiplyScalar ( s : Number ) : Color
              mesh.material[ i ].emissive.multiplyScalar( 0.5 );
              // OutlineEffectの輪郭線の太さを調整する
              // (Property) .userData : Object
              mesh.material[ i ].userData.outlineParameters.thickness = 0.001;
            }
                    // MMD 3Dモデルの影を描画する
            // (Property) .castShadow : Boolean
            mesh.castShadow = true;
            // MMD 3Dモデルに影を描画する
            // (Property) .receiveShadow : Boolean
            mesh.receiveShadow = true;
            scene.add(mesh);
    
            resolve(true);
          }, onProgress, onError);
        });
      }
    
      //Loading VMD
      var LoadVMD = (id) => {
        return new Promise(resolve => {
          const path = `${__dirname}/static/vmd/${id}.vmd`;
          const val = MotionObjects.findIndex(MotionObject => MotionObject.id == id);
    
          loader.loadAnimation(path, mesh, (vmd) => {
            vmd.name = id;
    
            MotionObjects[val].VmdClip = vmd;
    
            resolve(true);
          }, onProgress, onError);
        });
      }
    
      //Load Audio
      var LoadAudio = (id) => {
        return new Promise(resolve => {
          const path = "./audio/" + id + ".wav";
          const val = MotionObjects.findIndex(MotionObject => MotionObject.id == id);
    
          if (MotionObjects[val].AudioClip) {
            new THREE.AudioLoader().load(path, (buffer) => {
              const listener = new THREE.AudioListener();
              const audio = new THREE.Audio(listener).setBuffer(buffer);
              MotionObjects[val].AudioClip = audio;
    
              resolve(true);
            }, onProgress, onError);
          } else {
            resolve(false);
          }
        });
      }
    
      // Loading PMX...
      await LoadPMX();
    
      // Loading VMD...
      await Promise.all(MotionObjects.map(async (MotionObject) => {
        return await LoadVMD(MotionObject.id);
      }));
    
      // Loading Audio...
      await Promise.all(MotionObjects.map(async (MotionObject) => {
        return await LoadAudio(MotionObject.id);
      }));
    
      renderingStart();
    }
    
    /*
     * Start Vmd and Audio.
     * And, Get Vmd Loop Event
     */
    var VmdControl = (id, loop) => {
      const index = MotionObjects.findIndex(MotionObject => MotionObject.id == id);
    
      // Not Found id
      if (index === -1) {
        console.log("not Found ID");
        return;
      }
    
      ready = false;
      helper = new MMDAnimationHelper({ afterglow: 2.0, resetPhysicsOnLoop: true });
    
      // 
      helper.add(mesh, {
        animation: MotionObjects[index].VmdClip,
        physics: true
      });
    
      //Start Audio
      if (MotionObjects[index].AudioClip) {
        MotionObjects[index].AudioClip.play();
      }
    
      const mixer = helper.objects.get(mesh).mixer;
      //animation Loop Once
      if (!loop) {
        mixer.existingAction(MotionObjects[index].VmdClip).setLoop(THREE.LoopOnce);
      }
    
      // VMD Loop Event
      mixer.addEventListener("loop", (event) => {
        console.log("loop");
      });
    
      // VMD Loop Once Event
      mixer.addEventListener("finished", (event) => {
        console.log("finished");
        recorder.stop();
      });
    
      ready = true;
    }
    
    
    
    /*
     * Loading PMX or VMD or Voice
     */
    var onProgress = (xhr) => {
      if (xhr.lengthComputable) {
        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log(Math.round(percentComplete, 2) + '% downloaded');
      }
    }
    
    /* 
     * loading error
     */
    var onError = (xhr) => {
      console.log("ERROR");
    }
    
    /*
     * MMD Model Render
     */
    function Render () {
      requestAnimationFrame(Render);
      renderer.clear();
      renderer.render(scene, camera);
    
      if (ready) {
        helper.update(clock.getDelta());
      }
    }
    
    /*
     * Click Event
     */
    var PoseClickEvent = (id) => {
      switch (id) {
        case 0:
          VmdControl("loop", true);
          break;
    
        default:
          VmdControl("loop", true);
          break;
      }
    }

    return blobUrl;
  }
}