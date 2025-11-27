import { useState } from 'react';
import { Button, Card, Badge } from './ui';
import './styles.css';

export default function ImageForm() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [styledImages, setStyledImages] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState('upload'); // upload, style-selection, fullscreen-analysis

  const styles = ['Professional', 'Casual', 'Streetwear', 'Dinner'];

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result);
      setUploadedImageUrl(URL.createObjectURL(file));
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // Generate 4 styled versions
  const generateStyledVersions = async () => {
    if (!uploadedImage) return;

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      const stylePromises = styles.map(async (style) => {
        const response = await fetch('/api/generate-styled-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            imageData: uploadedImage,
            style: style
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to generate ${style} style`);
        }

        const data = await response.json();
        return {
          style: style,
          imageUrl: data.imageUrl
        };
      });

      const results = await Promise.all(stylePromises);
      setStyledImages(results);
      setCurrentStep('style-selection');
    } catch (err) {
      setError(err.message || 'Failed to generate styled images');
    } finally {
      setLoading(false);
    }
  };

  // Handle style selection
  const handleStyleSelect = async (styleObj) => {
    setSelectedStyle(styleObj);
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          imageUrl: styleObj.imageUrl,
          style: styleObj.style
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const data = await response.json();
      setAnalysisResult(data);
      setCurrentStep('fullscreen-analysis');
    } catch (err) {
      setError(err.message || 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  // Reset to start over
  const handleReset = () => {
    setUploadedImage(null);
    setUploadedImageUrl('');
    setStyledImages([]);
    setSelectedStyle(null);
    setAnalysisResult(null);
    setCurrentStep('upload');
    setError('');
  };

  // Render upload step
  if (currentStep === 'upload') {
    return (
      <div className="image-form-container">
        <Card className="form-card">
          <h2 className="form-title">
            <span className="title-icon">📸</span>
            Upload Your Fashion Photo
          </h2>
          <p className="form-subtitle">
            Upload a photo and we'll generate 4 different wear styles: Professional, Casual, Streetwear, and Dinner
          </p>

          <div className="upload-section">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input"
              aria-label="Upload image"
            />
            <label htmlFor="image-upload" className="upload-label">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Click to upload or drag and drop</span>
              <span className="upload-hint">PNG, JPG, GIF up to 10MB</span>
            </label>

            {uploadedImageUrl && (
              <div className="preview-section">
                <img src={uploadedImageUrl} alt="Uploaded preview" className="uploaded-preview" />
                <Button
                  onClick={generateStyledVersions}
                  loading={loading}
                  className="btn-full-width"
                  size="lg"
                  variant="primary"
                >
                  Generate 4 Style Variations
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Render style selection step
  if (currentStep === 'style-selection') {
    return (
      <div className="image-form-container">
        <Card className="form-card selection-card">
          <h2 className="form-title">
            <span className="title-icon">🎨</span>
            Choose Your Style
          </h2>
          <p className="form-subtitle">
            Select the style that interests you for detailed breakdown
          </p>

          <div className="styles-grid">
            {styledImages.map((styleObj, index) => (
              <div 
                key={index} 
                className="style-card-selector"
                onClick={() => handleStyleSelect(styleObj)}
                role="button"
                tabIndex={0}
                aria-label={`Select ${styleObj.style} style`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleStyleSelect(styleObj);
                  }
                }}
              >
                <img 
                  src={styleObj.imageUrl} 
                  alt={`${styleObj.style} style preview`}
                  className="style-image"
                />
                <div className="style-label">{styleObj.style}</div>
                <div className="style-overlay">
                  <span>Select</span>
                </div>
              </div>
            ))}
          </div>

          <Button 
            onClick={handleReset} 
            variant="secondary"
            className="btn-full-width"
            size="lg"
          >
            Start Over
          </Button>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Analyzing your selected style...</p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Render fullscreen analysis step
  if (currentStep === 'fullscreen-analysis') {
    return (
      <div className="fullscreen-analysis">
        <button 
          onClick={handleReset} 
          className="btn-close"
          aria-label="Close analysis"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="fullscreen-content">
          <div className="fullscreen-image-section">
            <img 
              src={selectedStyle?.imageUrl} 
              alt="Selected style analysis"
              className="fullscreen-image"
            />
            <Badge variant="primary" size="lg" className="style-badge">
              {selectedStyle?.style}
            </Badge>
          </div>

          <div className="analysis-panel">
            <h2 className="analysis-title">
              <span className="title-icon">🔍</span>
              Outfit Breakdown
            </h2>

            {analysisResult && (
              <>
                {/* AI Fashion Analysis */}
                {(analysisResult.aiDescription || analysisResult.aiStylingTips) && (
                  <div className="ai-analysis-section">
                    <h3 className="section-title">
                      <span className="title-icon">🤖</span>
                      AI Fashion Analysis
                    </h3>
                    {analysisResult.aiDescription && (
                      <div className="ai-analysis-text">
                        {analysisResult.aiDescription}
                      </div>
                    )}
                    {analysisResult.aiStylingTips && analysisResult.aiStylingTips.length > 0 && (
                      <div className="ai-styling-tips">
                        <h4 className="tips-subtitle">Styling Tips:</h4>
                        <ul className="tips-list">
                          {analysisResult.aiStylingTips.map((tip, idx) => (
                            <li key={idx} className="tip-item">
                              <span className="tip-number">{idx + 1}</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="analysis-summary">
                  <div className="summary-card">
                    <span className="summary-label">Total Items</span>
                    <span className="summary-value">{analysisResult.items.length}</span>
                  </div>
                  <div className="summary-card">
                    <span className="summary-label">Estimated Total</span>
                    <span className="summary-value">${analysisResult.totalEstimatedPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="items-list">
                  {analysisResult.items.map((item) => (
                    <div key={item.id} className="item-card">
                      <div className="item-header">
                        <h3 className="item-name">{item.name}</h3>
                        <Badge variant="primary">{item.category}</Badge>
                      </div>
                      <div className="item-details">
                        <div className="item-type">{item.type}</div>
                        <div className="item-price">${item.estimatedPrice.toFixed(2)}</div>
                      </div>
                      <div className="item-confidence">
                        <div className="confidence-bar-bg">
                          <div 
                            className="confidence-bar-fill"
                            style={{ width: `${item.confidenceScore * 100}%` }}
                          ></div>
                        </div>
                        <span className="confidence-text">
                          {(item.confidenceScore * 100).toFixed(0)}% match
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
