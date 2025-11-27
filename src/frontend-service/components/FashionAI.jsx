import { useState } from 'react';
import { Button, Card, Badge } from './ui';
import './styles.css';

export default function FashionAI() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('formal');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [fashionDescription, setFashionDescription] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('describe'); // 'describe' or 'analyze'

  const styles = [
    { value: 'formal', label: '👔 Formal', emoji: '👔' },
    { value: 'casual', label: '👕 Casual', emoji: '👕' },
    { value: 'professional', label: '💼 Professional', emoji: '💼' },
    { value: 'streetwear', label: '🎨 Streetwear', emoji: '🎨' },
    { value: 'elegant', label: '✨ Elegant', emoji: '✨' },
    { value: 'sporty', label: '⚡ Sporty', emoji: '⚡' }
  ];

  const samplePrompts = [
    'elegant woman in a red evening dress',
    'man in tailored navy suit with tie',
    'casual summer outfit with denim jacket',
    'professional business attire for office',
    'bohemian style flowing maxi dress',
    'trendy streetwear with sneakers'
  ];

  // Generate AI Fashion Description
  const handleGenerateDescription = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a fashion description');
      return;
    }

    setLoading(true);
    setError('');
    setFashionDescription(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          style: selectedStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate fashion description');
      }

      if (data.description) {
        setFashionDescription({
          description: data.description,
          stylingTips: data.stylingTips || [],
          imageUrl: data.imageUrl,
          isPlaceholder: data.isPlaceholder,
          prompt: prompt,
          style: selectedStyle
        });
      } else {
        throw new Error('No fashion description returned');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error generating fashion description:', err);
    } finally {
      setLoading(false);
    }
  };

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

  // Analyze uploaded image
  const handleAnalyzeImage = async () => {
    if (!uploadedImageUrl) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: uploadedImageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze image');
      }

      setAnalysisResult(data);
    } catch (err) {
      setError(err.message);
      console.error('Error analyzing image:', err);
    } finally {
      setLoading(false);
    }
  };

  const getColorForCategory = (category) => {
    const colors = {
      'Shirt': '#3b82f6',
      'Trousers': '#8b5cf6',
      'Footwear': '#ef4444',
      'Accessories': '#f59e0b',
      'Jacket': '#10b981',
      'Dress': '#ec4899'
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div className="fashion-ai-container">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'describe' ? 'active' : ''}`}
          onClick={() => setActiveTab('describe')}
        >
          <span className="tab-icon">✨</span>
          AI Fashion Description
        </button>
        <button
          className={`tab-button ${activeTab === 'analyze' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyze')}
        >
          <span className="tab-icon">🔍</span>
          Image Analysis
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* AI Fashion Description Tab */}
      {activeTab === 'describe' && (
        <div className="tab-content">
          <Card className="input-card">
            <h2 className="section-title">
              <span className="title-icon">✨</span>
              Generate AI Fashion Description
            </h2>
            <p className="section-description">
              Describe your dream outfit and let AI create detailed fashion descriptions with styling tips
            </p>

            <form onSubmit={handleGenerateDescription} className="fashion-form">
              {/* Prompt Input */}
              <div className="form-group">
                <label htmlFor="prompt" className="form-label">
                  Fashion Description
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., elegant woman in a red evening dress"
                  className="form-textarea"
                  rows="4"
                  disabled={loading}
                />
              </div>

              {/* Sample Prompts */}
              <div className="sample-prompts">
                <p className="sample-label">Try these:</p>
                <div className="sample-grid">
                  {samplePrompts.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="sample-chip"
                      onClick={() => setPrompt(sample)}
                      disabled={loading}
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Selection */}
              <div className="form-group">
                <label className="form-label">Style</label>
                <div className="style-grid">
                  {styles.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      className={`style-button ${selectedStyle === style.value ? 'selected' : ''}`}
                      onClick={() => setSelectedStyle(style.value)}
                      disabled={loading}
                    >
                      <span className="style-emoji">{style.emoji}</span>
                      <span className="style-label">{style.label.replace(/^.*\s/, '')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="generate-button"
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    Generate Description
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* AI Generated Description */}
          {fashionDescription && (
            <Card className="result-card fade-in">
              <div className="result-header">
                <h3 className="result-title">
                  <span className="result-icon">👗</span>
                  AI Fashion Description
                </h3>
                <Badge className="style-badge">{selectedStyle}</Badge>
              </div>

              {/* Fashion Image */}
              {fashionDescription.imageUrl && (
                <div className="fashion-image-container">
                  <img 
                    src={fashionDescription.imageUrl} 
                    alt={fashionDescription.prompt}
                    className="fashion-image"
                    loading="lazy"
                  />
                  {fashionDescription.isPlaceholder && (
                    <div className="placeholder-badge">
                      <span className="badge-icon">ℹ️</span>
                      Stock photo - AI image generation coming soon
                    </div>
                  )}
                </div>
              )}

              <div className="description-box">
                <p className="description-text">{fashionDescription.description}</p>
              </div>

              {fashionDescription.stylingTips && fashionDescription.stylingTips.length > 0 && (
                <div className="styling-tips">
                  <h4 className="tips-title">
                    <span className="tips-icon">💡</span>
                    Styling Tips
                  </h4>
                  <ul className="tips-list">
                    {fashionDescription.stylingTips.map((tip, idx) => (
                      <li key={idx} className="tip-item">
                        <span className="tip-number">{idx + 1}</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="result-meta">
                <span className="meta-label">Prompt:</span>
                <span className="meta-value">{fashionDescription.prompt}</span>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Image Analysis Tab */}
      {activeTab === 'analyze' && (
        <div className="tab-content">
          <Card className="input-card">
            <h2 className="section-title">
              <span className="title-icon">🔍</span>
              Analyze Fashion Image
            </h2>
            <p className="section-description">
              Upload a fashion photo to get AI-powered analysis of clothing items and estimated prices
            </p>

            {/* Image Upload */}
            <div className="upload-section">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
                disabled={loading}
              />
              <label htmlFor="image-upload" className="upload-label">
                {uploadedImageUrl ? (
                  <div className="uploaded-preview">
                    <img src={uploadedImageUrl} alt="Uploaded" className="preview-image" />
                    <div className="upload-overlay">
                      <span>📷 Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <span className="upload-icon">📷</span>
                    <span className="upload-text">Click to upload fashion image</span>
                    <span className="upload-hint">PNG, JPG up to 10MB</span>
                  </div>
                )}
              </label>
            </div>

            {/* Analyze Button */}
            {uploadedImageUrl && (
              <Button
                onClick={handleAnalyzeImage}
                disabled={loading}
                className="analyze-button"
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    Analyze Image
                  </>
                )}
              </Button>
            )}
          </Card>

          {/* Analysis Results */}
          {analysisResult && (
            <Card className="result-card fade-in">
              <div className="result-header">
                <h3 className="result-title">
                  <span className="result-icon">📊</span>
                  Analysis Results
                </h3>
                <div className="result-badges">
                  <Badge className="items-badge">{analysisResult.items?.length || 0} Items</Badge>
                  <Badge className="price-badge">
                    ${analysisResult.totalEstimatedPrice?.toFixed(2) || '0.00'}
                  </Badge>
                </div>
              </div>

              <div className="analysis-grid">
                {analysisResult.items && analysisResult.items.map((item, idx) => (
                  <div key={item.id || idx} className="item-card">
                    <div className="item-header">
                      <div className="item-icon" style={{ backgroundColor: getColorForCategory(item.category) }}>
                        {item.category === 'Shirt' && '👔'}
                        {item.category === 'Trousers' && '👖'}
                        {item.category === 'Footwear' && '👟'}
                        {item.category === 'Accessories' && '👜'}
                        {item.category === 'Jacket' && '🧥'}
                        {item.category === 'Dress' && '👗'}
                        {!['Shirt', 'Trousers', 'Footwear', 'Accessories', 'Jacket', 'Dress'].includes(item.category) && '👕'}
                      </div>
                      <div className="item-info">
                        <h4 className="item-name">{item.name}</h4>
                        <p className="item-type">{item.type}</p>
                      </div>
                    </div>
                    <div className="item-details">
                      <div className="item-category">
                        <Badge>{item.category}</Badge>
                      </div>
                      <div className="item-price">${item.estimatedPrice?.toFixed(2)}</div>
                    </div>
                    {item.confidenceScore && (
                      <div className="item-confidence">
                        <div className="confidence-bar">
                          <div
                            className="confidence-fill"
                            style={{ width: `${item.confidenceScore * 100}%` }}
                          ></div>
                        </div>
                        <span className="confidence-text">{(item.confidenceScore * 100).toFixed(0)}% confident</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="analysis-footer">
                <div className="total-price">
                  <span className="total-label">Total Estimated Price:</span>
                  <span className="total-amount">${analysisResult.totalEstimatedPrice?.toFixed(2)}</span>
                </div>
                <p className="analysis-timestamp">
                  Analyzed: {new Date(analysisResult.analysisTimestamp).toLocaleString()}
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
