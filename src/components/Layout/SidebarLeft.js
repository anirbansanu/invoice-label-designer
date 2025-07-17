import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import LayerManager from '../Panels/LayerManager';
import TemplateLibrary from '../Panels/TemplateLibrary';
import PageManager from '../Panels/PageManager';
import IconButton from '../Common/IconButton';

const SidebarLeft = ({ collapsed, onToggle }) => {
  const [activeTab, setActiveTab] = useState('layers');

  return (
    <div className={`sidebar-left ${collapsed ? 'collapsed' : ''}`} style={{ width: collapsed ? '50px' : '400px' }}>
      <div className="sidebar-header p-2 border-bottom">
        <div className="d-flex align-items-center justify-content-between">
          <h6 className={`mb-0 ${collapsed ? 'd-none' : ''}`}>Design Tools</h6>
          <IconButton
            icon={collapsed ? 'chevron-right' : 'chevron-left'}
            onClick={onToggle}
            tooltip={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            variant="outline-secondary"
            size="sm"
          />
        </div>
      </div>

      {!collapsed && (
        <div className="sidebar-content">
          <Tabs
            activeKey={activeTab}
            onSelect={setActiveTab}
            className="nav-tabs-sm"
          >
            <Tab eventKey="layers" title={<><i className="fas fa-layer-group me-1"></i> Layers</>}>
              <LayerManager />
            </Tab>
            
            <Tab eventKey="pages" title={<><i className="fas fa-file-alt me-1"></i> Pages</>}>
              <PageManager />
            </Tab>
            
            <Tab eventKey="templates" title={<><i className="fas fa-templates me-1"></i> Templates</>}>
              <TemplateLibrary />
            </Tab>
          </Tabs>
        </div>
      )}

      {collapsed && (
        <div className="sidebar-collapsed-content">
          <div className="d-flex flex-column gap-2 p-2">
            <IconButton
              icon="layer-group"
              tooltip="Layers"
              variant={activeTab === 'layers' ? 'primary' : 'outline-secondary'}
              onClick={() => {
                setActiveTab('layers');
                onToggle();
              }}
            />
            <IconButton
              icon="file-alt"
              tooltip="Pages"
              variant={activeTab === 'pages' ? 'primary' : 'outline-secondary'}
              onClick={() => {
                setActiveTab('pages');
                onToggle();
              }}
            />
            <IconButton
              icon="templates"
              tooltip="Templates"
              variant={activeTab === 'templates' ? 'primary' : 'outline-secondary'}
              onClick={() => {
                setActiveTab('templates');
                onToggle();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarLeft;
