import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import ElementProperties from '../Panels/ElementProperties';
import ImageLibrary from '../Panels/ImageLibrary';
import IconButton from '../Common/IconButton';
import { useCanvas } from '../../context/CanvasContext';

const SidebarRight = ({ collapsed, onToggle }) => {
  const { selectedElements } = useCanvas();
  const [activeTab, setActiveTab] = useState('properties');

  return (
    <div className={`sidebar-right ${collapsed ? 'collapsed' : ''}`} style={{ width: collapsed ? '50px' : '320px' }}>
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
            
            <Tab eventKey="data" title={<><i className="fas fa-database me-1"></i> Data</>}>
              <div className="p-3">
                <h6>Sample Data</h6>
                <p className="text-muted">Configure dynamic data placeholders</p>
                {/* Data management panel would go here */}
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
