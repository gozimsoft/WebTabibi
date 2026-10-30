import React from 'react';
import { App as KnowledgeBaseApp } from '../knowledge/App';
import '../knowledge/styles/kb.css';

export default function KnowledgeBasePage() {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <KnowledgeBaseApp />
    </div>
  );
}
