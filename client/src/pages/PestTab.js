import React, { useState, useRef } from 'react';
import { API } from '../utils/api';

const PestTab = ({ user }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Clear previous results
      setResult(null);
    }
  };

  const analyzePest = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('userDistrict', user?.district || 'Punjab');

      const response = await API.post('/detect-pest', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
    } catch (error) {
      console.error('Pest detection error:', error);
      setResult({
        error: 'Failed to analyze the image. Please try again.',
        confidence: 0
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const takePhoto = () => {
    // This would integrate with camera API in a real mobile app
    // For now, we'll just trigger the file input
    fileInputRef.current?.click();
  };

  const commonPests = [
    {
      name: 'Aphids',
      description: 'Small insects that suck plant sap',
      symptoms: ['Yellow/curled leaves', 'Sticky honeydew', 'Stunted growth'],
      treatment: 'Neem oil spray, ladybugs, insecticidal soap'
    },
    {
      name: 'Leaf Blight',
      description: 'Fungal disease affecting leaves',
      symptoms: ['Brown spots on leaves', 'Yellowing', 'Leaf drop'],
      treatment: 'Copper-based fungicides, proper spacing, avoid overhead watering'
    },
    {
      name: 'Stem Borer',
      description: 'Larvae that bore into plant stems',
      symptoms: ['Holes in stems', 'Wilting', 'Dead hearts'],
      treatment: 'Pheromone traps, biological control, resistant varieties'
    },
    {
      name: 'Root Rot',
      description: 'Fungal infection of root system',
      symptoms: ['Yellowing leaves', 'Wilting despite moist soil', 'Brown/black roots'],
      treatment: 'Improve drainage, fungicide treatment, crop rotation'
    }
  ];

  return (
    <div className="pest-container">
      <div className="pest-header">
        <h2>
          <i className="fas fa-bug"></i>
          Pest & Disease Detection
        </h2>
        <p>Upload a photo of your crop to get instant pest and disease identification</p>
      </div>

      {/* Image Upload Section */}
      <div className="upload-section">
        <div className="upload-card">
          {!previewUrl ? (
            <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
              <i className="fas fa-camera" style={{ fontSize: '3rem', color: '#4CAF50', marginBottom: '20px' }}></i>
              <h3>Take or Upload Photo</h3>
              <p>Capture your crop's leaves, stems, or affected areas</p>
              <div className="upload-buttons">
                <button className="upload-btn camera" onClick={takePhoto}>
                  <i className="fas fa-camera"></i>
                  Take Photo
                </button>
                <button className="upload-btn gallery" onClick={() => fileInputRef.current?.click()}>
                  <i className="fas fa-image"></i>
                  Choose from Gallery
                </button>
              </div>
            </div>
          ) : (
            <div className="image-preview">
              <img src={previewUrl} alt="Crop for analysis" />
              <div className="image-actions">
                <button onClick={analyzePest} disabled={analyzing} className="analyze-btn">
                  {analyzing ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-search"></i>
                      Analyze Image
                    </>
                  )}
                </button>
                <button onClick={clearImage} className="clear-btn">
                  <i className="fas fa-times"></i>
                  Clear
                </button>
              </div>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>

        {/* Analysis Results */}
        {result && (
          <div className="results-card">
            {result.error ? (
              <div className="error-result">
                <i className="fas fa-exclamation-triangle"></i>
                <p>{result.error}</p>
              </div>
            ) : (
              <div className="analysis-result">
                <div className="result-header">
                  <h3>
                    <i className="fas fa-microscope"></i>
                    Analysis Results
                  </h3>
                  <div className="confidence-score">
                    Confidence: {Math.round(result.confidence * 100)}%
                  </div>
                </div>

                <div className="pest-info">
                  <h4>{result.pestName || 'Unknown Pest/Disease'}</h4>
                  <p className="pest-description">{result.description}</p>
                  
                  {result.severity && (
                    <div className={`severity-badge ${result.severity.toLowerCase()}`}>
                      <i className="fas fa-exclamation-circle"></i>
                      Severity: {result.severity}
                    </div>
                  )}
                </div>

                {result.symptoms && (
                  <div className="symptoms-section">
                    <h5>
                      <i className="fas fa-list-ul"></i>
                      Symptoms
                    </h5>
                    <ul>
                      {result.symptoms.map((symptom, index) => (
                        <li key={index}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.treatment && (
                  <div className="treatment-section">
                    <h5>
                      <i className="fas fa-medkit"></i>
                      Recommended Treatment
                    </h5>
                    <div className="treatment-content">
                      {typeof result.treatment === 'string' ? (
                        <p>{result.treatment}</p>
                      ) : (
                        <ul>
                          {result.treatment.map((treatment, index) => (
                            <li key={index}>{treatment}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {result.prevention && (
                  <div className="prevention-section">
                    <h5>
                      <i className="fas fa-shield-alt"></i>
                      Prevention Tips
                    </h5>
                    <ul>
                      {result.prevention.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Common Pests Guide */}
      <div className="common-pests-section">
        <h3>
          <i className="fas fa-book"></i>
          Common Pests & Diseases in Punjab
        </h3>
        <div className="pests-grid">
          {commonPests.map((pest, index) => (
            <div key={index} className="pest-card">
              <h4>{pest.name}</h4>
              <p className="pest-desc">{pest.description}</p>
              
              <div className="symptoms">
                <h5>Symptoms:</h5>
                <ul>
                  {pest.symptoms.map((symptom, idx) => (
                    <li key={idx}>{symptom}</li>
                  ))}
                </ul>
              </div>
              
              <div className="treatment">
                <h5>Treatment:</h5>
                <p>{pest.treatment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .pest-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .pest-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .pest-header h2 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #2E7D32;
          margin: 0 0 15px 0;
        }

        .pest-header p {
          color: #666;
          font-size: 1.1rem;
          margin: 0;
        }

        .upload-section {
          margin-bottom: 50px;
        }

        .upload-card {
          background: white;
          border-radius: 15px;
          padding: 40px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .upload-area {
          text-align: center;
          border: 3px dashed #4CAF50;
          border-radius: 15px;
          padding: 60px 40px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upload-area:hover {
          border-color: #2E7D32;
          background: #F8FFF8;
        }

        .upload-area h3 {
          color: #2E7D32;
          margin: 0 0 10px 0;
          font-size: 1.5rem;
        }

        .upload-area p {
          color: #666;
          margin: 0 0 30px 0;
        }

        .upload-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
        }

        .upload-btn {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 15px 25px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .upload-btn:hover {
          background: #45a049;
          transform: translateY(-2px);
        }

        .upload-btn.gallery {
          background: #2196F3;
        }

        .upload-btn.gallery:hover {
          background: #1976D2;
        }

        .image-preview {
          text-align: center;
        }

        .image-preview img {
          max-width: 100%;
          max-height: 400px;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          margin-bottom: 20px;
        }

        .image-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .analyze-btn {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .analyze-btn:hover:not(:disabled) {
          background: #45a049;
          transform: translateY(-2px);
        }

        .analyze-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .clear-btn {
          background: #f44336;
          color: white;
          border: none;
          padding: 15px 25px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .clear-btn:hover {
          background: #d32f2f;
        }

        .results-card {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .error-result {
          text-align: center;
          color: #f44336;
        }

        .error-result i {
          font-size: 2rem;
          margin-bottom: 15px;
        }

        .analysis-result {
          
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          border-bottom: 2px solid #E8F5E8;
          padding-bottom: 15px;
        }

        .result-header h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #2E7D32;
          margin: 0;
        }

        .confidence-score {
          background: #E8F5E8;
          color: #2E7D32;
          padding: 8px 15px;
          border-radius: 20px;
          font-weight: bold;
        }

        .pest-info h4 {
          color: #2E7D32;
          margin: 0 0 10px 0;
          font-size: 1.3rem;
        }

        .pest-description {
          color: #666;
          margin: 0 0 15px 0;
          font-size: 1.1rem;
        }

        .severity-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 15px;
          border-radius: 20px;
          font-weight: bold;
          margin-bottom: 20px;
        }

        .severity-badge.low {
          background: #E8F5E8;
          color: #2E7D32;
        }

        .severity-badge.medium {
          background: #FFF3E0;
          color: #E65100;
        }

        .severity-badge.high {
          background: #FFEBEE;
          color: #c62828;
        }

        .symptoms-section,
        .treatment-section,
        .prevention-section {
          margin: 25px 0;
        }

        .symptoms-section h5,
        .treatment-section h5,
        .prevention-section h5 {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #2E7D32;
          margin: 0 0 15px 0;
        }

        .symptoms-section ul,
        .treatment-section ul,
        .prevention-section ul {
          list-style-type: none;
          padding: 0;
          margin: 0;
        }

        .symptoms-section li,
        .treatment-section li,
        .prevention-section li {
          background: #f8f9fa;
          padding: 10px 15px;
          margin: 8px 0;
          border-radius: 8px;
          border-left: 4px solid #4CAF50;
        }

        .treatment-content p {
          background: #E8F5E8;
          padding: 15px;
          border-radius: 8px;
          color: #2E7D32;
          margin: 0;
        }

        .common-pests-section {
          margin-top: 50px;
        }

        .common-pests-section h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #2E7D32;
          margin: 0 0 30px 0;
        }

        .pests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .pest-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }

        .pest-card:hover {
          transform: translateY(-5px);
        }

        .pest-card h4 {
          color: #2E7D32;
          margin: 0 0 10px 0;
        }

        .pest-desc {
          color: #666;
          margin: 0 0 20px 0;
        }

        .pest-card .symptoms,
        .pest-card .treatment {
          margin: 15px 0;
        }

        .pest-card h5 {
          color: #2E7D32;
          margin: 0 0 10px 0;
          font-size: 0.9rem;
        }

        .pest-card ul {
          list-style-type: disc;
          padding-left: 20px;
          margin: 0;
        }

        .pest-card li {
          color: #666;
          margin: 5px 0;
        }

        .pest-card .treatment p {
          color: #666;
          margin: 0;
        }

        @media (max-width: 768px) {
          .upload-card {
            padding: 30px 20px;
          }

          .upload-area {
            padding: 40px 20px;
          }

          .upload-buttons {
            flex-direction: column;
            align-items: center;
          }

          .image-actions {
            flex-direction: column;
            align-items: center;
          }

          .result-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }

          .pests-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PestTab;