c# Real-time Object Detection Web App

This project is a web-based application that utilizes real-time object detection to identify and label objects within an image or video stream. It is built using Next.js, ONNXRuntime, YOLOv7, and YOLOv10 model.


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

In order to run this project, you will need to have the following software installed on your machine:

- Node.js
- A web browser

### Installation

1. Clone the repository to your local machine:

```
https://github.com/Aashutosh-Mishra/Object-Detection.git
```

2. Navigate to the project directory:

```
cd Object-Detection
```

3. Install the necessary dependencies by running:

```
npm install
# or
yarn install
```

4. Start the development server by running:

```
npm run dev
# or
yarn dev
```

5. Open your web browser and navigate to http://localhost:3000 to view the application.

### Adding Custom Models

1. Add your custom model to the `/models` directory.
2. Update the `RES_TO_MODEL` constant in `components/models/Yolo.tsx` to include your model's resolution and path.
3. Modify the `preprocess` and `postprocess` functions in `components/models/Yolo.tsx` to match the input and output requirements of your model.
4. If you encounter `protobuff error` while loading your `.onnx` model, your model may not be optimised for `onnxruntime webassembly`. Convert your model to `.ort` or optimised `.onnx` using [onnxruntime](https://onnxruntime.ai/docs/performance/model-optimizations/ort-format-models.html). See [ultralytics_pt_to_onnx.md](./ultralytics_pt_to_onnx.md) for example.

### Installation as PWA

This app can also be installed on your device (desktop or mobile) as a progressive web app (PWA). Here's how:

1. Visit the app's URL in a web browser that supports PWAs (such as Google Chrome or Firefox).
2. Look for the "Install" or "Add to Homescreen" button in the browser's interface.
3. Click the button and follow the prompts to install the app.
4. The app will now be installed on your device and can be launched from the homescreen like any other app.

### Deployment

This project can be deployed to a web server for public access. For more information on deploying a Next.js application, please visit the official [documentation](https://nextjs.org/docs/deployment/)

## Built With

- [ONNXRuntime](https://onnxruntime.ai/) - An open-source project for running inferences using pre-trained models in a variety of formats.
- [YOLOv10](https://github.com/THU-MIG/yolov10) - An Object detection model which is used in this project.
- [YOLOv7](https://github.com/WongKinYiu/yolov7) - An Object detection model which is used in this project.
- [Next.js](https://nextjs.org/) - A JavaScript framework for building server-rendered React applications.
- [PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) - A progressive web app that can be installed on a user's device and run offline, providing a native-like experience.

## Contributing

If you want to contribute to this project, please feel free to submit a pull request. Any contributions, big or small, are greatly appreciated!

