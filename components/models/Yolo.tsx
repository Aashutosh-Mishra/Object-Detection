// components/Yolo.tsx
import ndarray from 'ndarray';
import { Tensor, InferenceSession } from 'onnxruntime-web';
import ops from 'ndarray-ops';
import ObjectDetectionCamera from '../ObjectDetectionCamera'; // Corrected path
import { round } from 'lodash';
import { yoloClasses } from '../../data/yolo_classes'; // Corrected path
import { useState, useEffect } from 'react';
import { runModelUtils } from '../../utils'; // Corrected path

// Define the available models and their resolutions
const RES_TO_MODEL: [number[], string][] = [
  [[640, 640], 'yolov10n.onnx'], // Example: Assuming YOLOv10 runs at 640x640
  [[256, 256], 'yolov7-tiny_256x256.onnx'],
  [[320, 320], 'yolov7-tiny_320x320.onnx'],
  [[640, 640], 'yolov7-tiny_640x640.onnx'],
];

// Set the initial model index (e.g., 1 for yolov7-tiny_256x256.onnx)
const INITIAL_MODEL_INDEX = 1;

// Default props if needed, or define expected props interface
interface YoloProps {
    width?: number; // Optional width for the camera component display
    height?: number; // Optional height for the camera component display
}

const Yolo = (props: YoloProps) => {
  const [modelResolution, setModelResolution] = useState<number[]>(
    RES_TO_MODEL[INITIAL_MODEL_INDEX][0]
  );
  const [modelName, setModelName] = useState<string>(
    RES_TO_MODEL[INITIAL_MODEL_INDEX][1]
  );
  const [session, setSession] = useState<InferenceSession | null>(null);
  const [loadingModel, setLoadingModel] = useState<boolean>(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Effect to load the ONNX model session when the modelName changes
  useEffect(() => {
    setLoadingModel(true);
    setErrorState(null);
    setSession(null); // Clear previous session

    const getSession = async () => {
      try {
        // Assuming models are in the /public/models/ directory
        const modelPath = `/models/${modelName}`;
        console.log(`Loading model: ${modelPath}`);
        // Use the utility function from runModel.ts
        const newSession = await runModelUtils.createModelCpu(modelPath);
        setSession(newSession);
        setErrorState(null); // Clear any previous error
      } catch (err:any) {
        console.error('Failed to load model:', err);
        setErrorState(`Failed to load model ${modelName}: ${err.message || String(err)}`);
        setSession(null); // Ensure session is null on error
      } finally{
        setLoadingModel(false); // Stop loading indicator regardless of success/failure
      }
    };

    getSession();

    // Optional cleanup
    // return () => {
    //   session?.release().catch(e => console.error("Error releasing session:", e));
    // };
  }, [modelName]); // Re-run effect when modelName changes

  // Function to change the model based on index
  const changeModel = (index: number) => {
    if (index >= 0 && index < RES_TO_MODEL.length) {
        setModelResolution(RES_TO_MODEL[index][0]);
        setModelName(RES_TO_MODEL[index][1]);
    } else {
        console.error("Invalid index for changing model:", index);
    }
  };

  // Function to cycle through available models
  const changeModelResolution = () => {
    const currentIndex = RES_TO_MODEL.findIndex(
      (item) => item[1] === modelName &&
                 item[0][0] === modelResolution[0] &&
                 item[0][1] === modelResolution[1]
    );
    const nextIndex = (currentIndex + 1) % RES_TO_MODEL.length;
    changeModel(nextIndex);
  };

  // Utility to resize a canvas context
  const resizeCanvasCtx = (
    ctx: CanvasRenderingContext2D,
    targetWidth: number,
    targetHeight: number
  ): CanvasRenderingContext2D => {
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const newCtx = canvas.getContext('2d');
    if (!newCtx) {
        throw new Error("Failed to get 2D context from temporary canvas for resizing.");
    }
    newCtx.drawImage(
        ctx.canvas,
        0, 0, ctx.canvas.width, ctx.canvas.height,
        0, 0, targetWidth, targetHeight
    );
    return newCtx;
  };

  // Preprocessing function
  const preprocess = (ctx: CanvasRenderingContext2D): Tensor => {
    if (!modelResolution || modelResolution.length !== 2 || modelResolution[0] <= 0 || modelResolution[1] <= 0) {
      console.error("Invalid model resolution for preprocessing:", modelResolution);
      throw new Error("Invalid model resolution during preprocessing.");
    }
    const [targetWidth, targetHeight] = modelResolution;
    const resizedCtx = resizeCanvasCtx(ctx, targetWidth, targetHeight);
    const imageData = resizedCtx.getImageData(0, 0, targetWidth, targetHeight);
    const { data } = imageData;
    const dataTensor = ndarray(new Float32Array(data), [targetHeight, targetWidth, 4]);
    const dataProcessedTensor = ndarray(new Float32Array(targetWidth * targetHeight * 3), [
      1, 3, targetHeight, targetWidth,
    ]);
    ops.assign(dataProcessedTensor.pick(0, 0, null, null), dataTensor.pick(null, null, 0));
    ops.assign(dataProcessedTensor.pick(0, 1, null, null), dataTensor.pick(null, null, 1));
    ops.assign(dataProcessedTensor.pick(0, 2, null, null), dataTensor.pick(null, null, 2));
    ops.divseq(dataProcessedTensor, 255.0);
    const inputTensor = new Tensor('float32', dataProcessedTensor.data, [
      1, 3, targetHeight, targetWidth,
    ]);
    return inputTensor;
  };

  // Utility to convert confidence score to color
  const conf2color = (conf: number): string => {
    const clampedConf = Math.max(0, Math.min(1, conf));
    const r = Math.round(255 * (1 - clampedConf));
    const g = Math.round(255 * clampedConf);
    return `rgb(${r},${g},0)`;
  };

  // Function to save detection results via API
  const saveDetectionResults = async (detectedItems: { label: string; confidence: number }[]) => {
    if (!detectedItems || detectedItems.length === 0) {
        // console.log("No detections to save."); // Optional: reduce console noise
        return;
    }
    try {
        const res = await fetch('/api/detections', { // Use the API route created earlier
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                modelUsed: modelName, // Pass current model name
                detections: detectedItems,
            }),
        });
        const data = await res.json();
        if (!res.ok) {
            console.error('Failed to save detection:', data.message || `Error ${res.status}`);
        } else {
            // console.log('Detection saved successfully:', data.detectionId); // Optional success log
        }
    } catch (error) {
        console.error('Error saving detection via fetch:', error);
    }
  };

  // Postprocessing function
  const postprocess = (
    tensor: Tensor | null,
    inferenceTime: number,
    ctx: CanvasRenderingContext2D,
    currentModelName: string
  ): void => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (!tensor || !tensor.data || !tensor.dims || tensor.data.length === 0) {
      ctx.font = '16px Arial';
      ctx.fillStyle = 'orange';
      ctx.fillText('No detections or inference error.', 10, 30);
      return;
    }
    if (!modelResolution || modelResolution.length !== 2 || modelResolution[0] <= 0 || modelResolution[1] <= 0) {
       ctx.font = '16px Arial';
       ctx.fillStyle = 'red';
       ctx.fillText('Error: Invalid model resolution for postprocessing.', 10, 30);
       return;
    }

    let itemsToSave: { label: string; confidence: number }[] = []; // Array to hold detections for saving

    try {
      if (currentModelName === 'yolov10n.onnx') {
        if (tensor.dims.length !== 3 || tensor.dims[0] !== 1 || tensor.dims[2] !== 6) {
           throw new Error(`Invalid YOLOv10 output shape: Expected [1, N, 6], Got [${tensor.dims.join(', ')}]`);
        }
        itemsToSave = postprocessYolov10(ctx, modelResolution, tensor, conf2color); // Get detections from postprocess

      } else if (currentModelName.startsWith('yolov7-tiny')) {
        if (tensor.dims.length !== 2 || tensor.dims[1] !== 7) {
           throw new Error(`Invalid YOLOv7 output shape: Expected [N, 7], Got [${tensor.dims.join(', ')}]`);
        }
        itemsToSave = postprocessYolov7(ctx, modelResolution, tensor, conf2color); // Get detections from postprocess

      } else {
        ctx.font = '16px Arial';
        ctx.fillStyle = 'orange';
        ctx.fillText(`Postprocessing logic missing for ${currentModelName}.`, 10, 30);
      }
    } catch (error: any) {
      console.error("Error during postprocessing:", error);
      ctx.font = '16px Arial';
      ctx.fillStyle = 'red';
      ctx.fillText(`Postprocessing Error: ${error.message || String(error)}`, 10, 30);
      if (tensor?.dims) {
        ctx.fillText(`Tensor shape: [${tensor.dims.join(', ')}]`, 10, 55);
      }
    }

    // Save detections if any were found and processed
    if (itemsToSave.length > 0) {
        saveDetectionResults(itemsToSave);
    }
  };

  // Conditional rendering
  if (loadingModel) {
    return <div className="p-4 text-center">Loading model ({modelName})... Please wait.</div>;
  }
  if (errorState) {
    return <div className="p-4 text-red-600 bg-red-100 border border-red-600 rounded">Error: {errorState}</div>;
  }
  if (!session) {
    return <div className="p-4 text-orange-600 bg-orange-100 border border-orange-600 rounded">Model session is not available. Check console logs for errors during loading.</div>;
  }

  // Render the camera component
  return (
    <ObjectDetectionCamera
      width={props.width || 640}
      height={props.height || 480}
      preprocess={preprocess}
      postprocess={postprocess}
      session={session}
      changeCurrentModelResolution={changeModelResolution}
      currentModelResolution={modelResolution}
      modelName={modelName}
    />
  );
};

export default Yolo;

// --- Helper functions for specific model postprocessing ---
// Modified to RETURN the list of detections for saving

function postprocessYolov10(
  ctx: CanvasRenderingContext2D,
  modelResolution: number[],
  tensor: Tensor,
  conf2color: (conf: number) => string,
  confidenceThreshold = 0.25
): { label: string; confidence: number }[] { // Return type added
  const numDetections = tensor.dims[1];
  const detectionSize = tensor.dims[2];
  const scaleX = ctx.canvas.width / modelResolution[0];
  const scaleY = ctx.canvas.height / modelResolution[1];
  const tensorData = tensor.data as Float32Array;
  const detectionsToSave: { label: string; confidence: number }[] = []; // Initialize return array

  for (let i = 0; i < numDetections; i++) {
    const startIndex = i * detectionSize;
    const [x0, y0, x1, y1, score, cls_id_float] = tensorData.slice(startIndex, startIndex + detectionSize);

    if (score < confidenceThreshold) continue;
    const cls_id = Math.round(cls_id_float);
    if (cls_id < 0 || cls_id >= yoloClasses.length) continue;

    const drawX = Math.round(x0 * scaleX);
    const drawY = Math.round(y0 * scaleY);
    const drawW = Math.round((x1 - x0) * scaleX);
    const drawH = Math.round((y1 - y0) * scaleY);
    if (drawW <= 0 || drawH <= 0) continue;

    const roundedScore = round(score * 100, 1);
    const labelText = yoloClasses[cls_id] || `Class ${cls_id}`;
    const label = `${labelText} ${roundedScore}%`;
    const color = conf2color(score);

    // Add to save list
    detectionsToSave.push({ label: labelText, confidence: score });

    // Drawing logic (same as before)
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(drawX, drawY, drawW, drawH);
    ctx.fillStyle = color;
    ctx.font = '16px Arial';
    const textMetrics = ctx.measureText(label);
    const textWidth = textMetrics.width;
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    const backgroundHeight = textHeight > 18 ? textHeight + 4 : 20;
    const backgroundY = drawY - backgroundHeight;
    ctx.fillRect(drawX, backgroundY, textWidth + 10, backgroundHeight);
    ctx.fillStyle = 'black';
    ctx.fillText(label, drawX + 5, drawY - 5);
  }
  return detectionsToSave; // Return the collected detections
}

function postprocessYolov7(
  ctx: CanvasRenderingContext2D,
  modelResolution: number[],
  tensor: Tensor,
  conf2color: (conf: number) => string,
  confidenceThreshold = 0.25
): { label: string; confidence: number }[] { // Return type added
  const numDetections = tensor.dims[0];
  const detectionSize = tensor.dims[1];
  const scaleX = ctx.canvas.width / modelResolution[0];
  const scaleY = ctx.canvas.height / modelResolution[1];
  const tensorData = tensor.data as Float32Array;
  const detectionsToSave: { label: string; confidence: number }[] = []; // Initialize return array

  for (let i = 0; i < numDetections; i++) {
    const startIndex = i * detectionSize;
    const [batch_id, x0, y0, x1, y1, cls_id_float, score] = tensorData.slice(startIndex, startIndex + detectionSize);

    if (score < confidenceThreshold) continue;
    const cls_id = Math.round(cls_id_float);
    if (cls_id < 0 || cls_id >= yoloClasses.length) continue;

    const drawX = Math.round(x0 * scaleX);
    const drawY = Math.round(y0 * scaleY);
    const drawW = Math.round((x1 - x0) * scaleX);
    const drawH = Math.round((y1 - y0) * scaleY);
    if (drawW <= 0 || drawH <= 0) continue;

    const roundedScore = round(score * 100, 1);
    const labelText = yoloClasses[cls_id] || `Class ${cls_id}`;
    const label = `${labelText} ${roundedScore}%`;
    const color = conf2color(score);

     // Add to save list
    detectionsToSave.push({ label: labelText, confidence: score });

    // Drawing logic (same as before)
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(drawX, drawY, drawW, drawH);
    ctx.fillStyle = color;
    ctx.font = '16px Arial';
    const textMetrics = ctx.measureText(label);
    const textWidth = textMetrics.width;
    const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    const backgroundHeight = textHeight > 18 ? textHeight + 4 : 20;
    const backgroundY = drawY - backgroundHeight;
    ctx.fillRect(drawX, backgroundY, textWidth + 10, backgroundHeight);
    ctx.fillStyle = 'black';
    ctx.fillText(label, drawX + 5, drawY - 5);
  }
   return detectionsToSave; // Return the collected detections
}