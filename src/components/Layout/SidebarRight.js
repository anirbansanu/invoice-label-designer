import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import ElementProperties from '../Panels/ElementProperties';
import ImageLibrary from '../Panels/ImageLibrary';
import IconButton from '../Common/IconButton';
import { useCanvas } from '../../context/CanvasContext';

const SidebarRight = ({ collapsed, onToggle }) => {
  const { selectedElements } = useCanvas();
  const [activeTab, setActiveTab] = useState('properties');

   const addElement = (type) => {
    const elementDefaults = {
      text: {
        type: 'text',
        x: 100,
        y: 100,
        width: 200,
        height: 30,
        text: 'Sample Text',
        fontSize: 16,
        fontFamily: 'Arial',
        fill: '#000000',
        align: 'left'
      },
      rectangle: {
        type: 'rectangle',
        x: 150,
        y: 150,
        width: 100,
        height: 100,
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 1
      },
      circle: {
        type: 'circle',
        x: 200,
        y: 200,
        radius: 50,
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 1
      },
      table: {
        type: 'table',
        x: 250,
        y: 250,
        width: 400,
        height: 200,
        columns: [
          { header: 'Product', width: 200 },
          { header: 'Quantity', width: 100 },
          { header: 'Price', width: 100 }
        ],
        rows: [
          ['{{product.name}}', '{{product.quantity}}', '{{product.price}}']
        ]
      },
      barcode: {
        type: 'barcode',
        x: 300,
        y: 300,
        width: 200,
        height: 50,
        value: '{{product.sku}}',
        format: 'CODE128'
      },
      qrcode: {
        type: 'qrcode',
        x: 350,
        y: 350,
        size: 100,
        value: '{{invoice.number}}'
      }
    };

    // dispatch({
    //   type: 'ADD_ELEMENT',
    //   payload: elementDefaults[type]
    // });
  };


  return (
    <div className={`sidebar-right ${collapsed ? 'collapsed' : ''}`} style={{ width: collapsed ? '50px' : '420px' }}>
      <div className="sidebar-header p-2 border-bottom">
        <div className="d-flex align-items-center justify-content-between">
          <IconButton
            icon={collapsed ? 'chevron-left' : 'chevron-right'}
            onClick={onToggle}
            tooltip={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            variant="outline-secondary"
            size="sm"
          />
          <h6 className={`mb-0 ${collapsed ? 'd-none' : ''}`}>Properties</h6>
        </div>
      </div>

      {!collapsed && (
        <div className="sidebar-content">
          <Tabs
            activeKey={activeTab}
            onSelect={setActiveTab}
            className="nav-tabs-sm"
          >
            <Tab 
              eventKey="properties" 
              title={
                <>
                  <i className="fas fa-cog me-1"></i> 
                  Properties
                  {selectedElements.length > 0 && (
                    <span className="badge bg-primary ms-1">{selectedElements.length}</span>
                  )}
                </>
              }
            >
              <ElementProperties />
            </Tab>
            
            <Tab eventKey="images" title={<><i className="fas fa-images me-1"></i> Images</>}>
              <ImageLibrary />
            </Tab>
            
            <Tab eventKey="data" title={<><i className="fas fa-database me-1"></i> Widget </>}>
              <div className="p-3">
                <h6>Sample Data</h6>
                <p className="text-muted">Configure dynamic data placeholders</p>
                {/* Data management panel would go here */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <div >
                    <IconButton style={{ height: '100px', width: '100px', fontSize: '50px' }}
                      icon="font"
                      tooltip="Add Text"
                      onClick={() => addElement('text')}
                    />
                  </div>
                  <div style={{ height: '100px' }}>
                    <IconButton style={{ height: '100px', width: '100px', fontSize: '50px' }}
                      icon="square"
                      tooltip="Add Rectangle"
                      onClick={() => addElement('rectangle')}
                    />
                  </div>
                  <div style={{ height: '100px' }}>
                    <IconButton style={{ height: '100px', width: '100px', fontSize: '50px' }}
                      icon="circle"
                      tooltip="Add Circle"
                      onClick={() => addElement('circle')}
                    />
                  </div>
                  <div style={{ height: '100px' }}>
                    <IconButton style={{ height: '100px', width: '100px', fontSize: '50px' }}
                      icon="table"
                      tooltip="Add Table"
                      onClick={() => addElement('table')}
                    />
                  </div>
                  <div style={{ height: '100px' }}>
                    <IconButton style={{ height: '100px', width: '100px', fontSize: '50px' }}
                      icon="barcode"
                      tooltip= "Add Barcode"
                      onClick={() => addElement('barcode')}
                    />
                  </div>
                </div>
              </div>
            </Tab>
          </Tabs>
        </div>
      )}

      {collapsed && (
        <div className="sidebar-collapsed-content">
          <div className="d-flex flex-column gap-2 p-2">
            <IconButton
              icon="cog"
              tooltip="Properties"
              variant={activeTab === 'properties' ? 'primary' : 'outline-secondary'}
              onClick={() => {
                setActiveTab('properties');
                onToggle();
              }}
            />
            <IconButton
              icon="images"
              tooltip="Images"
              variant={activeTab === 'images' ? 'primary' : 'outline-secondary'}
              onClick={() => {
                setActiveTab('images');
                onToggle();
              }}
            />
            <IconButton
              icon="database"
              tooltip="Data"
              variant={activeTab === 'data' ? 'primary' : 'outline-secondary'}
              onClick={() => {
                setActiveTab('data');
                onToggle();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarRight;
