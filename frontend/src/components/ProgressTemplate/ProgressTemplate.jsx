import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import progressTemplateService from '../../services/progressTemplateService';
import ProgressTemplateForm from './ProgressTemplateForm';
import ProgressTemplateList from './ProgressTemplateList';
import './ProgressTemplate.css';

const ProgressTemplate = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, [user?.id]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await progressTemplateService.getTemplates();
      setTemplates(data);
      setError('');
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to fetch progress templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (templateData) => {
    try {
      const newTemplate = await progressTemplateService.createTemplate(templateData);
      setTemplates([...templates, newTemplate]);
      setShowForm(false);
      setError('');
    } catch (err) {
      setError('Failed to create progress template');
    }
  };

  const handleUpdateTemplate = async (id, templateData) => {
    try {
      const updatedTemplate = await progressTemplateService.updateTemplate(id, templateData);
      setTemplates(templates.map(t => t.id === id ? updatedTemplate : t));
      setSelectedTemplate(null);
      setError('');
    } catch (err) {
      setError('Failed to update progress template');
    }
  };

  const handleDeleteTemplate = async (id) => {
    try {
      await progressTemplateService.deleteTemplate(id);
      setTemplates(templates.filter(t => t.id !== id));
      setError('');
    } catch (err) {
      setError('Failed to delete progress template');
    }
  };

  if (loading) {
    return <div className="progress-template-loading">Loading...</div>;
  }

  return (
    <div className="progress-template-container">
      <div className="progress-template-header">
        <h2>Progress Templates</h2>
        <button 
          className="progress-template-create-btn"
          onClick={() => setShowForm(true)}
        >
          Create New Template
        </button>
      </div>

      {error && (
        <div className="progress-template-error">
          {error}
        </div>
      )}

      {showForm && (
        <ProgressTemplateForm
          onSubmit={handleCreateTemplate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {selectedTemplate && (
        <ProgressTemplateForm
          template={selectedTemplate}
          onSubmit={(data) => handleUpdateTemplate(selectedTemplate.id, data)}
          onCancel={() => setSelectedTemplate(null)}
        />
      )}

      <ProgressTemplateList
        templates={templates}
        onEdit={setSelectedTemplate}
        onDelete={handleDeleteTemplate}
      />
    </div>
  );
};

export default ProgressTemplate; 