# YOLOv8 Pest Detection Model

## Model Requirements

Place your trained YOLOv8 pest detection model in this directory with the name:
`yolov8_pest_detection.onnx`

## Model Specifications

- **Input Size**: 640x640 pixels
- **Format**: ONNX
- **Classes**: 15 pest categories (aphids, caterpillar, corn_borer, etc.)
- **Input Format**: Float32 tensor [1, 3, 640, 640] (CHW format)
- **Output Format**: Detection tensor with bounding boxes and class probabilities

## Training Data

The model should be trained on agricultural pest images with the following classes:
- aphids
- caterpillar  
- corn_borer
- cricket
- grasshopper
- leaf_beetle
- stem_borer
- thrips
- whitefly
- spider_mites
- army_worm
- cutworm
- bollworm
- fruit_fly
- scale_insects

## Model Conversion

If you have a PyTorch YOLOv8 model, convert it to ONNX format:

```python
from ultralytics import YOLO

# Load trained model
model = YOLO('path/to/your/trained_model.pt')

# Export to ONNX
model.export(format='onnx', imgsz=640, dynamic=False)
```

## Usage

Once the model is placed in this directory, the API endpoint `/api/yolo-detect` will automatically load and use it for pest detection.