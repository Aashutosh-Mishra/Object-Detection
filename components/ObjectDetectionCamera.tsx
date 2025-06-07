import Webcam from 'react-webcam';
import { useRef, useState, useEffect, useCallback } from 'react';
import { runModelUtils } from './../utils';
import { InferenceSession, Tensor } from 'onnxruntime-web';

// Define the expected props for this component
interface ObjectDetectionCameraProps {
  width: number; 
  height: number; 
  modelName: string; 
  session: InferenceSession | null; 
  preprocess: (ctx: CanvasRenderingContext2D) => Tensor; 
  postprocess: ( 
    outputTensor: Tensor | null,
    inferenceTime: number,
    ctx: CanvasRenderingContext2D,
    modelName: string
  ) => void;
  currentModelResolution: number[]; 
  changeCurrentModelResolution: () => void; 
}

const ObjectDetectionCamera = (props: ObjectDetectionCameraProps) => {
  const [inferenceTime, setInferenceTime] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const webcamRef = useRef<Webcam>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);
  const liveDetection = useRef<boolean>(false); 
  const [facingMode, setFacingMode] = useState<string>('environment'); 
  const [isTabHidden, setIsTabHidden] = useState<boolean>(false); 

  
  const capture = useCallback((): CanvasRenderingContext2D | null => {
    // Ensure refs are available and video is ready
    if (!webcamRef.current || !webcamRef.current.video || webcamRef.current.video.readyState < 3) {
      // console.warn("Webcam not ready for capture.");
      return null;
    }
    if (!videoCanvasRef.current) {
       console.error("Video canvas ref is not set.");
       return null;
    }

    const canvas = videoCanvasRef.current;
    const video = webcamRef.current.video;

    // Ensure canvas has valid dimensions (might be 0 initially)
    if (canvas.width <= 0 || canvas.height <= 0) {
      console.warn("Canvas dimensions are invalid for capture. Attempting resize.");
      setWebcamCanvasOverlaySize(); // Attempt to resize based on video
      // Check again after resize attempt
      if (canvas.width <= 0 || canvas.height <= 0) {
          console.error("Canvas dimensions still invalid after resize attempt.");
          return null;
      }
    }

    const context = canvas.getContext('2d', { willReadFrequently: true }); // Optimize for frequent reads if needed
    if (!context) {
      console.error("Failed to get 2D context from canvas.");
      return null;
    }

    // Clear previous drawings
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Reset transformations
    context.setTransform(1, 0, 0, 1, 0, 0);

    // Handle mirroring for 'user' facing mode
    if (facingMode === 'user') {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }

    try {
      // Draw the current video frame onto the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
    } catch (e) {
      console.error("Error drawing video to canvas:", e);
      context.setTransform(1, 0, 0, 1, 0, 0); // Reset transform on error
      return null;
    }

    // Reset transformations before returning context
    context.setTransform(1, 0, 0, 1, 0, 0);

    return context;
  }, [facingMode]); // Dependency: facingMode affects drawing transform

  // Function to run the model on a captured canvas context
  const runModelOnCtx = useCallback(async (ctx: CanvasRenderingContext2D) => {
    // Check if the session provided by the parent is valid
    if (!props.session) {
      console.error('Attempted to run model, but session is not loaded or invalid.');
      // Call postprocess with null tensor to potentially display an error on canvas
      props.postprocess(null, 0, ctx, props.modelName);
      setInferenceTime(0);
      return;
    }

    let outputTensor: Tensor | null = null;
    let infTime: number = 0;

    try {
      // console.log("Preprocessing frame...");
      // Use the preprocess function passed from the parent
      const inputTensor = props.preprocess(ctx);
      // console.log("Preprocessing done.");

      // Run the model using the utility function (imported by parent, session passed down)
      // Assuming runModel is robust enough internally now
      [outputTensor, infTime] = await runModelUtils.runModel(props.session, inputTensor);

    } catch (error) {
      console.error("Error during model run or preprocessing:", error);
      outputTensor = null; // Ensure tensor is null on error
      infTime = 0;
      // Potentially display specific error message via postprocess?
    } finally {
      setInferenceTime(infTime); // Update inference time state
      // Call the postprocess function passed from the parent
      // It handles drawing boxes or displaying errors (if tensor is null)
      props.postprocess(outputTensor, infTime, ctx, props.modelName);
    }
  }, [props.session, props.preprocess, props.postprocess, props.modelName]); // Dependencies

  // The main loop for live detection using requestAnimationFrame
  const runLiveDetectionLoop = useCallback(async () => {
    // Stop loop if liveDetection flag is false or session becomes invalid
    if (!liveDetection.current || !props.session) {
        if (!props.session && liveDetection.current) {
            console.warn("Stopping live detection because session became invalid.");
            liveDetection.current = false; // Ensure loop stops
        }
        return;
    }

    const startTime = Date.now();
    const ctx = capture(); // Capture the current frame

    if (ctx) {
      await runModelOnCtx(ctx); // Run model if capture successful
      setTotalTime(Date.now() - startTime); // Update total frame time
    } else {
      // console.warn("Skipped frame in live detection (capture failed).");
      setTotalTime(0); // Reset time if capture failed
      setInferenceTime(0);
    }

    // Request the next frame if still active
    if (liveDetection.current) {
      requestAnimationFrame(runLiveDetectionLoop);
    }
  }, [props.session, capture, runModelOnCtx]); // Dependencies

  // Function to start the live detection loop
  const startLiveDetection = useCallback(() => {
    if (liveDetection.current) return; // Already running
    if (!props.session) {
      console.error("Cannot start live detection: Model session not loaded.");
      alert("Model is not ready. Please wait or check console for errors.");
      return;
    }
    liveDetection.current = true;
    console.log("Starting live detection...");
    requestAnimationFrame(runLiveDetectionLoop); // Kick off the loop
  }, [props.session, runLiveDetectionLoop]);

  // Function to stop the live detection loop
  const stopLiveDetection = useCallback(() => {
    if (!liveDetection.current) return; // Already stopped
    console.log("Stopping live detection...");
    liveDetection.current = false;
  }, []);

  // Function to process a single captured image
  const processSingleImage = useCallback(async () => {
    stopLiveDetection(); // Ensure live detection is stopped

    if (!props.session) {
        alert("Model not ready. Cannot process image.");
        return;
    }

    const ctx = capture(); // Capture the current frame
    if (!ctx) {
      console.error("Failed to capture image for processing.");
      alert("Failed to capture image. Ensure webcam is working and permissions are granted.");
      return;
    }

    // No need for a separate processing canvas if postprocess clears and draws
    console.log("Processing single image...");
    const startTime = Date.now();
    await runModelOnCtx(ctx); // Run model on the main canvas context
    setTotalTime(Date.now() - startTime);
    console.log("Single image processing complete.");

  }, [stopLiveDetection, props.session, capture, runModelOnCtx]); // Dependencies

  // Function to clear the canvas overlay
  const resetCanvas = useCallback(() => {
    if (videoCanvasRef.current) {
      const context = videoCanvasRef.current.getContext('2d');
      if (context) {
        context.clearRect(0, 0, videoCanvasRef.current.width, videoCanvasRef.current.height);
      }
    }
  }, []);

  // Function to reset everything (stop detection, clear canvas, reset stats)
  const resetAll = useCallback(() => {
    stopLiveDetection();
    resetCanvas();
    setInferenceTime(0);
    setTotalTime(0);
  }, [stopLiveDetection, resetCanvas]);

  // Function to synchronize canvas overlay size with the video element size
  // Use useCallback to memoize it
  const setWebcamCanvasOverlaySize = useCallback(() => {
    if (!webcamRef.current || !webcamRef.current.video || !videoCanvasRef.current) {
      // console.warn("Refs not ready for setting size.");
      return;
    }
    const videoElement = webcamRef.current.video;
    const canvasElement = videoCanvasRef.current;

    // Use offsetWidth/Height as it reflects the *displayed* size of the video element
    const displayWidth = videoElement.offsetWidth;
    const displayHeight = videoElement.offsetHeight;

    if (displayWidth > 0 && displayHeight > 0) {
      // Only update if the size has actually changed
      if (canvasElement.width !== displayWidth || canvasElement.height !== displayHeight) {
        console.log(`Resizing canvas overlay to match video display: ${displayWidth}x${displayHeight}`);
        canvasElement.width = displayWidth;
        canvasElement.height = displayHeight;
        // No need for originalSize ref if we always clear full canvas
      }
    } else {
      // This might happen briefly during initial loading or if CSS hides the video
      // console.warn("Webcam dimensions reported as zero during size check.");
    }
  }, []); // No dependencies needed, relies on refs

  // Effect for initial setup and handling resize events
  useEffect(() => {
    const video = webcamRef.current?.video;
    if (video) {
      // Handler to call when video metadata (like dimensions) is loaded
      const handleLoadedMetadata = () => {
        console.log(`Video metadata loaded: ${video.videoWidth}x${video.videoHeight}`);
        setWebcamCanvasOverlaySize(); // Set initial size based on loaded video
      };
      // Handler for window resize events
      const handleResize = () => setWebcamCanvasOverlaySize();

      // Add event listeners
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('resize', handleResize); // Listen for video element resize too
      window.addEventListener('resize', handleResize); // Adjust canvas on window resize

      // Initial size set attempt in case metadata is already loaded
      if (video.readyState >= 1) { // HAVE_METADATA
        handleLoadedMetadata();
      }

      // Cleanup function: remove listeners when component unmounts
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('resize', handleResize);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [setWebcamCanvasOverlaySize]); // Re-run if the sizing function changes (it's memoized)

  // Effect to handle browser tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabHidden(document.hidden); // Update state based on visibility
      if (document.hidden) {
        console.log("Tab hidden, stopping live detection.");
        stopLiveDetection(); // Stop detection when tab is not visible
      } else {
        console.log("Tab visible.");
        // Optional: Auto-restart detection? Consider user experience.
        // if (/* some condition to auto-restart */) { startLiveDetection(); }
      }
    };

    // Set initial state based on current visibility
    setIsTabHidden(document.hidden);
    // Add listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup: remove listener and ensure detection stops on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopLiveDetection();
    };
  }, [stopLiveDetection]); // Dependency on stopLiveDetection

  // Render placeholder if tab is hidden
  if (isTabHidden) {
    return <div className="p-4 text-center text-gray-500">Detection paused. Activate this tab to resume.</div>;
  }

  // Main component render
  return (
    <div className="flex flex-col md:flex-row flex-wrap w-full justify-evenly items-center p-4 gap-4">
      {/* Webcam and Canvas Container */}
      <div
        id="webcam-container"
        className="relative flex items-center justify-center w-full md:w-auto" // Adjust width constraints
        style={{ maxWidth: '90vw', maxHeight: '70vh', border: '1px solid #ccc' }} // Added border for visual debugging
      >
        <Webcam
          mirrored={facingMode === 'user'}
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg" // Used by capture if taking screenshot, not directly used here
          imageSmoothing={true}
          videoConstraints={{
            facingMode: facingMode,
            width: { ideal: props.width },   // Request ideal dimensions
            height: { ideal: props.height },
            // frameRate: { ideal: 15 } // Optional: request lower frame rate
          }}
          className="block max-w-full max-h-full" // Make webcam responsive within container
          onUserMediaError={(err) => console.error("Webcam UserMedia Error:", err)}
          onUserMedia={() => console.log("Webcam UserMedia Success")}
        />
        <canvas
          id="cv1"
          ref={videoCanvasRef}
          // Position canvas exactly over the webcam view
          className="absolute top-0 left-0 w-full h-full" // Use w-full/h-full to match container
          style={{ zIndex: 10 }} // Ensure canvas is on top
        ></canvas>
      </div>

      {/* Controls and Stats Container */}
      <div className="flex flex-col items-center justify-center w-full md:w-auto mt-4">
        {/* Control Buttons */}
        <div className="flex flex-row flex-wrap items-center justify-center gap-2 m-2">
          {/* Button Group 1 */}
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-2">
            <button
              onClick={processSingleImage}
              className="p-2 border-2 border-dashed rounded-xl hover:bg-gray-100 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!props.session || liveDetection.current} // Disable if no session or live running
              title={!props.session ? "Model not loaded" : liveDetection.current ? "Stop live detection first" : "Capture and process single frame"}
            >
              Capture Photo
            </button>
            <button
              onClick={() => {
                if (liveDetection.current) {
                  stopLiveDetection();
                } else {
                  startLiveDetection();
                }
              }}
              className={`
                p-2 border-dashed border-2 rounded-xl hover:bg-gray-100 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                ${liveDetection.current ? 'bg-red-500 text-white border-red-700 hover:bg-red-600' : 'border-green-500 text-green-700 hover:bg-green-50'}
              `}
              disabled={!props.session} // Disable if no session
              title={!props.session ? "Model not loaded" : liveDetection.current ? "Stop live detection" : "Start live detection"}
            >
              {liveDetection.current ? 'Stop Detection' : 'Live Detection'}
            </button>
          </div>
          {/* Button Group 2 */}
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-2 mt-2 sm:mt-0">
            <button
              onClick={() => {
                resetAll(); // Reset view and stop detection first
                setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
              }}
              className="p-2 border-2 border-dashed rounded-xl hover:bg-gray-100 active:translate-y-0.5 transition-all"
              title="Switch between front and back camera"
            >
              Switch Camera
            </button>
            <button
              onClick={() => {
                resetAll(); // Reset before changing model
                props.changeCurrentModelResolution(); // Call parent function
              }}
              className="p-2 border-2 border-dashed rounded-xl hover:bg-gray-100 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!props.session || liveDetection.current} // Disable if no session or live running
              title={!props.session ? "Model not loaded" : liveDetection.current ? "Stop live detection first" : "Cycle to next model"}
            >
              Change Model
            </button>
            <button
              onClick={resetAll}
              className="p-2 border-2 border-dashed rounded-xl hover:bg-gray-100 active:translate-y-0.5 transition-all"
              title="Stop detection and clear drawings"
            >
              Reset View
            </button>
          </div>
        </div>

        {/* Model Info Display */}
        <div className="text-center mt-3 text-sm text-gray-700">
          <div>Using: <strong>{props.modelName}</strong></div>
          <div>Model Input: ({props.currentModelResolution[0]}x{props.currentModelResolution[1]})</div>
        </div>

        {/* Stats Display */}
        <div className="flex flex-row flex-wrap items-start justify-between w-full gap-4 px-5 mt-4 text-sm text-gray-600">
          <div>
            Model Inference: <strong className="text-white">{inferenceTime.toFixed(0)}ms</strong><br />
            Total Frame Time: <strong className="text-white">{totalTime.toFixed(0)}ms</strong><br />
            Preprocessing/Overhead: <strong className="text-white">{(totalTime - inferenceTime).toFixed(1)}ms</strong>
          </div>
          <div className="text-right">
            Est. Model FPS: <strong className="text-white">{(inferenceTime > 0 ? 1000 / inferenceTime : 0).toFixed(1)}</strong><br />
            Est. Total FPS: <strong className="text-white">{(totalTime > 0 ? 1000 / totalTime : 0).toFixed(1)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectDetectionCamera;