import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiCall, checkBackendHealth } from '../utils/api';
import './PestDetectionTab.css';

/**
 * Pest Detection Component
 * Provides advanced computer vision-based pest identification with bounding box visualization
 */
const PestDetectionTab = ({ user }) => {
  // Language context
  const { t } = useLanguage();
  
  // State management
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [detections, setDetections] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  
  // Refs
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  /**
   * Handles image file selection and creates preview
   */
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError(t('pestDetection.uploadError'));
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError(t('pestDetection.uploadError'));
      return;
    }

    setSelectedImage(file);
    setError(null);
    setDetections([]);
    setMetadata(null);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Runs pest detection on uploaded image
   */
  const runPestDetection = async () => {
    if (!selectedImage) {
      setError(t('pestDetection.imageError'));
      return;
    }

    setDetecting(true);
    setError(null);
    
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('image', selectedImage);

      console.log('🔍 Sending image for pest detection...');
      
      // Call pest detection endpoint
      const response = await apiCall('/api/yolo-detect', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData - let browser handle it
        }
      });

      if (response.success) {
        setDetections(response.detections || []);
        setMetadata(response.metadata || null);
        console.log(`✅ Detection completed: ${response.detections.length} pests found`);
      } else {
        throw new Error(response.message || t('pestDetection.uploadError'));
      }
      
    } catch (error) {
      console.error('❌ Pest detection failed:', error);
      const statusPart = error.status ? ` (HTTP ${error.status})` : '';
      if (error.message.includes('connect') || error.message.includes('fetch')) {
        checkBackendHealth().then(ok => {
          if (!ok) {
            setError(t('pestDetection.serverError') + ' (backend offline)' + statusPart);
          } else {
            setError(t('pestDetection.serverError') + statusPart);
          }
        });
      } else {
        setError((error.message || t('pestDetection.uploadError')) + statusPart);
      }
      setDetections([]);
      setMetadata(null);
    } finally {
      setDetecting(false);
    }
  };

  /**
   * Draws bounding boxes and labels on canvas overlay
   */
  const drawBoundingBoxes = useCallback(() => {
    if (!canvasRef.current || !imageRef.current || detections.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = imageRef.current;

    // Set canvas size to match image display size
    canvas.width = image.offsetWidth;
    canvas.height = image.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!showBoundingBoxes) return;

    // Calculate scaling factors
    const scaleX = canvas.width / metadata?.imageSize?.processed?.width || 1;
    const scaleY = canvas.height / metadata?.imageSize?.processed?.height || 1;

    // Draw bounding boxes
    detections.forEach((detection, index) => {
      const { bbox, class: pestClass, confidence } = detection;
      
      // Scale coordinates to display size
      const x = bbox.x * scaleX;
      const y = bbox.y * scaleY;
      const width = bbox.width * scaleX;
      const height = bbox.height * scaleY;

      // Set style based on confidence
      const color = getColorForPest(pestClass);
      
      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(x, y, width, height);

      // Draw filled background for label
      const label = `${pestClass} (${(confidence * 100).toFixed(1)}%)`;
      ctx.font = '12px Arial';
      const textMetrics = ctx.measureText(label);
      const textWidth = textMetrics.width + 8;
      const textHeight = 16;

      ctx.fillStyle = color;
      ctx.fillRect(x, y - textHeight, textWidth, textHeight);

      // Draw label text
      ctx.fillStyle = 'white';
      ctx.fillText(label, x + 4, y - 4);

      // Draw confidence indicator (small circle)
      ctx.beginPath();
      ctx.arc(x + width - 8, y + 8, 4, 0, 2 * Math.PI);
      ctx.fillStyle = confidence > 0.8 ? '#4CAF50' : confidence > 0.6 ? '#FF9800' : '#F44336';
      ctx.fill();
    });
  }, [detections, showBoundingBoxes, metadata]);

  /**
   * Returns color for pest class
   */
  const getColorForPest = (pestClass) => {
    const colors = {
      'aphids': '#FF6B6B',
      'caterpillar': '#4ECDC4',
      'corn_borer': '#45B7D1',
      'cricket': '#96CEB4',
      'grasshopper': '#FFEAA7',
      'leaf_beetle': '#DDA0DD',
      'stem_borer': '#98D8C8',
      'thrips': '#F7DC6F',
      'whitefly': '#BB8FCE',
      'spider_mites': '#85C1E9',
      'army_worm': '#F8C471',
      'cutworm': '#82E0AA',
      'bollworm': '#F1948A',
      'fruit_fly': '#85C1E9',
      'scale_insects': '#D2B4DE'
    };
    return colors[pestClass] || '#FF5722';
  };

  /**
   * Effect to redraw bounding boxes when data changes
   */
  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      drawBoundingBoxes();
    }
  }, [detections, showBoundingBoxes, metadata, drawBoundingBoxes]);

  /**
   * Handle image load to trigger bounding box drawing
   */
  const handleImageLoad = () => {
    drawBoundingBoxes();
  };

  /**
   * Clears all data and resets component
   */
  const clearAll = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setDetections([]);
    setMetadata(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="pest-root">

      {/* Header */}
      <div className="detection-header">
        <h1 className="header-title">
          🔍 {t('pestDetection.title')}
        </h1>
        <p className="header-subtitle">
          {t('pestDetection.captureHint')}
        </p>
      </div>

      {/* Image Upload Section */}
      <div className={`upload-section ${selectedImage ? 'has-image' : ''}`}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/jpeg,image/png,image/jpg"
          style={{ display: 'none' }}
        />
        
        {!previewUrl ? (
          <div>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📷</div>
            <p style={{ marginBottom: '20px', color: '#6c757d' }}>
              {t('pestDetection.selectImage')}
            </p>
            <button
              className="upload-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={detecting}
            >
              {t('pestDetection.uploadImage')}
            </button>
            <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '10px' }}>
              {t('pestDetection.dragDrop')}
            </p>
          </div>
        ) : (
          <div className="image-preview-container">
            <img
              ref={imageRef}
              src={previewUrl}
              alt="Selected crop"
              className="preview-image"
              onLoad={handleImageLoad}
            />
            <canvas
              ref={canvasRef}
              className="bounding-box-canvas"
            />
          </div>
        )}
      </div>

      {/* Controls */}
      {selectedImage && (
        <div className="controls-section">
          <button
            className="detect-button"
            onClick={runPestDetection}
            disabled={detecting || !selectedImage}
          >
            {detecting ? (
              <>
                <div className="loading-spinner" />
                {t('pestDetection.processing')}
              </>
            ) : (
              <>
                🤖 {t('pestDetection.runDetection')}
              </>
            )}
          </button>

          {detections.length > 0 && (
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={showBoundingBoxes}
                onChange={(e) => setShowBoundingBoxes(e.target.checked)}
              />
              {t('pestDetection.boundingBoxes')}
            </label>
          )}

          <button className="clear-button" onClick={clearAll}>
            {t('pestDetection.clear')}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* Results Section */}
      {detections.length > 0 && (
        <div className="results-section">
          <div className="detection-results">
            <h2 className="results-header">
              🐛 {t('pestDetection.detectionResult')} ({detections.length} {t('pestDetection.pestsFound')})
            </h2>

            {detections.map((detection, index) => (
              <div key={index} className="detection-item">
                <div className="detection-header-item">
                  <span className="pest-name">{detection.class}</span>
                  <span className={`confidence-badge ${
                    detection.confidence > 0.8 ? 'high' : 
                    detection.confidence > 0.6 ? 'medium' : 'low'
                  }`}>
                    {(detection.confidence * 100).toFixed(1)}% {t('pestDetection.confidenceScore')}
                  </span>
                </div>
                <p className="pest-description">{detection.description}</p>
              </div>
            ))}

            {/* Metadata */}
            {metadata && (
              <div className="metadata-section">
                <div className="metadata-grid">
                  <div className="metadata-item">
                    <span className="metadata-label">Model:</span> {metadata.modelType}
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Inference Time:</span> {metadata.inferenceTime}
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Confidence Threshold:</span> {(metadata.thresholds?.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Processing Size:</span> {metadata.imageSize?.processed?.width}×{metadata.imageSize?.processed?.height}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Detections Message */}
      {!detecting && detections.length === 0 && selectedImage && !error && (
        <div className="no-detections">
          🌱 {t('pestDetection.noPestsDetected')}
        </div>
      )}
    </div>
  );
};

export default PestDetectionTab;