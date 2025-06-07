// utils/runModel.ts
import * as ort from 'onnxruntime-web';

ort.env.wasm.wasmPaths = "/wasm/";

export async function createModelCpu(url: string): Promise<ort.InferenceSession> {
  console.log(`Attempting to load model from: ${url}`);
  try {
    const session = await ort.InferenceSession.create(url, {
      executionProviders: ["wasm"],
    });
    console.log("Model loaded successfully:", url);
    return session;
  } catch (e) {
    console.error(`Failed to create InferenceSession for ${url}:`, e);
    throw e;
  }
}

export async function runModel(
  model: ort.InferenceSession,
  preprocessedData: ort.Tensor
): Promise<[ort.Tensor, number]> {
  if (!model) throw new Error("Model session is not initialized.");
  if (!preprocessedData) throw new Error("Preprocessed data is invalid or null.");

  if (!model.inputNames || model.inputNames.length === 0)
    throw new Error("Model definition issue: No input names found.");

  if (!model.outputNames || model.outputNames.length === 0)
    throw new Error("Model definition issue: No output names found.");

  try {
    const feeds: Record<string, ort.Tensor> = {};
    const inputName = model.inputNames[0];
    feeds[inputName] = preprocessedData;

    console.log(`Running inference with input "${inputName}"...`);
    const start = Date.now();
    const outputData = await model.run(feeds);
    const end = Date.now();

    const inferenceTime = end - start;
    const outputName = model.outputNames[0];
    const output = outputData[outputName];

    if (!output) {
      throw new Error(`Output tensor '${outputName}' not found in model results.`);
    }

    console.log("Output tensor shape:", output.dims);
    return [output, inferenceTime];
  } catch (e) {
    console.error("Model run failed:", e);
    console.error("Input tensor details on failure:", {
      type: preprocessedData.type,
      dims: preprocessedData.dims,
    });
    throw new Error(`Model run failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}
