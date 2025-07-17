import React, { useState } from 'react';
import { Card, Button, Row, Col, Form, InputGroup, Badge } from 'react-bootstrap';
import { useCanvas } from '../../context/CanvasContext';

const ImageLibrary = () => {
  const { images, addElement, dispatch } = useCanvas();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const filteredImages = images.filter(image => 
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return b.size - a.size;
      case 'date':
        return new Date(b.created) - new Date(a.created);
      default:
        return 0;
    }
  });

  const addImageToCanvas = (image) => {
    addElement({
      type: 'image',
      x: 100,
      y: 100,
      width: Math.min(image.width, 300),
      height: Math.min(image.height, 300),
      src: image.src,
      originalWidth: image.width,
      originalHeight: image.height
    });
  };

  const deleteImage = (imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      dispatch({ type: 'DELETE_IMAGE', payload: imageId });
    }
  };

  const duplicateImage = (image) => {
    dispatch({ 
      type: 'ADD_IMAGE', 
      payload: {
        ...image,
        id: `${image.id}_copy_${Date.now()}`,
        name: `${image.name} (Copy)`
      }
    });
  };

  if (images.length === 0) {
    return (
      <div className="image-library p-3">
        <div className="empty-state text-center">
          <i className="fas fa-images fa-3x text-muted mb-3"></i>
          <p className="text-muted">No images uploaded yet</p>
          <p className="text-muted">Upload images to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="image-library p-3">
      {/* Search and Sort */}
      <div className="mb-3">
        <InputGroup size="sm" className="mb-2">
          <InputGroup.Text>
            <i className="fas fa-search"></i>
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        
        <Form.Select
          size="sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sort by Name</option>
          <option value="size">Sort by Size</option>
          <option value="date">Sort by Date</option>
        </Form.Select>
      </div>

      {/* Images Grid */}
      <Row xs={2} md={3} lg={4} className="g-2">
        {filteredImages.map((image) => (
          <Col key={image.id}>
            <Card className="image-card h-100">
              <div className="image-thumbnail position-relative">
                <Card.Img
                  variant="top"
                  src={image.thumbnail || image.src}
                  style={{ 
                    height: '100px', 
                    objectFit: 'cover',
                    cursor: 'pointer'
                  }}
                  onClick={() => addImageToCanvas(image)}
                />
                <div className="image-overlay position-absolute top-0 end-0 p-1">
                  <Badge bg="dark" className="opacity-75">
                    {Math.round(image.size / 1024)}KB
                  </Badge>
                </div>
              </div>
              
              <Card.Body className="p-2">
                <Card.Title className="fs-6 mb-1 text-truncate" title={image.name}>
                  {image.name}
                </Card.Title>
                <Card.Text className="small text-muted mb-2">
                  {image.width} × {image.height}
                </Card.Text>
                
                <div className="d-flex gap-1">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => addImageToCanvas(image)}
                    className="flex-grow-1"
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
      
      {filteredImages.length === 0 && searchTerm && (
        <div className="text-center text-muted p-3">
          <i className="fas fa-search fa-2x mb-2"></i>
          <p>No images found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default ImageLibrary;
