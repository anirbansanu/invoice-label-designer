const fs = require('fs');
const path = require('path');

// Your directory and file structure
const structure = [
  'src/components/App.js',
  'src/components/Canvas/CanvasArea.js',
  'src/components/Canvas/GridOverlay.js',
  'src/components/Canvas/GuideRuler.js',
  'src/components/Canvas/SelectionBox.js',
  'src/components/Canvas/ContextMenu.js',
  'src/components/Layout/Toolbar.js',
  'src/components/Layout/SidebarLeft.js',
  'src/components/Layout/SidebarRight.js',
  'src/components/Layout/StatusBar.js',
  'src/components/Panels/LayerManager.js',
  'src/components/Panels/ElementProperties.js',
  'src/components/Panels/TemplateLibrary.js',
  'src/components/Panels/ImageLibrary.js',
  'src/components/Panels/PageManager.js',
  'src/components/Dialogs/ExportDialog.js',
  'src/components/Dialogs/ImportDialog.js',
  'src/components/Dialogs/TableEditor.js',
  'src/components/Dialogs/ImageUpload.js',
  'src/components/Dialogs/GridSettings.js',
  'src/components/Common/ColorPicker.js',
  'src/components/Common/FontPicker.js',
  'src/components/Common/NumberInput.js',
  'src/components/Common/IconButton.js',
  'src/elements/BaseElement.js',
  'src/elements/TextElement.js',
  'src/elements/TableElement.js',
  'src/elements/ImageElement.js',
  'src/elements/ShapeElement.js',
  'src/elements/BarcodeElement.js',
  'src/elements/QRCodeElement.js',
  'src/elements/StampElement.js',
  'src/elements/GroupElement.js',
  'src/hooks/useCanvas.js',
  'src/hooks/useKeyboardShortcuts.js',
  'src/hooks/useSnapToGrid.js',
  'src/hooks/useHistory.js',
  'src/hooks/useClipboard.js',
  'src/hooks/useImageUpload.js',
  'src/hooks/useAccessibility.js',
  'src/utils/canvasUtils.js',
  'src/utils/exportUtils.js',
  'src/utils/importUtils.js',
  'src/utils/placeholderParser.js',
  'src/utils/templateEngine.js',
  'src/utils/performanceOptimizer.js',
  'src/utils/accessibility.js',
  'src/context/CanvasContext.js',
  'src/context/ThemeContext.js',
  'src/context/AccessibilityContext.js',
  'src/data/templates.js',
  'src/data/sampleData.js',
  'src/data/defaultShapes.js',
  'src/styles/App.css',
  'src/styles/themes.css',
  'src/styles/accessibility.css',
  'src/styles/responsive.css',
  'src/workers/exportWorker.js',
  'src/workers/imageProcessor.js',
  'src/index.js',
];

// Create directories and empty files
structure.forEach(filePath => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
    console.log(`📄 Created file: ${filePath}`);
  }
});
