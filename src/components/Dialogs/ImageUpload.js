import React, { useState, useCallback, useRef } from 'react';
import { Modal, Button, Form, Card, Row, Col, ProgressBar } from 'react-bootstrap';
import { useCanvas } from '../../context/CanvasContext';
import { useImageUpload } from '../../hooks/useImageUpload';

const ImageUpload = ({ show, onHide }) => {
  const { images, addElement, dispatch } = useCanvas();
  const { uploadImage, uploadProgress } = useImageUpload();
  const fileInputRef = useRef();
  
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadMode, setUploadMode] = useState('single'); // 'single' or 'multiple'
  const [cropSettings, setCropSettings] = useState({ enabled: false, aspectRatio: null });
  const [filterSettings, setFilterSettings] = useState({ brightness: 100, contrast: 100, saturation: 100 });

  const handleFileSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        try {
          const imageData = await uploadImage(file, {
            maxWidth: 2000,
            maxHeight: 2000,
            quality: 0.8,
            crop: cropSettings.enabled ? cropSettings : null,
            filters: filterSettings
          });
          
          dispatch({ type: 'ADD_IMAGE', payload: imageData });
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    }
  }, [uploadImage, cropSettings, filterSettings, dispatch]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    // Simulate file input change
    const input = fileInputRef.current;
    if (input) {
      Object.defineProperty(input, 'files', {
        value: files,
        writable: false
      });
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, []);

  const addImageToCanvas = useCallback((image) => {
    addElement({
      type: 'image',
      x: 100,
      y: 100,
      width: image.width || 200,
      height: image.height || 200,
      src: image.src,
      originalWidth: image.originalWidth,
      originalHeight: image.originalHeight,
      filters: image.filters
    });
    
    onHide();
  }, [addElement, onHide]);

  const deleteImage = useCallback((imageId) => {
    dispatch({ 
      type: 'DELETE_IMAGE', 
      payload: imageId 
    });
  }, [dispatch]);

  const duplicateImage = useCallback((image) => {
    dispatch({ 
      type: 'ADD_IMAGE', 
      payload: {
        ...image,
        id: `${image.id}_copy_${Date.now()}`,
        name: `${image.name} (Copy)`
      }
    });
  }, [dispatch]);

  const applyImageEffects = useCallback((imageId, effects) => {
    dispatch({
      type: 'UPDATE_IMAGE',
      payload: { id: imageId, effects }
    });
  }, [dispatch]);

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Image Library & Upload</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* Upload Section */}
        <div className="mb-4">
          <h6>Upload Images</h6>
          
          {/* Upload Mode Selection */}
          <Form.Group className="mb-3">
            <Form.Label>Upload Mode</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                name="uploadMode"
                id="single-upload"
                label="Single Image"
                checked={uploadMode === 'single'}
                onChange={() => setUploadMode('single')}
              />
              <Form.Check
                inline
                type="radio"
                name="uploadMode"
                id="multiple-upload"
                label="Multiple Images"
                checked={uploadMode === 'multiple'}
                onChange={() => setUploadMode('multiple')}
              />
            </div>
          </Form.Group>

          {/* Upload Area */}
          <div
            className="upload-area border-dashed border-2 border-secondary p-4 text-center mb-3"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{ 
              borderStyle: 'dashed',
              backgroundColor: '#f8f9fa',
              cursor: 'pointer'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="fas fa-cloud-upload-alt fa-3x text-secondary mb-2"></i>
            <p className="mb-0">Drop images here or click to browse</p>
            <small className="text-muted">Supports JPG, PNG, GIF, WebP</small>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={uploadMode === 'multiple'}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} />
          )}

          {/* Image Processing Options */}
          <div className="row mt-3">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Crop Settings</Form.Label>
                <Form.Check
                  type="checkbox"
                  label="Enable auto-crop"
                  checked={cropSettings.enabled}
                  onChange={(e) => setCropSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                />
                {cropSettings.enabled && (
                  <Form.Select 
                    value={cropSettings.aspectRatio || ''}
                    onChange={(e) => setCropSettings(prev => ({ ...prev, aspectRatio: e.target.value }))}
                  >
                    <option value="">Free aspect ratio</option>
                    <option value="1:1">Square (1:1)</option>
                    <option value="4:3">Standard (4:3)</option>
                    <option value="16:9">Widescreen (16:9)</option>
                    <option value="3:2">Photo (3:2)</option>
                  </Form.Select>
                )}
              </Form.Group>
            </div>
            
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Image Filters</Form.Label>
                <div className="mb-2">
                  <Form.Label>Brightness: {filterSettings.brightness}%</Form.Label>
                  <Form.Range
                    min={0}
                    max={200}
                    value={filterSettings.brightness}
                    onChange={(e) => setFilterSettings(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="mb-2">
                  <Form.Label>Contrast: {filterSettings.contrast}%</Form.Label>
                  <Form.Range
                    min={0}
                    max={200}
                    value={filterSettings.contrast}
                    onChange={(e) => setFilterSettings(prev => ({ ...prev, contrast: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="mb-2">
                  <Form.Label>Saturation: {filterSettings.saturation}%</Form.Label>
                  <Form.Range
                    min={0}
                    max={200}
                    value={filterSettings.saturation}
                    onChange={(e) => setFilterSettings(prev => ({ ...prev, saturation: parseInt(e.target.value) }))}
                  />
                </div>
              </Form.Group>
            </div>
          </div>
        </div>

        {/* Image Library */}
        <div>
          <h6>Image Library ({images.length} images)</h6>
          
          {images.length === 0 ? (
            <div className="text-center text-muted p-4">
              <i className="fas fa-images fa-3x mb-2"></i>
              <p>No images uploaded yet. Upload some images to get started.</p>
            </div>
          ) : (
            <Row>
              {images.map((image, index) => (
                <Col key={image.id} md={4} lg={3} className="mb-3">
                  <Card className="image-card">
                    <Card.Img
                      variant="top"
                      src={image.thumbnail || image.src}
                      style={{ height: '150px', objectFit: 'cover' }}
                    />
                    <Card.Body className="p-2">
                      <Card.Title className="fs-6 mb-1">{image.name}</Card.Title>
                      <Card.Text className="small text-muted">
                        {image.width} × {image.height}
                        <br />
                        {(image.size / 1024).toFixed(1)} KB
                      </Card.Text>
                      
                      <div className="d-flex gap-1">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => addImageToCanvas(image)}
                        >
                          <i className="fas fa-plus"></i>
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => duplicateImage(image)}
                        >
                          <i className="fas fa-copy"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => deleteImage(image.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageUpload;
